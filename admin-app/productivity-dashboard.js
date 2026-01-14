// Productivity Dashboard Module
// Handles all productivity tracking visualization and data

class ProductivityDashboard {
    constructor(firebaseConfig) {
        this.firebase = firebaseConfig;
        this.currentUserId = null;
        this.currentPeriod = 'today';
        this.unsubscribes = [];

        this.init();
    }

    init() {
        // Initialize event listeners
        const userSelect = document.getElementById('productivityUserSelect');
        const periodSelect = document.getElementById('productivityPeriodSelect');
        const refreshBtn = document.getElementById('refreshProductivityBtn');

        if (userSelect) {
            userSelect.addEventListener('change', (e) => {
                this.currentUserId = e.target.value;
                if (this.currentUserId) {
                    this.loadProductivityData();
                }
            });
        }

        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                if (this.currentUserId) {
                    this.loadProductivityData();
                }
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.currentUserId) {
                    this.loadProductivityData();
                }
            });
        }

        // Setup edit hours form
        const editHoursForm = document.getElementById('editDailyHoursForm');
        if (editHoursForm) {
            editHoursForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveEditedHours();
            });
        }

        // Load assistants for dropdown
        this.loadAssistants();
    }

    async loadAssistants() {
        try {
            const assistantsRef = this.firebase.db.collection('assistants');
            const snapshot = await assistantsRef.get();

            const userSelect = document.getElementById('productivityUserSelect');
            if (!userSelect) return;

            // Clear existing options except first
            userSelect.innerHTML = '<option value="">Seleccionar...</option>';

            snapshot.forEach(doc => {
                const data = doc.data();
                const option = document.createElement('option');
                option.value = data.userId;
                option.textContent = `${data.name} (${data.email})`;
                userSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading assistants:', error);
        }
    }

    async loadProductivityData() {
        const container = document.getElementById('productivityContent');
        if (!container) return;

        // Show loading
        container.innerHTML = `
            <div class="productivity-loading">
                <div class="productivity-loading-spinner"></div>
                <div class="productivity-loading-text">Cargando datos de productividad...</div>
            </div>
        `;

        try {
            // Get date range
            const { startDate, endDate } = this.getDateRange(this.currentPeriod);

            // Load all data in parallel
            const [activityLogs, activityMetrics, screenshots, webActivity, appSessions, alerts, workSessions] = await Promise.all([
                this.getActivityLogs(this.currentUserId, startDate, endDate),
                this.getActivityMetrics(this.currentUserId, startDate, endDate),
                this.getScreenshots(this.currentUserId, startDate, endDate),
                this.getWebActivity(this.currentUserId, startDate, endDate),
                this.getAppSessions(this.currentUserId, startDate, endDate),
                this.getAlerts(this.currentUserId, startDate, endDate),
                this.getWorkSessions(this.currentUserId, startDate, endDate)
            ]);

            // Process and render data
            this.renderDashboard({
                activityLogs,
                activityMetrics,
                screenshots,
                webActivity,
                appSessions,
                alerts,
                workSessions
            });

        } catch (error) {
            console.error('Error loading productivity data:', error);

            // Check if it's an index error
            const isIndexError = error.message && error.message.includes('index');

            container.innerHTML = `
                <div class="productivity-empty">
                    <div class="productivity-empty-icon"><i class="fas fa-${isIndexError ? 'database' : 'exclamation-triangle'}"></i></div>
                    <div class="productivity-empty-text">
                        ${isIndexError
                    ? 'Creando índices de Firestore...<br><small style="font-size: 12px; opacity: 0.7;">Esto puede tomar 1-2 minutos. Haz clic en los links de la consola para crear los índices.</small>'
                    : 'Error al cargar los datos'}
                    </div>
                </div>
            `;
        }
    }

    getDateRange(period) {
        const now = new Date();
        let startDate, endDate;

        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as first day
                startDate = new Date(now);
                startDate.setDate(now.getDate() - diff);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                break;
            case 'daily':
                // Show last 30 days for daily breakdown
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 29);
                startDate.setHours(0, 0, 0, 0);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }

        return { startDate, endDate };
    }

    async getActivityLogs(userId, startDate, endDate) {
        const logsRef = this.firebase.db.collection('activityLogs');
        const snapshot = await logsRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getActivityMetrics(userId, startDate, endDate) {
        const metricsRef = this.firebase.db.collection('activityMetrics');
        const snapshot = await metricsRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getScreenshots(userId, startDate, endDate) {
        const screenshotsRef = this.firebase.db.collection('screenshots');
        const snapshot = await screenshotsRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getWebActivity(userId, startDate, endDate) {
        const webRef = this.firebase.db.collection('webActivity');
        const snapshot = await webRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getAppSessions(userId, startDate, endDate) {
        const sessionsRef = this.firebase.db.collection('appSessions');
        const snapshot = await sessionsRef
            .where('userId', '==', userId)
            .where('startTime', '>=', startDate)
            .where('startTime', '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getWorkSessions(userId, startDate, endDate) {
        const sessionsRef = this.firebase.db.collection('workSessions');
        const snapshot = await sessionsRef
            .where('userId', '==', userId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async getAlerts(userId, startDate, endDate) {
        const alertsRef = this.firebase.db.collection('alerts');
        const snapshot = await alertsRef
            .where('userId', '==', userId)
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    renderDashboard(data) {
        const container = document.getElementById('productivityContent');
        if (!container) return;

        // If daily view is selected, render daily breakdown
        if (this.currentPeriod === 'daily') {
            this.renderDailyView(data);
            return;
        }

        // Calculate summary metrics
        const summary = this.calculateSummary(data);

        // Render dashboard
        container.innerHTML = `
            ${this.renderSummaryCards(summary)}
            ${this.renderActivityChart(data.appSessions)}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                ${this.renderAppsList(data.appSessions)}
                ${this.renderWebsitesList(data.webActivity)}
            </div>
            ${this.renderScreenshotsGallery(data.screenshots)}
            ${this.renderAlertsList(data.alerts)}
        `;

        // Add event listeners for screenshots
        this.attachScreenshotListeners();
    }

    calculateSummary(data) {
        const { appSessions, activityMetrics } = data;

        // Total time
        const totalTime = appSessions.reduce((sum, session) => sum + (session.duration || 0), 0);

        // Time by category
        const timeByCategory = {
            productive: 0,
            neutral: 0,
            unproductive: 0
        };

        appSessions.forEach(session => {
            const category = session.category || 'neutral';
            timeByCategory[category] = (timeByCategory[category] || 0) + (session.duration || 0);
        });

        // Productivity score (percentage of productive time)
        const productivityScore = totalTime > 0
            ? Math.round((timeByCategory.productive / totalTime) * 100)
            : 0;

        // Average activity level
        const avgActivity = activityMetrics.length > 0
            ? activityMetrics.reduce((sum, m) => {
                const level = { high: 3, medium: 2, low: 1, inactive: 0 };
                return sum + (level[m.activityLevel] || 0);
            }, 0) / activityMetrics.length
            : 0;

        // Active hours
        const activeHours = totalTime / (1000 * 60 * 60);

        return {
            totalTime,
            timeByCategory,
            productivityScore,
            avgActivity,
            activeHours,
            totalScreenshots: data.screenshots.length,
            totalAlerts: data.alerts.length
        };
    }

    renderSummaryCards(summary) {
        const formatTime = (ms) => {
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        };

        return `
            <div class="productivity-summary">
                <div class="productivity-card">
                    <div class="productivity-card-header">
                        <span class="productivity-card-title">Productividad</span>
                        <div class="productivity-card-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="productivity-card-value">${summary.productivityScore}%</div>
                    <div class="productivity-card-label">Score de productividad</div>
                </div>
                
                <div class="productivity-card">
                    <div class="productivity-card-header">
                        <span class="productivity-card-title">Tiempo Activo</span>
                        <div class="productivity-card-icon" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                    <div class="productivity-card-value">${summary.activeHours.toFixed(1)}h</div>
                    <div class="productivity-card-label">Horas trabajadas</div>
                </div>
                
                <div class="productivity-card">
                    <div class="productivity-card-header">
                        <span class="productivity-card-title">Screenshots</span>
                        <div class="productivity-card-icon" style="background: linear-gradient(135deg, #a855f7, #9333ea);">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                    <div class="productivity-card-value">${summary.totalScreenshots}</div>
                    <div class="productivity-card-label">Capturas tomadas</div>
                </div>
                
                <div class="productivity-card">
                    <div class="productivity-card-header">
                        <span class="productivity-card-title">Alertas</span>
                        <div class="productivity-card-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div class="productivity-card-value">${summary.totalAlerts}</div>
                    <div class="productivity-card-label">Alertas generadas</div>
                </div>
            </div>
        `;
    }

    renderActivityChart(appSessions) {
        // Group sessions by hour
        const hourlyData = new Array(24).fill(0).map(() => ({
            productive: 0,
            neutral: 0,
            unproductive: 0,
            inactive: 0
        }));

        appSessions.forEach(session => {
            if (!session.startTime || !session.duration) return;

            const hour = session.startTime.toDate().getHours();
            const category = session.category || 'neutral';
            hourlyData[hour][category] += session.duration;
        });

        // Find max value for scaling
        const maxValue = Math.max(...hourlyData.map(h =>
            h.productive + h.neutral + h.unproductive + h.inactive
        ));

        // Generate bars HTML
        const barsHTML = hourlyData.map((data, hour) => {
            const total = data.productive + data.neutral + data.unproductive + data.inactive;
            if (total === 0) return '';

            const productiveHeight = (data.productive / maxValue) * 100;
            const neutralHeight = (data.neutral / maxValue) * 100;
            const unproductiveHeight = (data.unproductive / maxValue) * 100;
            const inactiveHeight = (data.inactive / maxValue) * 100;

            return `
                <div class="activity-bar-group">
                    <div class="activity-bar-stack">
                        ${data.productive > 0 ? `<div class="activity-bar productive" style="height: ${productiveHeight}%"></div>` : ''}
                        ${data.neutral > 0 ? `<div class="activity-bar neutral" style="height: ${neutralHeight}%"></div>` : ''}
                        ${data.unproductive > 0 ? `<div class="activity-bar unproductive" style="height: ${unproductiveHeight}%"></div>` : ''}
                        ${data.inactive > 0 ? `<div class="activity-bar inactive" style="height: ${inactiveHeight}%"></div>` : ''}
                    </div>
                    <div class="activity-bar-label">${hour}:00</div>
                </div>
            `;
        }).join('');

        return `
            <div class="activity-chart-container">
                <div class="activity-chart-header">
                    <div class="activity-chart-title">Actividad por Hora</div>
                    <div class="activity-chart-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #22c55e;"></div>
                            <span>Productivo</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #eab308;"></div>
                            <span>Neutral</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #ef4444;"></div>
                            <span>Improductivo</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #6b7280;"></div>
                            <span>Inactivo</span>
                        </div>
                    </div>
                </div>
                <div class="activity-bars">
                    ${barsHTML}
                </div>
            </div>
        `;
    }

    renderAppsList(appSessions) {
        // Aggregate time by app
        const appTimes = {};
        let totalTime = 0;

        appSessions.forEach(session => {
            const appName = session.appName || 'Unknown';
            const duration = session.duration || 0;
            const category = session.category || 'neutral';

            if (!appTimes[appName]) {
                appTimes[appName] = { time: 0, category };
            }
            appTimes[appName].time += duration;
            totalTime += duration;
        });

        // Sort by time
        const sortedApps = Object.entries(appTimes)
            .sort((a, b) => b[1].time - a[1].time)
            .slice(0, 10);

        const formatTime = (ms) => {
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        };

        const appsHTML = sortedApps.map(([appName, data]) => {
            const percentage = totalTime > 0 ? (data.time / totalTime) * 100 : 0;
            const icon = this.getAppIcon(appName);

            return `
                <div class="app-item">
                    <div class="app-icon">${icon}</div>
                    <div class="app-info">
                        <div class="app-name">${appName}</div>
                        <div class="app-category">${data.category}</div>
                    </div>
                    <div class="app-time">${formatTime(data.time)}</div>
                    <div class="app-percentage">
                        <div class="app-percentage-bar">
                            <div class="app-percentage-fill ${data.category}" style="width: ${percentage}%"></div>
                        </div>
                        <div class="app-percentage-text">${percentage.toFixed(1)}%</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="apps-list-container">
                <div class="apps-list-header">
                    <div class="apps-list-title">Apps Más Usadas</div>
                </div>
                <div class="apps-list">
                    ${appsHTML || '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No hay datos</p>'}
                </div>
            </div>
        `;
    }

    renderWebsitesList(webActivity) {
        // Aggregate visits by URL
        const urlCounts = {};

        webActivity.forEach(activity => {
            const url = activity.url || 'Unknown';
            const category = activity.category || 'neutral';

            if (!urlCounts[url]) {
                urlCounts[url] = { count: 0, category };
            }
            urlCounts[url].count++;
        });

        // Sort by count
        const sortedUrls = Object.entries(urlCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);

        const totalVisits = webActivity.length;

        const urlsHTML = sortedUrls.map(([url, data]) => {
            const percentage = totalVisits > 0 ? (data.count / totalVisits) * 100 : 0;
            const icon = this.getWebsiteIcon(url);

            return `
                <div class="app-item">
                    <div class="app-icon">${icon}</div>
                    <div class="app-info">
                        <div class="app-name">${url}</div>
                        <div class="app-category">${data.category}</div>
                    </div>
                    <div class="app-time">${data.count} visitas</div>
                    <div class="app-percentage">
                        <div class="app-percentage-bar">
                            <div class="app-percentage-fill ${data.category}" style="width: ${percentage}%"></div>
                        </div>
                        <div class="app-percentage-text">${percentage.toFixed(1)}%</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="apps-list-container">
                <div class="apps-list-header">
                    <div class="apps-list-title">Sitios Más Visitados</div>
                </div>
                <div class="apps-list">
                    ${urlsHTML || '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No hay datos</p>'}
                </div>
            </div>
        `;
    }

    renderScreenshotsGallery(screenshots) {
        const screenshotsHTML = screenshots.map(screenshot => {
            const timestamp = screenshot.timestamp?.toDate?.() || new Date();
            const timeStr = timestamp.toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short'
            });

            return `
                <div class="screenshot-item" data-url="${screenshot.screenshotUrl}">
                    <img src="${screenshot.screenshotUrl}" alt="Screenshot" class="screenshot-img" loading="lazy">
                    <div class="screenshot-overlay">${timeStr}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="screenshots-container">
                <div class="screenshots-header">
                    <div class="screenshots-title">Screenshots Recientes</div>
                    <button class="btn-primary" onclick="productivityDashboard.takeManualScreenshot()" style="padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-camera"></i>
                        Tomar Screenshot Ahora
                    </button>
                </div>
                <div class="screenshots-grid">
                    ${screenshotsHTML || '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px; grid-column: 1/-1;">No hay screenshots</p>'}
                </div>
            </div>
        `;
    }

    renderAlertsList(alerts) {
        const alertsHTML = alerts.map(alert => {
            const timestamp = alert.timestamp?.toDate?.() || new Date();
            const timeStr = timestamp.toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short'
            });

            const severity = alert.severity || 'low';
            const icon = this.getAlertIcon(alert.type);

            return `
                <div class="alert-item ${severity}">
                    <div class="alert-icon">${icon}</div>
                    <div class="alert-content">
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="alerts-container">
                <div class="alerts-header">
                    <div class="alerts-title">Alertas Recientes</div>
                </div>
                <div class="alerts-list">
                    ${alertsHTML || '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No hay alertas</p>'}
                </div>
            </div>
        `;
    }

    attachScreenshotListeners() {
        const screenshots = document.querySelectorAll('.screenshot-item');
        screenshots.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                this.showScreenshotModal(url);
            });
        });
    }

    showScreenshotModal(url) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('screenshotModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'screenshotModal';
            modal.className = 'screenshot-modal';
            modal.innerHTML = `
                <div class="screenshot-modal-content">
                    <button class="screenshot-modal-close">&times;</button>
                    <img src="" alt="Screenshot" class="screenshot-modal-img">
                </div>
            `;
            document.body.appendChild(modal);

            // Close on click outside or close button
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('screenshot-modal-close')) {
                    modal.classList.remove('active');
                }
            });
        }

        // Set image and show
        const img = modal.querySelector('.screenshot-modal-img');
        img.src = url;
        modal.classList.add('active');
    }

    getAppIcon(appName) {
        const name = appName.toLowerCase();

        if (name.includes('chrome') || name.includes('firefox') || name.includes('edge')) {
            return '<i class="fab fa-chrome"></i>';
        }
        if (name.includes('photoshop')) {
            return '<i class="fas fa-image"></i>';
        }
        if (name.includes('code') || name.includes('visual studio')) {
            return '<i class="fas fa-code"></i>';
        }
        if (name.includes('word') || name.includes('excel') || name.includes('powerpoint')) {
            return '<i class="fas fa-file-alt"></i>';
        }
        if (name.includes('figma') || name.includes('canva')) {
            return '<i class="fas fa-palette"></i>';
        }

        return '<i class="fas fa-window-maximize"></i>';
    }

    getWebsiteIcon(url) {
        const domain = url.toLowerCase();

        if (domain.includes('youtube')) return '<i class="fab fa-youtube"></i>';
        if (domain.includes('facebook')) return '<i class="fab fa-facebook"></i>';
        if (domain.includes('instagram')) return '<i class="fab fa-instagram"></i>';
        if (domain.includes('twitter')) return '<i class="fab fa-twitter"></i>';
        if (domain.includes('github')) return '<i class="fab fa-github"></i>';
        if (domain.includes('figma')) return '<i class="fas fa-palette"></i>';
        if (domain.includes('canva')) return '<i class="fas fa-paint-brush"></i>';

        return '<i class="fas fa-globe"></i>';
    }

    getAlertIcon(type) {
        switch (type) {
            case 'unproductive_site':
                return '<i class="fas fa-exclamation-circle"></i>';
            case 'prolonged_inactivity':
                return '<i class="fas fa-clock"></i>';
            default:
                return '<i class="fas fa-info-circle"></i>';
        }
    }

    async takeManualScreenshot() {
        if (!this.currentUserId) {
            alert('Por favor selecciona un asistente primero');
            return;
        }

        try {
            // Create a command in Firestore for the assistant to take a screenshot
            await this.firebase.db.collection('screenshotCommands').add({
                userId: this.currentUserId,
                timestamp: new Date(),
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Comando enviado. El screenshot se tomará en unos segundos...');

            // Reload data after 5 seconds
            setTimeout(() => {
                this.loadProductivityData();
            }, 5000);

        } catch (error) {
            console.error('Error taking manual screenshot:', error);
            alert('Error al tomar screenshot: ' + error.message);
        }
    }

    renderDailyView(data) {
        const container = document.getElementById('productivityContent');
        if (!container) return;

        // Group all data by day
        const dayGroups = this.groupDataByDay(data);

        // Sort days in descending order (most recent first)
        const sortedDays = Object.keys(dayGroups).sort((a, b) => new Date(b) - new Date(a));

        if (sortedDays.length === 0) {
            container.innerHTML = `
                <div class="productivity-empty">
                    <div class="productivity-empty-icon"><i class="fas fa-calendar-day"></i></div>
                    <div class="productivity-empty-text">No hay datos de productividad en este período</div>
                </div>
            `;
            return;
        }

        // Render daily cards
        const dailyCardsHTML = sortedDays.map(dateKey => {
            const dayData = dayGroups[dateKey];
            const summary = this.calculateSummary(dayData);
            const date = new Date(dateKey);
            const isToday = this.isToday(date);
            const isYesterday = this.isYesterday(date);

            const dateLabel = isToday ? 'Hoy' : isYesterday ? 'Ayer' : date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

            const formatTime = (ms) => {
                const hours = Math.floor(ms / (1000 * 60 * 60));
                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}h ${minutes}m`;
            };

            // Get workSession for this day
            const workSession = dayData.workSessions && dayData.workSessions.length > 0 ? dayData.workSessions[0] : null;
            const sessionId = workSession ? workSession.id : null;

            // Worked hours: use edited value if exists, otherwise use active hours as default
            const workedHours = workSession && workSession.hoursWorked !== undefined
                ? workSession.hoursWorked.toFixed(1)
                : summary.activeHours.toFixed(1);

            return `
                <div class="daily-card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h3 style="color: white; font-size: 20px; margin: 0; text-transform: capitalize;">${dateLabel}</h3>
                            <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 5px 0 0 0;">${date.toLocaleDateString('es-ES')}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 32px; color: #10b981; font-weight: 700;">${summary.productivityScore}%</div>
                            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 5px 0 0 0;">Productividad</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div style="background: rgba(16, 185, 129, 0.15); padding: 16px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-clock" style="color: #10b981;"></i>
                                    <span style="color: rgba(255,255,255,0.7); font-size: 13px;">Horas Trabajadas</span>
                                </div>
                                <button onclick="productivityDashboard.editDailyHours('${sessionId}', '${dateKey}', ${workedHours}, '${this.currentUserId}')" 
                                    style="background: rgba(16, 185, 129, 0.3); border: none; color: white; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                            <div style="color: white; font-size: 24px; font-weight: 600;">${workedHours}h</div>
                        </div>

                        <div style="background: rgba(99, 102, 241, 0.15); padding: 16px; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.3);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <i class="fas fa-desktop" style="color: #6366f1;"></i>
                                <span style="color: rgba(255,255,255,0.7); font-size: 13px;">Horas Activas</span>
                            </div>
                            <div style="color: white; font-size: 24px; font-weight: 600;">${summary.activeHours.toFixed(1)}h</div>
                        </div>

                        <div style="background: rgba(168, 85, 247, 0.15); padding: 16px; border-radius: 12px; border: 1px solid rgba(168, 85, 247, 0.3);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <i class="fas fa-camera" style="color: #a855f7;"></i>
                                <span style="color: rgba(255,255,255,0.7); font-size: 13px;">Screenshots</span>
                            </div>
                            <div style="color: white; font-size: 24px; font-weight: 600;">${summary.totalScreenshots}</div>
                        </div>

                        <div style="background: rgba(239, 68, 68, 0.15); padding: 16px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                                <span style="color: rgba(255,255,255,0.7); font-size: 13px;">Alertas</span>
                            </div>
                            <div style="color: white; font-size: 24px; font-weight: 600;">${summary.totalAlerts}</div>
                        </div>

                        <div style="background: rgba(34, 197, 94, 0.15); padding: 16px; border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.3);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <i class="fas fa-check-circle" style="color: #22c55e;"></i>
                                <span style="color: rgba(255,255,255,0.7); font-size: 13px;">T. Productivo</span>
                            </div>
                            <div style="color: white; font-size: 24px; font-weight: 600;">${formatTime(summary.timeByCategory.productive)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: white; font-size: 18px; margin-bottom: 10px;"><i class="fas fa-calendar-alt"></i> Productividad por Día (últimos 30 días)</h3>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Mostrando ${sortedDays.length} días con actividad</p>
            </div>
            ${dailyCardsHTML}
        `;
    }

    groupDataByDay(data) {
        const dayGroups = {};

        // Helper to get date key (YYYY-MM-DD)
        const getDateKey = (timestamp) => {
            const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toISOString().split('T')[0];
        };

        // Group activity logs
        data.activityLogs.forEach(log => {
            const key = getDateKey(log.timestamp);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].activityLogs.push(log);
        });

        // Group activity metrics
        data.activityMetrics.forEach(metric => {
            const key = getDateKey(metric.timestamp);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].activityMetrics.push(metric);
        });

        // Group screenshots
        data.screenshots.forEach(screenshot => {
            const key = getDateKey(screenshot.timestamp);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].screenshots.push(screenshot);
        });

        // Group web activity
        data.webActivity.forEach(activity => {
            const key = getDateKey(activity.timestamp);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].webActivity.push(activity);
        });

        // Group app sessions
        data.appSessions.forEach(session => {
            const key = getDateKey(session.startTime);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].appSessions.push(session);
        });

        // Group alerts
        data.alerts.forEach(alert => {
            const key = getDateKey(alert.timestamp);
            if (!dayGroups[key]) {
                dayGroups[key] = {
                    activityLogs: [],
                    activityMetrics: [],
                    screenshots: [],
                    webActivity: [],
                    appSessions: [],
                    alerts: [],
                    workSessions: []
                };
            }
            dayGroups[key].alerts.push(alert);
        });

        // Group work sessions
        if (data.workSessions) {
            data.workSessions.forEach(session => {
                const key = getDateKey(session.date);
                if (!dayGroups[key]) {
                    dayGroups[key] = {
                        activityLogs: [],
                        activityMetrics: [],
                        screenshots: [],
                        webActivity: [],
                        appSessions: [],
                        alerts: [],
                        workSessions: []
                    };
                }
                dayGroups[key].workSessions.push(session);
            });
        }

        return dayGroups;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();
    }

    async editDailyHours(sessionId, dateKey, currentHours, userId) {
        // Store data for the form submission
        this.editingHoursData = { sessionId, dateKey, currentHours, userId };

        // Update modal with current data
        const modal = document.getElementById('editDailyHoursModal');
        const input = document.getElementById('editHoursInput');
        const label = document.getElementById('editHoursDateLabel');
        const errorDiv = document.getElementById('editHoursError');
        const successDiv = document.getElementById('editHoursSuccess');

        if (!modal || !input || !label) return;

        // Format date nicely
        const date = new Date(dateKey);
        const dateStr = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        label.textContent = `Horas trabajadas - ${dateStr}`;
        input.value = currentHours;
        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');

        // Show modal
        modal.classList.add('active');
        input.focus();
        input.select();
    }

    async saveEditedHours() {
        const { sessionId, dateKey, userId } = this.editingHoursData;
        const input = document.getElementById('editHoursInput');
        const errorDiv = document.getElementById('editHoursError');
        const successDiv = document.getElementById('editHoursSuccess');

        const hours = parseFloat(input.value);

        if (isNaN(hours) || hours < 0) {
            errorDiv.textContent = 'Por favor ingresa un número válido de horas';
            errorDiv.classList.add('show');
            return false;
        }

        try {
            if (sessionId && sessionId !== 'null') {
                // Update existing session
                await this.firebase.db.collection('workSessions').doc(sessionId).update({
                    hoursWorked: hours,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Create new session
                const date = new Date(dateKey);
                await this.firebase.db.collection('workSessions').add({
                    userId: userId,
                    date: date,
                    hoursWorked: hours,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            successDiv.textContent = 'Horas actualizadas correctamente';
            successDiv.classList.add('show');

            // Close modal and reload after short delay
            setTimeout(() => {
                this.closeEditDailyHoursModal();
                this.loadProductivityData();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Error updating hours:', error);
            errorDiv.textContent = 'Error al actualizar las horas: ' + error.message;
            errorDiv.classList.add('show');
            return false;
        }
    }

    closeEditDailyHoursModal() {
        const modal = document.getElementById('editDailyHoursModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    destroy() {
        // Clean up listeners
        this.unsubscribes.forEach(unsub => unsub());
        this.unsubscribes = [];
    }
}

// Export for use in app.js
window.ProductivityDashboard = ProductivityDashboard;
