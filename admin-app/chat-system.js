// MSN Messenger Style Chat System
class ChatSystem {
    constructor(currentUserId, firebaseConfig) {
        this.currentUserId = currentUserId;
        this.firebase = firebaseConfig;
        this.db = firebaseConfig.db;
        this.selectedContact = null;
        this.messagesUnsubscribe = null;
        this.contactsUnsubscribe = null;
        this.contacts = [];
    }

    async initialize() {
        console.log('Initializing Chat System...');
        await this.loadContacts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Message input - send on Enter
        const messageInput = document.getElementById('chatMessageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Close chat button
        const closeBtn = document.getElementById('chatCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeConversation());
        }

        // Emoji picker button
        const emojiBtn = document.getElementById('chatEmojiBtn');
        const emojiPanel = document.getElementById('chatEmojiPanel');
        if (emojiBtn && emojiPanel) {
            emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = emojiPanel.style.display === 'block';
                emojiPanel.style.display = isVisible ? 'none' : 'block';
            });

            // Emoji selection
            emojiPanel.querySelectorAll('.emoji-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const emoji = e.target.dataset.emoji;
                    const input = document.getElementById('chatMessageInput');
                    if (input && emoji) {
                        input.value += emoji;
                        input.focus();
                        emojiPanel.style.display = 'none';
                    }
                });
            });

            // Close emoji panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!emojiPanel.contains(e.target) && e.target !== emojiBtn) {
                    emojiPanel.style.display = 'none';
                }
            });
        }

        // Nudge/Buzz button
        const nudgeBtn = document.getElementById('chatNudgeBtn');
        if (nudgeBtn) {
            nudgeBtn.addEventListener('click', () => this.sendNudge());
        }

        // File attachment button
        const fileBtn = document.getElementById('chatFileBtn');
        const fileInput = document.getElementById('chatFileInput');
        if (fileBtn && fileInput) {
            fileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.sendFile(e.target.files[0]);
                    fileInput.value = ''; // Reset input
                }
            });
        }
    }

    async loadContacts() {
        try {
            console.log('Loading contacts...');
            const assistantsRef = this.db.collection('assistants');

            // Real-time listener for contacts
            this.contactsUnsubscribe = assistantsRef.onSnapshot((snapshot) => {
                this.contacts = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    // Don't include self
                    if (data.userId !== this.currentUserId) {
                        this.contacts.push({
                            id: doc.id,
                            ...data
                        });
                    }
                });

                this.renderContacts();
            });

        } catch (error) {
            console.error('Error loading contacts:', error);
            const contactsList = document.getElementById('chatContactsList');
            if (contactsList) {
                contactsList.innerHTML = `
                    <p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">
                        Error al cargar contactos
                    </p>
                `;
            }
        }
    }

    renderContacts() {
        const contactsList = document.getElementById('chatContactsList');
        if (!contactsList) return;

        if (this.contacts.length === 0) {
            contactsList.innerHTML = `
                <p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">
                    No hay contactos disponibles
                </p>
            `;
            return;
        }

        // Count online users
        const onlineCount = this.contacts.filter(c => c.isOnline).length;
        const onlineCountEl = document.getElementById('chatOnlineCount');
        if (onlineCountEl) {
            onlineCountEl.textContent = `${onlineCount} online`;
            onlineCountEl.className = `status-badge ${onlineCount > 0 ? 'online' : 'offline'}`;
        }

        // Sort: online first, then alphabetically
        const sortedContacts = [...this.contacts].sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            const nameA = a.name || a.username || a.email || '';
            const nameB = b.name || b.username || b.email || '';
            return nameA.localeCompare(nameB);
        });

        contactsList.innerHTML = sortedContacts.map(contact => {
            const initials = this.getInitials(contact.name || contact.username || contact.email);
            const displayName = contact.name || contact.username || contact.email;
            const role = this.getRoleDisplayName(contact.role);
            const isActive = this.selectedContact && this.selectedContact.userId === contact.userId;

            return `
                <div class="chat-contact-item ${isActive ? 'active' : ''}" data-user-id="${contact.userId}">
                    <div class="chat-contact-avatar">
                        ${initials}
                        <div class="status-indicator ${contact.isOnline ? 'online' : 'offline'}"></div>
                    </div>
                    <div class="chat-contact-info">
                        <div class="chat-contact-name">${displayName}</div>
                        <div class="chat-contact-status">
                            ${contact.isOnline ? '🟢 En línea' : '⚫ Desconectado'} • ${role}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        contactsList.querySelectorAll('.chat-contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                const contact = this.contacts.find(c => c.userId === userId);
                if (contact) {
                    this.openConversation(contact);
                }
            });
        });
    }

    openConversation(contact) {
        this.selectedContact = contact;

        // Hide welcome, show conversation
        const welcome = document.getElementById('chatWelcome');
        const conversation = document.getElementById('chatConversation');
        if (welcome) welcome.style.display = 'none';
        if (conversation) conversation.style.display = 'flex';

        // Update header
        const nameEl = document.getElementById('chatRecipientName');
        const roleEl = document.getElementById('chatRecipientRole');
        const statusEl = document.getElementById('chatRecipientStatus');

        if (nameEl) nameEl.textContent = contact.name || contact.username || contact.email;
        if (roleEl) roleEl.textContent = this.getRoleDisplayName(contact.role);
        if (statusEl) {
            statusEl.className = `status-indicator ${contact.isOnline ? 'online' : 'offline'}`;
        }

        // Load messages
        this.loadMessages();

        // Clear input
        const input = document.getElementById('chatMessageInput');
        if (input) {
            input.value = '';
            input.focus();
        }

        // Update contacts list to show active state
        this.renderContacts();
    }

    closeConversation() {
        this.selectedContact = null;

        // Show welcome, hide conversation
        const welcome = document.getElementById('chatWelcome');
        const conversation = document.getElementById('chatConversation');
        if (welcome) welcome.style.display = 'flex';
        if (conversation) conversation.style.display = 'none';

        // Unsubscribe from messages
        if (this.messagesUnsubscribe) {
            this.messagesUnsubscribe();
            this.messagesUnsubscribe = null;
        }

        // Update contacts list
        this.renderContacts();
    }

    loadMessages() {
        if (!this.selectedContact) return;

        // Unsubscribe from previous conversation
        if (this.messagesUnsubscribe) {
            this.messagesUnsubscribe();
        }

        const conversationId = this.getConversationId(this.currentUserId, this.selectedContact.userId);

        // Real-time listener for messages
        const messagesRef = this.db.collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'asc');

        this.messagesUnsubscribe = messagesRef.onSnapshot((snapshot) => {
            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            this.renderMessages(messages);
        });
    }

    renderMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
                    <i class="fas fa-comment-dots" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>No hay mensajes aún. ¡Envía el primero!</p>
                </div>
            `;
            return;
        }

        // Group messages by date
        const messagesByDate = this.groupMessagesByDate(messages);

        let html = '';
        for (const [date, msgs] of Object.entries(messagesByDate)) {
            html += `<div class="chat-date-divider"><span>${date}</span></div>`;

            msgs.forEach(msg => {
                const isSent = msg.senderId === this.currentUserId;
                const time = msg.createdAt?.toDate ?
                    msg.createdAt.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

                const initials = isSent ?
                    'Tú' :
                    this.getInitials(this.selectedContact.name || this.selectedContact.username || this.selectedContact.email);

                // Check message type
                const isNudge = msg.type === 'nudge';
                const isFile = msg.type === 'file';

                let messageContent = '';
                if (isFile && msg.file) {
                    // File message
                    const fileSize = this.formatFileSize(msg.file.size);
                    const fileIcon = this.getFileIcon(msg.file.type || msg.file.name);
                    messageContent = `
                        <div class="chat-message-bubble">
                            <div class="chat-message-file" data-url="${msg.file.url}" onclick="window.open('${msg.file.url}', '_blank')">
                                <i class="${fileIcon}"></i>
                                <div class="chat-message-file-info">
                                    <div class="chat-message-file-name">${msg.file.name}</div>
                                    <div class="chat-message-file-size">${fileSize}</div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Regular or nudge message
                    messageContent = `<div class="chat-message-bubble">${this.escapeHtml(msg.text)}</div>`;
                }

                html += `
                    <div class="chat-message ${isSent ? 'sent' : 'received'} ${isNudge ? 'nudge' : ''}">
                        <div class="chat-message-avatar">${initials}</div>
                        <div class="chat-message-content">
                            ${messageContent}
                            <div class="chat-message-time">${time}</div>
                        </div>
                    </div>
                `;

                // Trigger shake animation for received nudges
                if (isNudge && !isSent) {
                    setTimeout(() => {
                        const chatWindow = document.querySelector('.chat-window-panel');
                        if (chatWindow) {
                            chatWindow.classList.add('nudge');
                            setTimeout(() => chatWindow.classList.remove('nudge'), 500);
                        }
                    }, 100);
                }
            });
        }

        container.innerHTML = html;

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        if (!this.selectedContact) return;

        const input = document.getElementById('chatMessageInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        try {
            const conversationId = this.getConversationId(this.currentUserId, this.selectedContact.userId);

            await this.db.collection('messages').add({
                conversationId: conversationId,
                senderId: this.currentUserId,
                recipientId: this.selectedContact.userId,
                text: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            // Clear input
            input.value = '';
            input.focus();

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar mensaje: ' + error.message);
        }
    }

    async sendNudge() {
        if (!this.selectedContact) return;

        try {
            const conversationId = this.getConversationId(this.currentUserId, this.selectedContact.userId);

            // Send nudge message
            await this.db.collection('messages').add({
                conversationId: conversationId,
                senderId: this.currentUserId,
                recipientId: this.selectedContact.userId,
                text: '🔔 ¡Zumbido!',
                type: 'nudge',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            // Trigger local shake animation
            const chatWindow = document.querySelector('.chat-window-panel');
            if (chatWindow) {
                chatWindow.classList.add('nudge');
                setTimeout(() => chatWindow.classList.remove('nudge'), 500);
            }

        } catch (error) {
            console.error('Error sending nudge:', error);
            alert('Error al enviar zumbido: ' + error.message);
        }
    }

    async sendFile(file) {
        if (!this.selectedContact) return;
        if (!file) return;

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. Máximo 50MB.');
            return;
        }

        try {
            const conversationId = this.getConversationId(this.currentUserId, this.selectedContact.userId);

            // Show progress indicator
            const messagesContainer = document.getElementById('chatMessages');
            const progressId = 'upload-' + Date.now();
            const progressHtml = `
                <div id="${progressId}" class="file-upload-progress">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-file"></i>
                        <div style="flex: 1;">
                            <div style="color: white; font-size: 13px; margin-bottom: 4px;">Subiendo: ${file.name}</div>
                            <div class="file-upload-progress-bar">
                                <div class="file-upload-progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (messagesContainer) {
                messagesContainer.insertAdjacentHTML('beforeend', progressHtml);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            // Upload to B2 using existing function
            const uploadedFiles = await window.firebaseConfig.uploadFilesToB2(
                [file],
                conversationId,
                'chat-files',
                this.currentUserId
            );

            // Remove progress indicator
            const progressEl = document.getElementById(progressId);
            if (progressEl) progressEl.remove();

            if (uploadedFiles && uploadedFiles.length > 0) {
                const uploadedFile = uploadedFiles[0];

                // Send file message
                await this.db.collection('messages').add({
                    conversationId: conversationId,
                    senderId: this.currentUserId,
                    recipientId: this.selectedContact.userId,
                    text: '📎 Archivo adjunto',
                    type: 'file',
                    file: {
                        name: uploadedFile.fileName,
                        url: uploadedFile.downloadURL,
                        size: file.size,
                        type: file.type
                    },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                });
            }

        } catch (error) {
            console.error('Error sending file:', error);
            // Remove progress indicator on error
            const progressEl = document.getElementById('upload-' + Date.now());
            if (progressEl) progressEl.remove();
            alert('Error al enviar archivo: ' + error.message);
        }
    }

    getConversationId(user1Id, user2Id) {
        // Create consistent conversation ID regardless of order
        return [user1Id, user2Id].sort().join('_');
    }

    groupMessagesByDate(messages) {
        const groups = {};

        messages.forEach(msg => {
            if (!msg.createdAt?.toDate) return;

            const date = msg.createdAt.toDate();
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey;
            if (this.isSameDay(date, today)) {
                dateKey = 'Hoy';
            } else if (this.isSameDay(date, yesterday)) {
                dateKey = 'Ayer';
            } else {
                dateKey = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });

        return groups;
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getRoleDisplayName(role) {
        const roles = {
            'graphic_designer': 'Diseñador Gráfico',
            'community_manager': 'Community Manager',
            'project_manager': 'Project Manager',
            'video_editor': 'Editor de Video',
            'content_creator': 'Creador de Contenido'
        };
        return roles[role] || role || 'Usuario';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getFileIcon(fileType) {
        if (!fileType) return 'fas fa-file';

        if (fileType.includes('image')) return 'fas fa-file-image';
        if (fileType.includes('video')) return 'fas fa-file-video';
        if (fileType.includes('audio')) return 'fas fa-file-audio';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
        if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'fas fa-file-archive';
        if (fileType.includes('text')) return 'fas fa-file-alt';

        return 'fas fa-file';
    }

    destroy() {
        if (this.messagesUnsubscribe) {
            this.messagesUnsubscribe();
        }
        if (this.contactsUnsubscribe) {
            this.contactsUnsubscribe();
        }
    }
}

// Export
window.ChatSystem = ChatSystem;
