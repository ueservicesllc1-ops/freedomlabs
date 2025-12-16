// Productivity Tracker Module
// Monitors user activity, applications, screenshots, and web usage
// Uses IPC to communicate with main process for native functionality

class ProductivityTracker {
    constructor(userId, firebaseConfig) {
        this.userId = userId;
        this.firebase = firebaseConfig;
        this.isTracking = false;

        // Activity counters
        this.keyPressCount = 0;
        this.mouseClickCount = 0;
        this.lastActivityTime = Date.now();

        // Current session data
        this.currentApp = null;
        this.currentUrl = null;
        this.appStartTime = null;

        // Intervals
        this.appMonitorInterval = null;
        this.activityMonitorInterval = null;
        this.screenshotInterval = null;

        // Configuration
        this.config = {
            appMonitorFrequency: 30000, // 30 seconds
            activityMonitorFrequency: 60000, // 1 minute
            screenshotMinInterval: 300000, // 5 minutes
            screenshotMaxInterval: 900000, // 15 minutes
        };

        // App categorization
        this.appCategories = {
            productive: [
                'photoshop', 'illustrator', 'figma', 'canva', 'sketch',
                'vscode', 'visual studio', 'sublime', 'atom', 'webstorm',
                'excel', 'word', 'powerpoint', 'outlook',
                'slack', 'teams', 'zoom', 'meet'
            ],
            neutral: [
                'chrome', 'firefox', 'edge', 'safari', 'brave',
                'explorer', 'finder', 'terminal', 'cmd'
            ],
            unproductive: [
                'spotify', 'vlc', 'media player', 'steam', 'discord',
                'whatsapp', 'telegram', 'messenger'
            ]
        };

        // Website categorization
        this.siteCategories = {
            productive: [
                'figma.com', 'canva.com', 'github.com', 'gitlab.com',
                'drive.google.com', 'docs.google.com', 'sheets.google.com',
                'notion.so', 'trello.com', 'asana.com', 'monday.com',
                'stackoverflow.com', 'mdn.mozilla.org'
            ],
            neutral: [
                'google.com', 'gmail.com', 'outlook.com', 'bing.com'
            ],
            unproductive: [
                'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
                'tiktok.com', 'reddit.com', 'twitch.tv', 'netflix.com',
                'hulu.com', 'disneyplus.com', 'primevideo.com'
            ]
        };
    }

    // Start tracking
    start() {
        if (this.isTracking) {
            console.log('Productivity tracking already started');
            return;
        }


        console.log('Starting productivity tracking...');
        this.isTracking = true;

        // Start monitoring active application
        this.startAppMonitoring();

        // Start monitoring keyboard/mouse activity
        this.startActivityMonitoring();

        // Start random screenshots
        this.scheduleNextScreenshot();

        // Listen for manual screenshot commands from admin
        this.listenForScreenshotCommands();

        console.log('Productivity tracking started successfully');
    }

    // Stop tracking
    stop() {
        if (!this.isTracking) return;

        console.log('Stopping productivity tracking...');
        this.isTracking = false;

        if (this.appMonitorInterval) {
            clearInterval(this.appMonitorInterval);
            this.appMonitorInterval = null;
        }

        if (this.activityMonitorInterval) {
            clearInterval(this.activityMonitorInterval);
            this.activityMonitorInterval = null;
        }

        if (this.screenshotInterval) {
            clearTimeout(this.screenshotInterval);
            this.screenshotInterval = null;
        }

        // Save final session data
        if (this.currentApp && this.appStartTime) {
            this.saveAppSession();
        }

        console.log('Productivity tracking stopped');
    }

