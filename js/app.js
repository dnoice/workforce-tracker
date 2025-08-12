/**
 * WorkForce Pro - Main Application
 * Version: 2.0.0
 * Enhanced workforce management system with robust features
 */

// ========== Application Configuration ==========
const APP_CONFIG = {
    name: 'WorkForce Pro',
    version: '2.0.0',
    storagePrefix: 'wfp_',
    api: {
        endpoint: '/api/v1',
        timeout: 10000
    },
    defaults: {
        currency: 'USD',
        hourlyRate: 15.00,
        overtimeMultiplier: 1.5,
        maxHoursPerDay: 24,
        breakTimeInterval: 15,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    },
    features: {
        darkMode: true,
        notifications: true,
        autoSave: true,
        analytics: true,
        cloudSync: false
    }
};

// ========== Main Application Class ==========
class WorkForceApp {
    constructor() {
        this.version = APP_CONFIG.version;
        this.modules = {};
        this.state = {
            currentUser: null,
            currentTab: 'dashboard',
            theme: 'light',
            sidebarCollapsed: false,
            notifications: [],
            recentActivity: []
        };
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoading();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Load user data
            await this.loadUserData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Start background tasks
            this.startBackgroundTasks();
            
            // Hide loading screen
            setTimeout(() => this.hideLoading(), 1000);
            
            console.log(`✅ ${APP_CONFIG.name} v${this.version} initialized successfully`);
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initializeModules() {
        // Initialize data manager
        this.modules.dataManager = new DataManager();
        
        // Initialize other modules
        this.modules.notificationManager = new NotificationManager();
        this.modules.analyticsManager = new AnalyticsManager();
        this.modules.validationManager = new ValidationManager();
        this.modules.exportManager = new ExportManager();
        
        // Module initialization complete
        console.log('✅ All modules initialized');
    }

    async loadUserData() {
        // Load user preferences
        const preferences = this.modules.dataManager.getPreferences();
        if (preferences) {
            this.state.theme = preferences.theme || 'light';
            this.state.sidebarCollapsed = preferences.sidebarCollapsed || false;
        }
        
        // Apply theme
        this.applyTheme(this.state.theme);
        
        // Load recent activity
        this.state.recentActivity = this.modules.dataManager.getRecentActivity();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(item.dataset.tab);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile menu
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
            
            // Keyboard shortcut (Ctrl+K)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    globalSearch.focus();
                }
            });
        }

        // Quick Add
        const quickAddBtn = document.getElementById('quick-add-btn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => this.openQuickAdd());
        }

        // Sync button
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncData());
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Before unload - save data
        window.addEventListener('beforeunload', () => this.saveState());
    }

    initializeUI() {
        // Update date and time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Update counters
        this.updateCounters();
        
        // Load dashboard
        this.loadDashboard();
        
        // Initialize tooltips
        this.initTooltips();
        
        // Initialize charts
        this.initCharts();
    }

    startBackgroundTasks() {
        // Auto-save every 30 seconds
        if (APP_CONFIG.features.autoSave) {
            setInterval(() => this.autoSave(), 30000);
        }
        
        // Check for notifications every minute
        if (APP_CONFIG.features.notifications) {
            setInterval(() => this.checkNotifications(), 60000);
        }
        
        // Update analytics every 5 minutes
        if (APP_CONFIG.features.analytics) {
            setInterval(() => this.updateAnalytics(), 300000);
        }
    }

    // ========== UI Methods ==========
    
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hide');
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }

    switchTab(tabName) {
        // Update state
        this.state.currentTab = tabName;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabName);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update page title and breadcrumb
        this.updatePageHeader(tabName);
        
        // Load tab content
        this.loadTabContent(tabName);
        
        // Track analytics
        this.modules.analyticsManager.track('tab_switch', { tab: tabName });
    }

    updatePageHeader(tabName) {
        const titles = {
            dashboard: 'Dashboard',
            timesheet: 'Timesheet',
            workers: 'Workers',
            tasks: 'Tasks',
            schedule: 'Schedule',
            invoices: 'Invoices',
            payments: 'Payments',
            expenses: 'Expenses',
            reports: 'Reports',
            analytics: 'Analytics',
            settings: 'Settings',
            backup: 'Backup & Restore'
        };
        
        const pageTitle = document.getElementById('page-title');
        const breadcrumb = document.getElementById('breadcrumb-current');
        
        if (pageTitle) pageTitle.textContent = titles[tabName] || 'Unknown';
        if (breadcrumb) breadcrumb.textContent = titles[tabName] || 'Unknown';
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'timesheet':
                this.loadTimesheet();
                break;
            case 'workers':
                this.loadWorkers();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'schedule':
                this.loadSchedule();
                break;
            case 'invoices':
                this.loadInvoices();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
            default:
                console.warn(`Unknown tab: ${tabName}`);
        }
    }

    loadDashboard() {
        // Update stats
        this.updateDashboardStats();
        
        // Load activity timeline
        this.loadActivityTimeline();
        
        // Update charts
        this.updateDashboardCharts();
        
        // Load top workers
        this.loadTopWorkers();
        
        // Load recent tasks
        this.loadRecentTasks();
    }

    updateDashboardStats() {
        const stats = this.modules.dataManager.getDashboardStats();
        
        // Update stat cards
        document.getElementById('total-hours-today').textContent = stats.hoursToday.toFixed(1);
        document.getElementById('active-workers').textContent = stats.activeWorkers;
        document.getElementById('total-workers').textContent = stats.totalWorkers;
        document.getElementById('tasks-completed').textContent = stats.tasksCompleted;
        document.getElementById('todays-revenue').textContent = `$${stats.revenue.toFixed(2)}`;
        
        // Update progress bars
        const workersProgress = (stats.activeWorkers / stats.totalWorkers) * 100;
        document.getElementById('workers-progress').style.width = `${workersProgress}%`;
    }

    loadActivityTimeline() {
        const timeline = document.getElementById('activity-timeline');
        if (!timeline) return;
        
        const activities = this.modules.dataManager.getRecentActivity();
        
        if (activities.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x text-muted"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        timeline.innerHTML = activities.map(activity => this.createTimelineItem(activity)).join('');
    }

    createTimelineItem(activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);
        const icon = this.getActivityIcon(activity.type);
        const color = this.getActivityColor(activity.type);
        
        return `
            <div class="timeline-item">
                <div class="timeline-marker ${color}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${activity.title}</span>
                        <span class="timeline-time">${timeAgo}</span>
                    </div>
                    <p class="timeline-description">${activity.description}</p>
                </div>
            </div>
        `;
    }

    // ========== Utility Methods ==========
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
        this.savePreferences();
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.state.theme);
        this.savePreferences();
        
        // Update icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.state.theme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        
        // Update time
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }

    updateCounters() {
        const workers = this.modules.dataManager.getWorkers();
        const tasks = this.modules.dataManager.getTasks();
        
        const workerCount = document.getElementById('worker-count');
        const taskCount = document.getElementById('task-count');
        
        if (workerCount) workerCount.textContent = workers.length;
        if (taskCount) taskCount.textContent = tasks.filter(t => t.status !== 'completed').length;
    }

    handleSearch(query) {
        if (query.length < 2) return;
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        const results = this.modules.dataManager.search(query);
        console.log('Search results:', results);
        // TODO: Display search results
    }

    handleResize() {
        // Handle responsive adjustments
        if (window.innerWidth < 992) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('mobile-open');
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    }

    getActivityIcon(type) {
        const icons = {
            task_completed: 'check-circle',
            task_created: 'plus-circle',
            worker_added: 'user-plus',
            time_logged: 'clock',
            invoice_created: 'file-invoice',
            payment_received: 'dollar-sign'
        };
        return icons[type] || 'circle';
    }

    getActivityColor(type) {
        const colors = {
            task_completed: 'success',
            task_created: 'primary',
            worker_added: 'info',
            time_logged: 'warning',
            invoice_created: 'secondary',
            payment_received: 'success'
        };
        return colors[type] || 'secondary';
    }

    savePreferences() {
        const preferences = {
            theme: this.state.theme,
            sidebarCollapsed: this.state.sidebarCollapsed
        };
        this.modules.dataManager.savePreferences(preferences);
    }

    saveState() {
        // Save current application state
        this.modules.dataManager.saveState(this.state);
    }

    autoSave() {
        console.log('⏰ Auto-saving data...');
        this.saveState();
    }

    checkNotifications() {
        // Check for any pending notifications
        const notifications = this.modules.notificationManager.check();
        if (notifications.length > 0) {
            notifications.forEach(notification => {
                this.showNotification(notification);
            });
        }
    }

    updateAnalytics() {
        // Update analytics data
        this.modules.analyticsManager.update();
    }

    showNotification(notification) {
        this.modules.notificationManager.show(notification);
    }

    showError(message) {
        this.showNotification({
            type: 'error',
            title: 'Error',
            message: message
        });
    }

    showSuccess(message) {
        this.showNotification({
            type: 'success',
            title: 'Success',
            message: message
        });
    }

    // Placeholder methods for other tabs
    loadTimesheet() {
        console.log('Loading timesheet...');
    }

    loadWorkers() {
        console.log('Loading workers...');
    }

    loadTasks() {
        console.log('Loading tasks...');
    }

    loadSchedule() {
        console.log('Loading schedule...');
    }

    loadInvoices() {
        console.log('Loading invoices...');
    }

    loadReports() {
        console.log('Loading reports...');
    }

    loadAnalytics() {
        console.log('Loading analytics...');
    }

    loadSettings() {
        console.log('Loading settings...');
    }

    loadTopWorkers() {
        // Implementation for top workers
    }

    loadRecentTasks() {
        // Implementation for recent tasks
    }

    updateDashboardCharts() {
        // Implementation for dashboard charts
    }

    initTooltips() {
        // Initialize tooltips
    }

    initCharts() {
        // Initialize Chart.js charts
    }

    openQuickAdd() {
        const modal = document.getElementById('quick-add-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    syncData() {
        this.showNotification({
            type: 'info',
            title: 'Syncing',
            message: 'Synchronizing data...'
        });
        
        // Simulate sync
        setTimeout(() => {
            this.showSuccess('Data synchronized successfully!');
        }, 2000);
    }
}

