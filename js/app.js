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

    loadTimesheet() {
        const container = document.getElementById('timesheet-tab');
        if (!container) return;

        const timeEntries = this.modules.dataManager.getTimeEntries();
        const workers = this.modules.dataManager.getWorkers();
        
        // Get current week dates
        const weekDates = this.getWeekDates();
        
        // Generate timesheet HTML
        const timesheetHTML = `
            <div class="timesheet-header">
                <div class="timesheet-controls">
                    <button class="btn-secondary" id="prev-week">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <div class="week-selector">
                        <i class="fas fa-calendar-week"></i>
                        <span id="current-week">${this.formatWeekRange(weekDates)}</span>
                    </div>
                    <button class="btn-secondary" id="next-week">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="timesheet-actions">
                    <button class="btn-primary" onclick="app.openQuickAdd()">
                        <i class="fas fa-plus"></i> Add Entry
                    </button>
                    <button class="btn-secondary" onclick="app.exportTimesheet()">
                        <i class="fas fa-file-export"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="timesheet-container">
                <table class="timesheet-table">
                    <thead>
                        <tr>
                            <th>Worker</th>
                            ${weekDates.map(date => `<th>${date.toLocaleDateString('en-US', { weekday: 'short' })}<br><small>${date.getDate()}</small></th>`).join('')}
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="timesheet-body">
                        ${workers.map(worker => this.generateWorkerTimesheetRow(worker, weekDates, timeEntries)).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Daily Totals</strong></td>
                            ${weekDates.map(date => `<td class="total">${this.getDayTotal(date, timeEntries)}</td>`).join('')}
                            <td class="total grand-total">${this.getWeekTotal(weekDates, timeEntries)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        container.innerHTML = timesheetHTML;
        
        // Add event listeners
        this.setupTimesheetEventListeners();
    }

    loadWorkers() {
        // Workers content is handled by WorkersManager
        if (window.workersManager) {
            window.workersManager.loadWorkers();
        }
    }

    loadTasks() {
        // Tasks content is handled by TasksManager
        if (window.tasksManager) {
            window.tasksManager.loadTasks();
        }
    }

    loadSchedule() {
        const container = document.getElementById('schedule-tab');
        if (!container) return;

        const scheduleHTML = `
            <div class="schedule-header">
                <h2>Schedule Management</h2>
                <div class="schedule-actions">
                    <button class="btn-primary" onclick="app.addScheduleEvent()">
                        <i class="fas fa-plus"></i> Add Event
                    </button>
                    <div class="view-toggle">
                        <button class="btn-secondary active" data-view="month">Month</button>
                        <button class="btn-secondary" data-view="week">Week</button>
                        <button class="btn-secondary" data-view="day">Day</button>
                    </div>
                </div>
            </div>
            
            <div class="schedule-calendar" id="schedule-calendar">
                ${this.generateCalendarHTML()}
            </div>
        `;
        
        container.innerHTML = scheduleHTML;
        this.initializeScheduleCalendar();
    }

    loadInvoices() {
        const container = document.getElementById('invoices-tab');
        if (!container) return;

        const invoices = this.modules.dataManager.getInvoices();
        
        const invoicesHTML = `
            <div class="invoices-header">
                <h2>Invoice Management</h2>
                <div class="invoices-actions">
                    <button class="btn-primary" onclick="app.createInvoice()">
                        <i class="fas fa-file-invoice"></i> Create Invoice
                    </button>
                    <button class="btn-secondary" onclick="app.exportInvoices()">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="invoices-filters">
                <select class="filter-select" onchange="app.filterInvoices(this.value)">
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                </select>
                <input type="text" placeholder="Search invoices..." class="search-input" oninput="app.searchInvoices(this.value)">
            </div>
            
            <div class="invoices-grid">
                ${invoices.map(invoice => this.generateInvoiceCard(invoice)).join('')}
            </div>
        `;
        
        container.innerHTML = invoicesHTML;
    }

    loadReports() {
        // Reports content is handled by ReportsManager
        if (window.reportsManager) {
            // Switch to reports tab
            window.reportsManager.loadOverviewReport();
        }
    }

    loadAnalytics() {
        const container = document.getElementById('analytics-tab');
        if (!container) return;

        const analyticsHTML = `
            <div class="analytics-header">
                <h2>Business Analytics</h2>
                <div class="analytics-controls">
                    <select class="date-range-select" onchange="app.updateAnalyticsDateRange(this.value)">
                        <option value="7">Last 7 days</option>
                        <option value="30" selected>Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>
            
            <div class="analytics-dashboard">
                <div class="analytics-cards">
                    <div class="analytics-card">
                        <h3>Revenue Growth</h3>
                        <div class="metric-value">+23.5%</div>
                        <canvas id="revenue-trend-mini"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h3>Productivity Index</h3>
                        <div class="metric-value">87%</div>
                        <canvas id="productivity-mini"></canvas>
                    </div>
                    <div class="analytics-card">
                        <h3>Client Satisfaction</h3>
                        <div class="metric-value">4.8/5</div>
                        <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                    </div>
                </div>
                
                <div class="analytics-charts">
                    <div class="chart-container">
                        <h3>Business Performance</h3>
                        <canvas id="business-performance-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Worker Efficiency</h3>
                        <canvas id="worker-efficiency-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = analyticsHTML;
        this.initializeAnalyticsCharts();
    }

    loadSettings() {
        const container = document.getElementById('settings-tab');
        if (!container) return;

        const settings = this.modules.dataManager.getSettings();
        
        const settingsHTML = `
            <div class="settings-header">
                <h2>Application Settings</h2>
                <button class="btn-primary" onclick="app.saveSettings()">
                    <i class="fas fa-save"></i> Save Settings
                </button>
            </div>
            
            <div class="settings-sections">
                <div class="settings-section">
                    <h3>General Settings</h3>
                    <div class="setting-item">
                        <label>Business Name</label>
                        <input type="text" id="business-name" value="${settings.businessName || ''}" placeholder="Your Business Name">
                    </div>
                    <div class="setting-item">
                        <label>Default Hourly Rate</label>
                        <input type="number" id="default-rate" value="${settings.defaultRate || 15}" step="0.01" min="0">
                    </div>
                    <div class="setting-item">
                        <label>Currency</label>
                        <select id="currency">
                            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Time Tracking</h3>
                    <div class="setting-item">
                        <label>Overtime Multiplier</label>
                        <input type="number" id="overtime-multiplier" value="${settings.overtimeMultiplier || 1.5}" step="0.1" min="1">
                    </div>
                    <div class="setting-item">
                        <label>Max Hours Per Day</label>
                        <input type="number" id="max-hours" value="${settings.maxHoursPerDay || 24}" min="1" max="24">
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="auto-break" ${settings.autoBreak ? 'checked' : ''}> 
                            Automatic Break Deduction
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Notifications</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="email-notifications" ${settings.emailNotifications ? 'checked' : ''}> 
                            Email Notifications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="push-notifications" ${settings.pushNotifications ? 'checked' : ''}> 
                            Push Notifications
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="setting-item">
                        <button class="btn-secondary" onclick="app.exportAllData()">
                            <i class="fas fa-download"></i> Export All Data
                        </button>
                    </div>
                    <div class="setting-item">
                        <button class="btn-secondary" onclick="app.importData()">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                    </div>
                    <div class="setting-item">
                        <button class="btn-danger" onclick="app.clearAllData()">
                            <i class="fas fa-trash"></i> Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = settingsHTML;
    }

    updateDashboardStats() {
        const stats = this.modules.dataManager.getDashboardStats();
        
        // Update stat cards
        const elements = {
            'total-hours-today': stats.hoursToday.toFixed(1),
            'active-workers': stats.activeWorkers,
            'total-workers': stats.totalWorkers,
            'tasks-completed': stats.tasksCompleted,
            'todays-revenue': `$${stats.revenue.toFixed(2)}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update progress bars
        const workersProgress = (stats.activeWorkers / stats.totalWorkers) * 100;
        const progressBar = document.getElementById('workers-progress');
        if (progressBar) {
            progressBar.style.width = `${workersProgress}%`;
        }
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

    updateDashboardCharts() {
        // Performance Chart
        const perfCtx = document.getElementById('performance-chart');
        if (perfCtx && !this.charts?.performance) {
            const data = this.modules.dataManager.getWeeklyPerformance();
            this.charts = this.charts || {};
            this.charts.performance = new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Hours Worked',
                        data: data.hours || [8, 7.5, 8, 9, 8.5, 4, 0],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }

    loadTopWorkers() {
        const container = document.getElementById('top-workers');
        if (!container) return;
        
        const workers = this.modules.dataManager.getTopPerformers(5);
        
        if (workers.length === 0) {
            container.innerHTML = '<p class="text-muted">No data available</p>';
            return;
        }
        
        container.innerHTML = workers.map((worker, index) => `
            <div class="worker-item ${index === 0 ? 'top-performer' : ''}">
                <div class="worker-rank">
                    ${index === 0 ? '<i class="fas fa-trophy"></i>' : index + 1}
                </div>
                <div class="worker-avatar">
                    ${this.getWorkerInitials(worker.name)}
                </div>
                <div class="worker-details">
                    <div class="worker-name">${worker.name}</div>
                    <div class="worker-stats">
                        ${worker.hours?.toFixed(1) || '0'} hrs • ${worker.tasks || 0} tasks
                    </div>
                </div>
                <div class="worker-performance">
                    <div class="performance-value">${worker.efficiency || 0}%</div>
                    <div class="performance-label">Score</div>
                </div>
            </div>
        `).join('');
    }

    loadRecentTasks() {
        const container = document.getElementById('recent-tasks');
        if (!container) return;
        
        const tasks = this.modules.dataManager.getRecentTasks(5);
        
        if (tasks.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent tasks</p>';
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.priority}-priority" data-task-id="${task.id}">
                <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}">
                    ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-details">
                    <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                    <div class="task-meta">
                        ${task.assignee ? `<span class="task-assignee"><i class="fas fa-user"></i> ${task.assignee}</span>` : ''}
                        ${task.dueDate ? `<span class="task-due"><i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    initTooltips() {
        // Initialize tooltips for elements with title attributes
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.title;
                
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                e.target._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', (e) => {
                if (e.target._tooltip) {
                    e.target._tooltip.remove();
                    delete e.target._tooltip;
                }
            });
        });
    }

    initCharts() {
        // Initialize Chart.js defaults
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter, sans-serif';
            Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
        }
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
        // TODO: Display search results in dropdown
    }

    handleResize() {
        // Handle responsive adjustments
        if (window.innerWidth < 992) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('mobile-open');
        }
    }

    // Helper methods for timesheet
    getWeekDates(offset = 0) {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - start.getDay() + (offset * 7));
        
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    formatWeekRange(dates) {
        const start = dates[0];
        const end = dates[6];
        return `Week of ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }

    generateWorkerTimesheetRow(worker, weekDates, timeEntries) {
        const workerEntries = timeEntries.filter(e => e.workerId === worker.id);
        
        const dailyHours = weekDates.map(date => {
            const dayEntries = workerEntries.filter(e => 
                new Date(e.date).toDateString() === date.toDateString()
            );
            return dayEntries.reduce((sum, e) => sum + e.hours, 0);
        });
        
        const totalHours = dailyHours.reduce((sum, h) => sum + h, 0);
        
        return `
            <tr data-worker-id="${worker.id}">
                <td class="worker-cell">
                    <div class="worker-info">
                        <div class="worker-avatar-small">${this.getWorkerInitials(worker.name)}</div>
                        <span>${worker.name}</span>
                    </div>
                </td>
                ${dailyHours.map(hours => `<td class="hours-cell">${hours > 0 ? hours.toFixed(1) : '-'}</td>`).join('')}
                <td class="total-cell">${totalHours.toFixed(1)}</td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="app.editWorkerWeek('${worker.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    getDayTotal(date, timeEntries) {
        const dayEntries = timeEntries.filter(e => 
            new Date(e.date).toDateString() === date.toDateString()
        );
        const total = dayEntries.reduce((sum, e) => sum + e.hours, 0);
        return total > 0 ? total.toFixed(1) : '0';
    }

    getWeekTotal(weekDates, timeEntries) {
        const total = weekDates.reduce((sum, date) => {
            const dayTotal = parseFloat(this.getDayTotal(date, timeEntries));
            return sum + dayTotal;
        }, 0);
        return total.toFixed(1);
    }

    setupTimesheetEventListeners() {
        // Previous/Next week buttons
        document.getElementById('prev-week')?.addEventListener('click', () => this.changeWeek(-1));
        document.getElementById('next-week')?.addEventListener('click', () => this.changeWeek(1));
    }

    changeWeek(direction) {
        this.currentWeekOffset = (this.currentWeekOffset || 0) + direction;
        this.loadTimesheet();
    }

    // Additional utility methods
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

    getWorkerInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    formatDate(date) {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (d.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (d.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

    // Methods for other tabs
    generateCalendarHTML() {
        // Generate basic calendar structure
        return `
            <div class="calendar-view">
                <div class="calendar-header">
                    <button class="btn-icon" onclick="app.changeMonth(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="calendar-month-year"></h3>
                    <button class="btn-icon" onclick="app.changeMonth(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-grid" id="calendar-grid">
                    <!-- Calendar will be rendered here -->
                </div>
            </div>
        `;
    }

    initializeScheduleCalendar() {
        // Initialize calendar functionality
        this.currentDate = new Date();
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        document.getElementById('calendar-month-year').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let calendarHTML = '<div class="calendar-weekdays">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            calendarHTML += `<div class="weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = this.isToday(year, month, day);
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${year}-${month+1}-${day}">
                    <span class="day-number">${day}</span>
                    <div class="day-events"></div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        document.getElementById('calendar-grid').innerHTML = calendarHTML;
    }

    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    generateInvoiceCard(invoice) {
        return `
            <div class="invoice-card" data-invoice-id="${invoice.id}">
                <div class="invoice-header">
                    <span class="invoice-number">#${invoice.number}</span>
                    <span class="invoice-status ${invoice.status}">${invoice.status}</span>
                </div>
                <div class="invoice-body">
                    <h4>${invoice.clientName}</h4>
                    <p class="invoice-amount">$${invoice.amount.toFixed(2)}</p>
                    <p class="invoice-date">Due: ${this.formatDate(invoice.dueDate)}</p>
                </div>
                <div class="invoice-actions">
                    <button class="btn-sm btn-secondary" onclick="app.viewInvoice('${invoice.id}')">View</button>
                    <button class="btn-sm btn-primary" onclick="app.editInvoice('${invoice.id}')">Edit</button>
                </div>
            </div>
        `;
    }

    initializeAnalyticsCharts() {
        // Initialize analytics charts
        const perfCtx = document.getElementById('business-performance-chart');
        if (perfCtx) {
            new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12000, 15000, 13000, 17000, 16000, 19000],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    // Additional methods for settings and data management
    saveSettings() {
        const settings = {
            businessName: document.getElementById('business-name')?.value,
            defaultRate: parseFloat(document.getElementById('default-rate')?.value),
            currency: document.getElementById('currency')?.value,
            overtimeMultiplier: parseFloat(document.getElementById('overtime-multiplier')?.value),
            maxHoursPerDay: parseInt(document.getElementById('max-hours')?.value),
            autoBreak: document.getElementById('auto-break')?.checked,
            emailNotifications: document.getElementById('email-notifications')?.checked,
            pushNotifications: document.getElementById('push-notifications')?.checked
        };
        
        this.modules.dataManager.saveSettings(settings);
        this.showSuccess('Settings saved successfully!');
    }

    exportAllData() {
        const allData = {
            workers: this.modules.dataManager.getWorkers(),
            tasks: this.modules.dataManager.getTasks(),
            timeEntries: this.modules.dataManager.getTimeEntries(),
            invoices: this.modules.dataManager.getInvoices(),
            settings: this.modules.dataManager.getSettings(),
            exportDate: new Date().toISOString(),
            version: this.version
        };
        
        this.modules.exportManager.export(allData, 'json', 'workforce_pro_backup');
        this.showSuccess('Data exported successfully!');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.modules.dataManager.clearAllData();
            this.showSuccess('All data cleared successfully!');
            // Reload the page to reset the application
            setTimeout(() => window.location.reload(), 1000);
        }
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

    // Worker methods
    getWorkers() {
        const data = this.getData();
        return data?.workers || [];
    }

    getWorkerById(id) {
        const workers = this.getWorkers();
        return workers.find(w => w.id === id);
    }

    addWorker(workerData) {
        const data = this.getData();
        const worker = {
            id: this.generateId(),
            ...workerData,
            createdAt: new Date().toISOString()
        };
        data.workers.push(worker);
        this.saveData(data);
        return worker;
    }

    updateWorker(id, updates) {
        const data = this.getData();
        const index = data.workers.findIndex(w => w.id === id);
        if (index !== -1) {
            data.workers[index] = { ...data.workers[index], ...updates };
            this.saveData(data);
            return data.workers[index];
        }
        return null;
    }

    deleteWorker(id) {
        const data = this.getData();
        const index = data.workers.findIndex(w => w.id === id);
        if (index !== -1) {
            data.workers.splice(index, 1);
            this.saveData(data);
            return true;
        }
        return false;
    }

    // Task methods
    getTasks() {
        const data = this.getData();
        return data?.tasks || [];
    }

    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id);
    }

    addTask(taskData) {
        const data = this.getData();
        const task = {
            id: this.generateId(),
            ...taskData,
            createdAt: new Date().toISOString(),
            status: taskData.status || 'todo'
        };
        data.tasks.push(task);
        this.saveData(data);
        return task;
    }

    updateTask(id, updates) {
        const data = this.getData();
        const index = data.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            data.tasks[index] = { ...data.tasks[index], ...updates };
            this.saveData(data);
            return data.tasks[index];
        }
        return null;
    }

    deleteTask(id) {
        const data = this.getData();
        const index = data.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            data.tasks.splice(index, 1);
            this.saveData(data);
            return true;
        }
        return false;
    }

    // Time entry methods
    getTimeEntries() {
        const data = this.getData();
        return data?.timeEntries || [];
    }

    addTimeEntry(entryData) {
        const data = this.getData();
        const entry = {
            id: this.generateId(),
            ...entryData,
            createdAt: new Date().toISOString()
        };
        data.timeEntries.push(entry);
        this.saveData(data);
        return entry;
    }

    getTimeEntriesForWorker(workerId, startDate, endDate) {
        const entries = this.getTimeEntries();
        return entries.filter(entry => {
            if (entry.workerId !== workerId) return false;
            if (startDate && new Date(entry.date) < startDate) return false;
            if (endDate && new Date(entry.date) > endDate) return false;
            return true;
        });
    }

    getTimeEntriesRange(startDate, endDate) {
        const entries = this.getTimeEntries();
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
    }

    // Invoice methods
    getInvoices() {
        const data = this.getData();
        return data?.invoices || [];
    }

    getInvoicesRange(startDate, endDate) {
        const invoices = this.getInvoices();
        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
        });
    }

    // Statistics methods
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

    getTopPerformers(limit = 5) {
        const workers = this.getWorkers();
        const timeEntries = this.getTimeEntries();
        const tasks = this.getTasks();
        
        const performance = workers.map(worker => {
            const workerEntries = timeEntries.filter(e => e.workerId === worker.id);
            const workerTasks = tasks.filter(t => t.assigneeId === worker.id);
            
            const hours = workerEntries.reduce((sum, e) => sum + e.hours, 0);
            const tasksCompleted = workerTasks.filter(t => t.status === 'completed').length;
            const efficiency = hours > 0 ? Math.min(100, (tasksCompleted / hours) * 20) : 0;
            
            return {
                ...worker,
                hours,
                tasks: tasksCompleted,
                efficiency: Math.round(efficiency)
            };
        });
        
        return performance
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, limit);
    }

    getRecentTasks(limit = 5) {
        const tasks = this.getTasks();
        return tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    getRecentActivity() {
        const activities = [];
        const tasks = this.getTasks();
        const timeEntries = this.getTimeEntries();
        const workers = this.getWorkers();
        
        // Recent task completions
        const recentCompletions = tasks
            .filter(t => t.status === 'completed' && t.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 3)
            .map(task => ({
                type: 'task_completed',
                title: 'Task Completed',
                description: `${task.assignee || 'Someone'} completed "${task.title}"`,
                timestamp: task.completedAt
            }));
        
        // Recent time entries
        const recentEntries = timeEntries
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 2)
            .map(entry => {
                const worker = workers.find(w => w.id === entry.workerId);
                return {
                    type: 'time_logged',
                    title: 'Time Logged',
                    description: `${worker?.name || 'Someone'} logged ${entry.hours} hours`,
                    timestamp: entry.createdAt
                };
            });
        
        activities.push(...recentCompletions, ...recentEntries);
        
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
    }

    getWeeklyPerformance() {
        // Mock data for weekly performance chart
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            hours: [32, 35, 30, 38, 36, 20, 8],
            tasks: [5, 7, 4, 8, 6, 3, 1]
        };
    }

    getTotalHoursThisWeek() {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const entries = this.getTimeEntriesRange(weekStart, new Date());
        return entries.reduce((sum, entry) => sum + entry.hours, 0);
    }

    getTasksForWorker(workerId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.assigneeId === workerId);
    }

    getTasksRange(startDate, endDate) {
        const tasks = this.getTasks();
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
        });
    }

    getExpensesRange(startDate, endDate) {
        const data = this.getData();
        const expenses = data?.expenses || [];
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
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

    getSettings() {
        const data = this.getData();
        return data?.settings || APP_CONFIG.defaults;
    }

    saveSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        this.saveData(data);
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

    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(APP_CONFIG.storagePrefix + 'preferences');
        localStorage.removeItem(APP_CONFIG.storagePrefix + 'state');
        this.initializeStorage();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        let csv = '';
        
        if (Array.isArray(data)) {
            // Convert array to CSV
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                csv += headers.join(',') + '\n';
                
                data.forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        return typeof value === 'string' && value.includes(',') 
                            ? `"${value}"` 
                            : value;
                    });
                    csv += values.join(',') + '\n';
                });
            }
        } else {
            // Convert object to simple CSV
            csv = 'Property,Value\n';
            Object.entries(data).forEach(([key, value]) => {
                csv += `${key},${value}\n`;
            });
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, `${filename}.csv`);
    }

    exportPDF(data, filename) {
        // Simple PDF export using browser print
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <h1>WorkForce Pro Export</h1>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    exportExcel(data, filename) {
        // Convert to CSV and save as .xls (basic Excel format)
        this.exportCSV(data, filename.replace('.xls', '') + '.xls');
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