    // Monitor active application
    startAppMonitoring() {
        this.appMonitorInterval = setInterval(async () => {
            try {
                // Use IPC to get active window from main process
                if (!window.electronAPI || !window.electronAPI.getActiveWindow) {
                    console.warn('electronAPI not available for app monitoring');
                    return;
                }

                const activeWindow = await window.electronAPI.getActiveWindow();

                if (!activeWindow) {
                    console.log('No active window detected');
                    return;
                }

                const appName = activeWindow.appName;
                const windowTitle = activeWindow.windowTitle;

                // Check if app changed
                if (this.currentApp !== appName) {
                    // Save previous app session
                    if (this.currentApp && this.appStartTime) {
                        await this.saveAppSession();
                    }

                    // Start new session
                    this.currentApp = appName;
                    this.appStartTime = Date.now();
                }

                // Extract URL if browser
                const url = this.extractUrlFromTitle(appName, windowTitle);
                if (url && url !== this.currentUrl) {
                    // Save previous URL session
                    if (this.currentUrl) {
                        await this.saveWebSession();
                    }

                    this.currentUrl = url;
                }

                // Log current activity
                await this.logActivity(appName, windowTitle, url);

            } catch (error) {
                console.error('Error monitoring app:', error);
            }
        }, this.config.appMonitorFrequency);
    }

    // Monitor keyboard and mouse activity
    startActivityMonitoring() {
        // Listen for keyboard events
        document.addEventListener('keydown', () => {
            this.keyPressCount++;
            this.lastActivityTime = Date.now();
        });

        // Listen for mouse events
        document.addEventListener('click', () => {
            this.mouseClickCount++;
            this.lastActivityTime = Date.now();
        });

        document.addEventListener('mousemove', () => {
            this.lastActivityTime = Date.now();
        });

        // Save activity metrics every minute
        this.activityMonitorInterval = setInterval(async () => {
            await this.saveActivityMetrics();

            // Reset counters
            this.keyPressCount = 0;
            this.mouseClickCount = 0;
        }, this.config.activityMonitorFrequency);
    }

    // Schedule next screenshot
    scheduleNextScreenshot() {
        if (!this.isTracking) return;

        // Random interval between 5-15 minutes
        const interval = Math.random() *
            (this.config.screenshotMaxInterval - this.config.screenshotMinInterval) +
            this.config.screenshotMinInterval;

        this.screenshotInterval = setTimeout(async () => {
            await this.takeScreenshot();
            this.scheduleNextScreenshot(); // Schedule next one
        }, interval);
    }