// ========== Data Manager Class ==========
class DataManager {
    constructor() {
        this.storageKey = APP_CONFIG.storagePrefix + 'data';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!this.getData()) {
            const initialData = {
                workers: [],
                tasks: [],
                timeEntries: [],
                invoices: [],
                expenses: [],
                projects: [],
                clients: [],
                settings: APP_CONFIG.defaults,
                metadata: {
                    version: APP_CONFIG.version,
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                }
            };
            this.saveData(initialData);
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading data:', error);
            return null;
        }
    }

    saveData(data) {
        try {
            data.metadata.lastModified = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    getWorkers() {
        const data = this.getData();
        return data?.workers || [];
    }

    getTasks() {
        const data = this.getData();
        return data?.tasks || [];
    }

    getDashboardStats() {
        const data = this.getData();
        const today = new Date().toDateString();
        
        const todayEntries = (data?.timeEntries || []).filter(entry => 
            new Date(entry.date).toDateString() === today
        );
        
        const hoursToday = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const activeWorkers = new Set(todayEntries.map(entry => entry.workerId)).size;
        const totalWorkers = (data?.workers || []).length;
        const tasksCompleted = (data?.tasks || []).filter(task => 
            task.status === 'completed' && 
            new Date(task.completedAt).toDateString() === today
        ).length;
        const revenue = todayEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);
        
        return {
            hoursToday,
            activeWorkers,
            totalWorkers,
            tasksCompleted,
            revenue
        };
    }

    getRecentActivity() {
        // Mock recent activity
        return [
            {
                type: 'task_completed',
                title: 'Task Completed',
                description: 'John Doe completed "Repair Hiboy Scooter"',
                timestamp: new Date(Date.now() - 120000).toISOString()
            },
            {
                type: 'time_logged',
                title: 'Time Logged',
                description: 'Jane Smith logged 3.5 hours',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }

    search(query) {
        const data = this.getData();
        const results = [];
        
        // Search workers
        const workers = data?.workers || [];
        workers.forEach(worker => {
            if (worker.name.toLowerCase().includes(query.toLowerCase())) {
                results.push({ type: 'worker', item: worker });
            }
        });
        
        // Search tasks
        const tasks = data?.tasks || [];
        tasks.forEach(task => {
            if (task.title.toLowerCase().includes(query.toLowerCase()) ||
                task.description.toLowerCase().includes(query.toLowerCase())) {
                results.push({ type: 'task', item: task });
            }
        });
        
        return results;
    }

    getPreferences() {
        try {
            const prefs = localStorage.getItem(APP_CONFIG.storagePrefix + 'preferences');
            return prefs ? JSON.parse(prefs) : null;
        } catch (error) {
            console.error('Error reading preferences:', error);
            return null;
        }
    }

    savePreferences(preferences) {
        try {
            localStorage.setItem(APP_CONFIG.storagePrefix + 'preferences', JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    }

    saveState(state) {
        try {
            localStorage.setItem(APP_CONFIG.storagePrefix + 'state', JSON.stringify(state));
            return true;
        } catch (error) {
            console.error('Error saving state:', error);
            return false;
        }
    }
}

// ========== Notification Manager ==========
class NotificationManager {
    constructor() {
        this.queue = [];
        this.container = document.getElementById('toast-container');
    }

    show(notification) {
        const toast = this.createToast(notification);
        this.container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, notification.duration || 5000);
    }

    createToast(notification) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type || 'info'}`;
        
        const icon = this.getIcon(notification.type);
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title || 'Notification'}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return toast;
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'bell';
    }

    check() {
        // Check for pending notifications
        return [];
    }
}

// ========== Analytics Manager ==========
class AnalyticsManager {
    constructor() {
        this.events = [];
    }

    track(event, data) {
        this.events.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        
        // In production, send to analytics service
        console.log(`📊 Analytics: ${event}`, data);
    }

    update() {
        // Update analytics dashboard
        console.log('Updating analytics...');
    }
}

// ========== Validation Manager ==========
class ValidationManager {
    constructor() {
        this.rules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^\+?[\d\s-()]+$/,
            number: /^\d+(\.\d+)?$/,
            required: /.+/
        };
    }

    validate(value, rules) {
        const errors = [];
        
        rules.forEach(rule => {
            if (rule === 'required' && !value) {
                errors.push('This field is required');
            } else if (rule === 'email' && !this.rules.email.test(value)) {
                errors.push('Invalid email address');
            } else if (rule === 'phone' && !this.rules.phone.test(value)) {
                errors.push('Invalid phone number');
            } else if (rule === 'number' && !this.rules.number.test(value)) {
                errors.push('Must be a valid number');
            }
        });
        
        return errors;
    }
}

// ========== Export Manager ==========
class ExportManager {
    constructor() {
        this.formats = ['json', 'csv', 'pdf', 'excel'];
    }

    export(data, format, filename) {
        switch (format) {
            case 'json':
                this.exportJSON(data, filename);
                break;
            case 'csv':
                this.exportCSV(data, filename);
                break;
            case 'pdf':
                this.exportPDF(data, filename);
                break;
            case 'excel':
                this.exportExcel(data, filename);
                break;
            default:
                console.error('Unsupported export format:', format);
        }
    }

    exportJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `${filename}.json`);
    }

    exportCSV(data, filename) {
        // Convert data to CSV format
        // Implementation needed
        console.log('CSV export not yet implemented');
    }

    exportPDF(data, filename) {
        // Generate PDF
        // Implementation needed
        console.log('PDF export not yet implemented');
    }

    exportExcel(data, filename) {
        // Generate Excel file
        // Implementation needed
        console.log('Excel export not yet implemented');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ========== Modal Management ==========
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ========== Initialize Application ==========
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new WorkForceApp();
    
    // Make app globally accessible for debugging
    window.app = app;
});

// ========== Service Worker Registration ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('❌ ServiceWorker registration failed:', error);
            });
    });
}
