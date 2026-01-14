// Professional Accounting System for Freedom Labs Admin
// Manages payroll, payments, and financial reports

class AccountingSystem {
    constructor(firebaseConfig) {
        this.firebase = firebaseConfig;
        this.currentPeriod = 'week'; // week, month, custom
        this.selectedAssistant = null;
        this.payments = []; // Historical payments
    }

    // Initialize accounting view
    async initializeView() {
        console.log('Initializing Accounting System...');
        await this.loadAssistants();
        await this.loadPayments();
        this.renderDashboard();
    }

    // Load all assistants
    async loadAssistants() {
        try {
            this.assistants = await this.firebase.getAllAssistants();
            console.log(`Loaded ${this.assistants.length} assistants for accounting`);
        } catch (error) {
            console.error('Error loading assistants:', error);
            this.assistants = [];
        }
    }

    // Load payment history from Firestore
    async loadPayments() {
        try {
            const paymentsRef = this.firebase.db.collection('payments');
            const snapshot = await paymentsRef.orderBy('createdAt', 'desc').get();

            this.payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
            }));

            console.log(`Loaded ${this.payments.length} payment records`);
        } catch (error) {
            console.error('Error loading payments:', error);
            this.payments = [];
        }
    }

    // Calculate period dates
    getPeriodDates(period = this.currentPeriod) {
        const now = new Date();
        let startDate, endDate = now;

        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'custom':
                // Will be set by date pickers
                startDate = this.customStartDate || new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = this.customEndDate || now;
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
        }

        return { startDate, endDate };
    }

    // Calculate hours and payment for an assistant in a period
    async calculateAssistantPayroll(assistantId, startDate, endDate) {
        try {
            const sessions = await this.firebase.getWorkSessions(assistantId);
            const assistant = this.assistants.find(a => a.userId === assistantId);

            if (!assistant) return null;

            let totalHours = 0;
            const sessionsByDay = {};

            // Filter and group sessions by day
            sessions.forEach(session => {
                const sessionDate = session.startTime?.toDate?.() || new Date(session.startTime);

                if (sessionDate >= startDate && sessionDate <= endDate) {
                    const hours = session.hoursWorked || 0;
                    totalHours += hours;

                    const dateKey = sessionDate.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    if (!sessionsByDay[dateKey]) {
                        sessionsByDay[dateKey] = {
                            hours: 0,
                            sessions: [],
                            date: sessionDate
                        };
                    }

                    sessionsByDay[dateKey].hours += hours;
                    sessionsByDay[dateKey].sessions.push(session);
                }
            });

            const hourlyRate = parseFloat(assistant.hourlyRate) || 0;
            const totalPayment = totalHours * hourlyRate;

            // Check if period has been paid
            const isPaid = this.payments.some(payment =>
                payment.assistantId === assistantId &&
                payment.startDate?.toMillis?.() === startDate.getTime() &&
                payment.endDate?.toMillis?.() === endDate.getTime()
            );

            return {
                assistant,
                totalHours,
                hourlyRate,
                totalPayment,
                sessionsByDay,
                isPaid,
                startDate,
                endDate
            };
        } catch (error) {
            console.error('Error calculating payroll:', error);
            return null;
        }
    }

    // Render main dashboard
    async renderDashboard() {
        const container = document.getElementById('accountingContent');
        if (!container) return;

        const { startDate, endDate } = this.getPeriodDates();

        // Calculate totals
        let totalToPay = 0;
        let totalPaid = 0;
        const assistantsData = [];

        for (const assistant of this.assistants) {
            const payroll = await this.calculateAssistantPayroll(assistant.userId, startDate, endDate);
            if (payroll) {
                assistantsData.push(payroll);
                if (payroll.isPaid) {
                    totalPaid += payroll.totalPayment;
                } else {
                    totalToPay += payroll.totalPayment;
                }
            }
        }

        container.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px 0; color: white;">Resumen Financiero - ${this.getPeriodLabel()}</h3>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
                        <div style="font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 10px;">💰 Por Pagar</div>
                        <div style="font-size: 32px; font-weight: 700; color: white;">$${totalToPay.toFixed(2)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px;">
                        <div style="font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 10px;">✅ Pagado</div>
                        <div style="font-size: 32px; font-weight: 700; color: white;">$${totalPaid.toFixed(2)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px;">
                        <div style="font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 10px;">📊 Total</div>
                        <div style="font-size: 32px; font-weight: 700; color: white;">$${(totalToPay + totalPaid).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: white;">Nómina por Asistente</h3>
                    
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <select id="accountingPeriodSelect" style="padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white;">
                            <option value="week" ${this.currentPeriod === 'week' ? 'selected' : ''}>Esta Semana</option>
                            <option value="month" ${this.currentPeriod === 'month' ? 'selected' : ''}>Este Mes</option>
                            <option value="custom" ${this.currentPeriod === 'custom' ? 'selected' : ''}>Rango Personalizado</option>
                        </select>
                        
                        ${this.currentPeriod === 'custom' ? `
                            <input type="date" id="customStartDate" value="${this.customStartDate?.toISOString().split('T')[0] || ''}" 
                                style="padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white;">
                            <input type="date" id="customEndDate" value="${this.customEndDate?.toISOString().split('T')[0] || ''}"
                                style="padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white;">
                        ` : ''}
                        
                        <button onclick="accountingSystem.exportToCSV()" class="btn-primary" style="padding: 10px 20px;">
                            <i class="fas fa-download"></i> Exportar CSV
                        </button>
                    </div>
                </div>

                <div class="assistants-table">
                    <div class="assistants-header" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;">
                        <div>Asistente</div>
                        <div>Horas</div>
                        <div>$/Hora</div>
                        <div>Total</div>
                        <div>Estado</div>
                        <div>Acciones</div>
                    </div>
                    ${this.renderAssistantsPayroll(assistantsData)}
                </div>
            </div>
        `;

        // Add event listeners
        this.attachEventListeners();
    }

    // Render assistants payroll table
    renderAssistantsPayroll(assistantsData) {
        if (assistantsData.length === 0) {
            return '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">No hay datos para el período seleccionado</p>';
        }

        return assistantsData.map(data => `
            <div class="assistant-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div>
                    <div style="font-weight: 600;">${data.assistant.name || data.assistant.username}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${data.assistant.email}</div>
                </div>
                <div style="font-weight: 600; color: #f59e0b;">${data.totalHours.toFixed(2)}h</div>
                <div>$${data.hourlyRate.toFixed(2)}</div>
                <div style="font-weight: 700; color: #10b981; font-size: 18px;">$${data.totalPayment.toFixed(2)}</div>
                <div>
                    <span class="status-badge ${data.isPaid ? 'online' : 'offline'}" style="background: ${data.isPaid ? '#10b981' : '#ef4444'};">
                        ${data.isPaid ? '✓ Pagado' : 'Pendiente'}
                    </span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="accountingSystem.showPayrollDetails('${data.assistant.userId}')" class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                    ${!data.isPaid ? `
                        <button onclick="accountingSystem.markAsPaid('${data.assistant.userId}')" class="btn-primary" style="padding: 6px 12px; font-size: 12px;">
                            <i class="fas fa-check"></i> Pagado
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Show detailed payroll for an assistant
    async showPayrollDetails(assistantId) {
        const { startDate, endDate } = this.getPeriodDates();
        const payroll = await this.calculateAssistantPayroll(assistantId, startDate, endDate);

        if (!payroll) {
            alert('Error al cargar los detalles');
            return;
        }

        const sortedDays = Object.entries(payroll.sessionsByDay).sort((a, b) =>
            b[1].date - a[1].date
        );

        const detailHTML = `
            <h3>${payroll.assistant.name || payroll.assistant.username}</h3>
            <div style="margin: 20px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                    <div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">Total Horas</div>
                        <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${payroll.totalHours.toFixed(2)}h</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">Tarifa/Hora</div>
                        <div style="font-size: 24px; font-weight: 700;">$${payroll.hourlyRate.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">Total a Pagar</div>
                        <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${payroll.totalPayment.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">Estado</div>
                        <div style="font-size: 18px; font-weight: 600; color: ${payroll.isPaid ? '#10b981' : '#ef4444'};">
                            ${payroll.isPaid ? '✓ Pagado' : 'Pendiente'}
                        </div>
                    </div>
                </div>
            </div>

            <h4>Desglose Diario</h4>
            <div style="max-height: 400px; overflow-y: auto;">
                ${sortedDays.map(([dateKey, dayData]) => `
                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong>${dateKey}</strong>
                            <strong style="color: #f59e0b;">${dayData.hours.toFixed(2)}h = $${(dayData.hours * payroll.hourlyRate).toFixed(2)}</strong>
                        </div>
                        ${dayData.sessions.map(session => {
            const start = session.startTime?.toDate?.() || new Date(session.startTime);
            const end = session.endTime?.toDate?.() || new Date(session.endTime);
            return `
                                <div style="font-size: 12px; color: rgba(255,255,255,0.7); padding-left: 20px;">
                                    ${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                                    ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • 
                                    ${session.hoursWorked?.toFixed(2) || 0}h
                                </div>
                            `;
        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        // Show in modal
        const modal = document.getElementById('payrollDetailModal') || this.createPayrollModal();
        modal.querySelector('.modal-body').innerHTML = detailHTML;
        modal.style.display = 'block';
    }

    // Create payroll detail modal
    createPayrollModal() {
        const modal = document.createElement('div');
        modal.id = 'payrollDetailModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal" onclick="document.getElementById('payrollDetailModal').style.display='none'">&times;</span>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Mark period as paid
    async markAsPaid(assistantId) {
        const { startDate, endDate } = this.getPeriodDates();
        const payroll = await this.calculateAssistantPayroll(assistantId, startDate, endDate);

        if (!payroll) {
            alert('Error al procesar el pago');
            return;
        }

        const confirm = window.confirm(
            `¿Confirmar pago de $${payroll.totalPayment.toFixed(2)} a ${payroll.assistant.name}?\n\n` +
            `Período: ${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}\n` +
            `Horas: ${payroll.totalHours.toFixed(2)}h`
        );

        if (!confirm) return;

        try {
            // Save payment record
            await this.firebase.db.collection('payments').add({
                assistantId,
                assistantName: payroll.assistant.name || payroll.assistant.username,
                startDate: this.firebase.getTimestamp(startDate),
                endDate: this.firebase.getTimestamp(endDate),
                hours: payroll.totalHours,
                hourlyRate: payroll.hourlyRate,
                totalAmount: payroll.totalPayment,
                createdAt: this.firebase.db.FieldValue.serverTimestamp(),
                createdBy: 'admin' // Could be current admin user
            });

            alert('Pago registrado exitosamente');
            await this.loadPayments();
            await this.renderDashboard();
        } catch (error) {
            console.error('Error registering payment:', error);
            alert('Error al registrar el pago: ' + error.message);
        }
    }

    // Export to CSV
    async exportToCSV() {
        const { startDate, endDate } = this.getPeriodDates();
        const assistantsData = [];

        for (const assistant of this.assistants) {
            const payroll = await this.calculateAssistantPayroll(assistant.userId, startDate, endDate);
            if (payroll && payroll.totalHours > 0) {
                assistantsData.push(payroll);
            }
        }

        // Build CSV
        let csv = 'Nombre,Email,Horas,Tarifa/Hora,Total,Estado\n';
        assistantsData.forEach(data => {
            csv += `"${data.assistant.name || data.assistant.username}",`;
            csv += `"${data.assistant.email}",`;
            csv += `${data.totalHours.toFixed(2)},`;
            csv += `${data.hourlyRate.toFixed(2)},`;
            csv += `${data.totalPayment.toFixed(2)},`;
            csv += `"${data.isPaid ? 'Pagado' : 'Pendiente'}"\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nomina_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
        a.click();
    }

    // Get period label
    getPeriodLabel() {
        const { startDate, endDate } = this.getPeriodDates();
        return `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`;
    }

    // Attach event listeners
    attachEventListeners() {
        const periodSelect = document.getElementById('accountingPeriodSelect');
        if (periodSelect) {
            periodSelect.addEventListener('change', async (e) => {
                this.currentPeriod = e.target.value;
                await this.renderDashboard();
            });
        }

        const customStartDate = document.getElementById('customStartDate');
        const customEndDate = document.getElementById('customEndDate');

        if (customStartDate) {
            customStartDate.addEventListener('change', async (e) => {
                this.customStartDate = new Date(e.target.value);
                await this.renderDashboard();
            });
        }

        if (customEndDate) {
            customEndDate.addEventListener('change', async (e) => {
                this.customEndDate = new Date(e.target.value);
                await this.renderDashboard();
            });
        }
    }
}

// Export globally
window.AccountingSystem = AccountingSystem;