    // Listen for manual screenshot commands from admin
    listenForScreenshotCommands() {
        if (!this.firebase || !this.firebase.db) {
            console.warn('Firebase not available for screenshot commands');
            return;
        }

        console.log('Listening for screenshot commands...');

        // Listen for new commands
        this.firebase.db.collection('screenshotCommands')
            .where('userId', '==', this.userId)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const command = change.doc;
                        console.log('Screenshot command received!', command.id);

                        // Take screenshot immediately
                        await this.takeScreenshot();

                        // Mark command as completed
                        await command.ref.update({
                            status: 'completed',
                            completedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        console.log('Screenshot command completed');
                    }
                });
            });
    }

    // Take screenshot
    async takeScreenshot() {
        try {
            console.log('Taking screenshot...');

            // Use IPC to take screenshot from main process
            if (!window.electronAPI || !window.electronAPI.takeScreenshot) {
                console.warn('electronAPI not available for screenshots');
                return;
            }

            const base64Image = await window.electronAPI.takeScreenshot(this.userId);

            if (!base64Image) {
                console.warn('Screenshot returned null');
                return;
            }

            const timestamp = Date.now();
            const filename = `${this.userId}_${timestamp}.jpg`;

            // Convert base64 to Blob
            const byteCharacters = atob(base64Image);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            // Upload to Backblaze B2 via Railway Proxy
            const formData = new FormData();
            formData.append('file', blob, filename);
            formData.append('projectId', 'productivity'); // Group by productivity
            formData.append('folder', `screenshots/${this.userId}`); // Organize by user

            console.log('Uploading screenshot to B2...');

            try {
                // Use custom domain
                const response = await fetch('https://freedomlabs.dev/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Upload failed with status: ${response.status}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Unknown upload error');
                }

                const url = result.url;
                console.log('Screenshot uploaded to B2:', url);

                // Save reference in Firestore
                await this.firebase.db.collection('screenshots').add({
                    userId: this.userId,
                    timestamp: new Date(),
                    screenshotUrl: url,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log('Screenshot saved to Firestore');

            } catch (uploadError) {
                console.error('Upload to B2 failed:', uploadError);
                return; // Stop if upload fails
            }

        } catch (error) {
            console.error('Error taking screenshot:', error);
        }
    }

    // Extract URL from browser window title
    extractUrlFromTitle(appName, title) {
        const browserApps = ['chrome', 'firefox', 'edge', 'safari', 'brave'];
        const isBrowser = browserApps.some(browser =>
            appName.toLowerCase().includes(browser)
        );

        if (!isBrowser) return null;

        // Try to extract domain from title
        // Common patterns: "Page Title - Domain.com" or "Domain.com - Page Title"
        const urlPattern = /([a-z0-9-]+\.[a-z]{2,})/i;
        const match = title.match(urlPattern);

        return match ? match[1].toLowerCase() : null;
    }

    // Categorize application
    categorizeApp(appName) {
        const name = appName.toLowerCase();

        for (const [category, apps] of Object.entries(this.appCategories)) {
            if (apps.some(app => name.includes(app))) {
                return category;
            }
        }

        return 'neutral';
    }

    // Categorize website
    categorizeSite(url) {
        if (!url) return 'neutral';

        for (const [category, sites] of Object.entries(this.siteCategories)) {
            if (sites.some(site => url.includes(site))) {
                return category;
            }
        }

        return 'neutral';
    }

    // Log current activity
    async logActivity(appName, windowTitle, url) {
        try {
            const appCategory = this.categorizeApp(appName);
            const siteCategory = url ? this.categorizeSite(url) : null;

            await this.firebase.db.collection('activityLogs').add({
                userId: this.userId,
                timestamp: new Date(),
                appName: appName,
                windowTitle: windowTitle,
                url: url || null,
                appCategory: appCategory,
                siteCategory: siteCategory,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // Save app session
    async saveAppSession() {
        try {
            const duration = Date.now() - this.appStartTime;
            const category = this.categorizeApp(this.currentApp);

            await this.firebase.db.collection('appSessions').add({
                userId: this.userId,
                appName: this.currentApp,
                category: category,
                startTime: new Date(this.appStartTime),
                endTime: new Date(),
                duration: duration,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Error saving app session:', error);
        }
    }

    // Save web session
    async saveWebSession() {
        try {
            const category = this.categorizeSite(this.currentUrl);

            await this.firebase.db.collection('webActivity').add({
                userId: this.userId,
                url: this.currentUrl,
                category: category,
                timestamp: new Date(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Check for alerts
            await this.checkForAlerts(this.currentUrl, category);

        } catch (error) {
            console.error('Error saving web session:', error);
        }
    }

    // Save activity metrics
    async saveActivityMetrics() {
        try {
            const activityLevel = this.calculateActivityLevel();

            await this.firebase.db.collection('activityMetrics').add({
                userId: this.userId,
                timestamp: new Date(),
                keysPerMinute: this.keyPressCount,
                clicksPerMinute: this.mouseClickCount,
                activityLevel: activityLevel,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Error saving activity metrics:', error);
        }
    }

    // Calculate activity level
    calculateActivityLevel() {
        const totalActivity = this.keyPressCount + (this.mouseClickCount * 2);

        if (totalActivity > 100) return 'high';
        if (totalActivity > 50) return 'medium';
        if (totalActivity > 10) return 'low';
        return 'inactive';
    }

    // Check for alerts
    async checkForAlerts(url, category) {
        try {
            // Alert if on unproductive site
            if (category === 'unproductive') {
                await this.firebase.db.collection('alerts').add({
                    userId: this.userId,
                    timestamp: new Date(),
                    type: 'unproductive_site',
                    severity: 'medium',
                    message: `Usuario visitando sitio improductivo: ${url}`,
                    details: { url: url },
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Alert if inactive for too long
            const inactiveTime = Date.now() - this.lastActivityTime;
            if (inactiveTime > 1200000) { // 20 minutes
                await this.firebase.db.collection('alerts').add({
                    userId: this.userId,
                    timestamp: new Date(),
                    type: 'prolonged_inactivity',
                    severity: 'low',
                    message: `Usuario inactivo por ${Math.round(inactiveTime / 60000)} minutos`,
                    details: { inactiveMinutes: Math.round(inactiveTime / 60000) },
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }
}

// Export for use in app.js
window.ProductivityTracker = ProductivityTracker;
