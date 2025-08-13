/**
 * WorkForce Pro - Dashboard Module
 * Version: 2.0.0
 * Real-time dashboard management and visualization
 */

class DashboardManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
        this.refreshInterval = null;
        this.widgets = new Map();
        this.notifications = [];
        this.activityFeed = [];
        this.init();
    }

    init() {
        this.setupDashboard();
        this.initializeWidgets();
        this.loadDashboardData();
        this.startRealTimeUpdates();
        this.setupEventListeners();
    }

    setupDashboard() {
        // Set current date/time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);

        // Initialize mini calendar
        this.initializeMiniCalendar();

        // Setup weather widget (optional)
        this.setupWeatherWidget();

        // Initialize performance monitor
        this.initializePerformanceMonitor();
    }

    initializeWidgets() {
        // Register dashboard widgets
        this.widgets.set('stats', new StatsWidget(this));
        this.widgets.set('activity', new ActivityWidget(this));
        this.widgets.set('performance', new PerformanceWidget(this));
        this.widgets.set('tasks', new TasksWidget(this));
        this.widgets.set('schedule', new ScheduleWidget(this));
        this.widgets.set('notifications', new NotificationsWidget(this));

        // Initialize each widget
        this.widgets.forEach(widget => widget.init());
    }

    loadDashboardData() {
        // Load all dashboard data
        this.updateStats();
        this.loadActivityFeed();
        this.loadTopPerformers();
        this.loadRecentTasks();
        this.loadUpcomingEvents();
        this.initializeCharts();
    }

    updateStats() {
        const stats = this.dataManager.getDashboardStats();
        
        // Animate counter updates
        this.animateCounter('total-hours-today', stats.hoursToday, 1);
        this.animateCounter('active-workers', stats.activeWorkers, 0);
        this.animateCounter('tasks-completed', stats.tasksCompleted, 0);
        this.animateCounter('todays-revenue', stats.revenue, 2, '$');

        // Update progress bars
        this.updateProgressBars(stats);

        // Update trend indicators
        this.updateTrendIndicators(stats);

        // Mini charts in stat cards
        this.updateMiniCharts(stats);
    }

    animateCounter(elementId, targetValue, decimals = 0, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            element.textContent = prefix + currentValue.toFixed(decimals);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    updateProgressBars(stats) {
        // Workers progress
        const workersProgress = (stats.activeWorkers / stats.totalWorkers) * 100;
        const workersBar = document.getElementById('workers-progress');
        if (workersBar) {
            workersBar.style.width = `${workersProgress}%`;
            workersBar.setAttribute('data-tooltip', `${stats.activeWorkers} of ${stats.totalWorkers} workers active`);
        }

        // Tasks progress
        const tasksProgress = (stats.tasksCompleted / Math.max(1, stats.totalTasks)) * 100;
        this.updateProgressBar('tasks-progress', tasksProgress);

        // Revenue progress (against daily goal)
        const revenueGoal = 1000; // Example daily goal
        const revenueProgress = (stats.revenue / revenueGoal) * 100;
        this.updateProgressBar('revenue-progress', revenueProgress);
    }

    updateProgressBar(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${Math.min(100, percentage)}%`;
            
            // Add color coding based on percentage
            element.classList.remove('low', 'medium', 'high');
            if (percentage < 33) {
                element.classList.add('low');
            } else if (percentage < 66) {
                element.classList.add('medium');
            } else {
                element.classList.add('high');
            }
        }
    }

    updateTrendIndicators(stats) {
        // Compare with previous period
        const trends = {
            hours: this.calculateTrend(stats.hoursToday, stats.hoursYesterday),
            workers: this.calculateTrend(stats.activeWorkers, stats.activeWorkersYesterday),
            tasks: this.calculateTrend(stats.tasksCompleted, stats.tasksCompletedYesterday),
            revenue: this.calculateTrend(stats.revenue, stats.revenueYesterday)
        };

        // Update UI with trends
        Object.keys(trends).forEach(key => {
            const element = document.querySelector(`[data-trend="${key}"]`);
            if (element) {
                const trend = trends[key];
                element.innerHTML = `
                    <i class="fas fa-arrow-${trend.direction}"></i>
                    ${Math.abs(trend.percentage)}%
                `;
                element.className = `stat-change ${trend.direction === 'up' ? 'positive' : 'negative'}`;
            }
        });
    }

    calculateTrend(current, previous) {
        if (!previous || previous === 0) {
            return { direction: 'up', percentage: 0 };
        }
        
        const change = ((current - previous) / previous) * 100;
        return {
            direction: change >= 0 ? 'up' : 'down',
            percentage: Math.abs(change).toFixed(1)
        };
    }

    updateMiniCharts(stats) {
        // Hours mini chart
        const hoursCtx = document.getElementById('hours-mini-chart');
        if (hoursCtx) {
            if (this.charts.hoursMini) {
                this.charts.hoursMini.destroy();
            }
            
            this.charts.hoursMini = new Chart(hoursCtx, {
                type: 'line',
                data: {
                    labels: stats.last7Days,
                    datasets: [{
                        data: stats.hoursLast7Days,
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }

        // Revenue sparkline
        this.createSparkline('revenue-sparkline', stats.revenueLast7Days);
    }

    createSparkline(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Create SVG sparkline
        const width = 100;
        const height = 30;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        element.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;">
                <polyline
                    points="${points}"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        `;
    }

    loadActivityFeed() {
        const activities = this.dataManager.getRecentActivity();
        const timeline = document.getElementById('activity-timeline');
        
        if (!timeline) return;

        if (activities.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        // Group activities by time
        const groupedActivities = this.groupActivitiesByTime(activities);
        
        timeline.innerHTML = groupedActivities.map(group => `
            <div class="timeline-group">
                <div class="timeline-group-header">${group.label}</div>
                ${group.activities.map(activity => this.createActivityItem(activity)).join('')}
            </div>
        `).join('');

        // Add click handlers
        this.attachActivityHandlers();
    }

    groupActivitiesByTime(activities) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: { label: 'Today', activities: [] },
            yesterday: { label: 'Yesterday', activities: [] },
            older: { label: 'Earlier', activities: [] }
        };

        activities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            if (activityDate >= today) {
                groups.today.activities.push(activity);
            } else if (activityDate >= yesterday) {
                groups.yesterday.activities.push(activity);
            } else {
                groups.older.activities.push(activity);
            }
        });

        return Object.values(groups).filter(group => group.activities.length > 0);
    }

    createActivityItem(activity) {
        const icon = this.getActivityIcon(activity.type);
        const color = this.getActivityColor(activity.type);
        const timeAgo = this.getRelativeTime(activity.timestamp);
        
        return `
            <div class="timeline-item" data-activity-id="${activity.id}">
                <div class="timeline-marker ${color}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${activity.title}</span>
                        <span class="timeline-time" data-timestamp="${activity.timestamp}">${timeAgo}</span>
                    </div>
                    <p class="timeline-description">${activity.description}</p>
                    ${activity.metadata ? this.createActivityMetadata(activity.metadata) : ''}
                </div>
            </div>
        `;
    }

    createActivityMetadata(metadata) {
        return `
            <div class="timeline-metadata">
                ${metadata.user ? `<span class="meta-user"><i class="fas fa-user"></i> ${metadata.user}</span>` : ''}
                ${metadata.amount ? `<span class="meta-amount"><i class="fas fa-dollar-sign"></i> ${metadata.amount}</span>` : ''}
                ${metadata.duration ? `<span class="meta-duration"><i class="fas fa-clock"></i> ${metadata.duration}</span>` : ''}
            </div>
        `;
    }

    loadTopPerformers() {
        const workers = this.dataManager.getTopPerformers(5);
        const container = document.getElementById('top-workers');
        
        if (!container) return;

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
                    ${this.getWorkerAvatar(worker)}
                </div>
                <div class="worker-details">
                    <div class="worker-name">${worker.name}</div>
                    <div class="worker-stats">
                        ${worker.hoursThisWeek.toFixed(1)} hrs • ${worker.tasksCompleted} tasks
                    </div>
                </div>
                <div class="worker-performance">
                    <div class="performance-value">${worker.performanceScore}%</div>
                    <div class="performance-label">Score</div>
                </div>
            </div>
        `).join('');
    }

    loadRecentTasks() {
        const tasks = this.dataManager.getRecentTasks(5);
        const container = document.getElementById('recent-tasks');
        
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent tasks</p>';
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.priority}-priority" data-task-id="${task.id}">
                <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}"
                     onclick="dashboardManager.toggleTask('${task.id}')">
                    ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-details">
                    <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                    <div class="task-meta">
                        ${task.assignee ? `
                            <span class="task-assignee">
                                <i class="fas fa-user"></i> ${task.assignee}
                            </span>
                        ` : ''}
                        ${task.dueDate ? `
                            <span class="task-due ${this.isOverdue(task.dueDate) ? 'overdue' : ''}">
                                <i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <button class="task-action" onclick="dashboardManager.openTaskDetails('${task.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `).join('');
    }

    loadUpcomingEvents() {
        const events = this.dataManager.getUpcomingEvents(7);
        const calendar = document.getElementById('mini-calendar');
        
        if (!calendar) return;

        // Render mini calendar with events
        this.renderMiniCalendar(events);
    }

    renderMiniCalendar(events) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        let calendarHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" onclick="dashboardManager.changeMonth(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="calendar-month">${monthNames[currentMonth]} ${currentYear}</div>
                <button class="calendar-nav-btn" onclick="dashboardManager.changeMonth(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-weekdays">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div class="calendar-days">
        `;
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day other-month"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = this.isSameDay(date, today);
            const hasEvents = events.some(e => this.isSameDay(new Date(e.date), date));
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}"
                     data-date="${date.toISOString()}"
                     onclick="dashboardManager.showDayEvents('${date.toISOString()}')">
                    ${day}
                    ${hasEvents ? '<span class="event-indicator"></span>' : ''}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        const container = document.getElementById('mini-calendar');
        if (container) {
            container.innerHTML = calendarHTML;
        }
    }

    initializeCharts() {
        // Weekly Performance Chart
        this.createPerformanceChart();
        
        // Task Distribution Chart
        this.createTaskDistributionChart();
        
        // Revenue Trend Chart
        this.createRevenueTrendChart();
        
        // Worker Efficiency Chart
        this.createWorkerEfficiencyChart();
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        const data = this.dataManager.getWeeklyPerformance();
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Hours Worked',
                        data: data.hours,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        yAxisID: 'y-hours',
                        tension: 0.4
                    },
                    {
                        label: 'Tasks Completed',
                        data: data.tasks,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y-tasks',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    'y-hours': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    'y-tasks': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tasks'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    createTaskDistributionChart() {
        const ctx = document.getElementById('task-distribution-chart');
        if (!ctx) return;

        const data = this.dataManager.getTaskDistribution();
        
        this.charts.taskDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#9ca3af',
                        '#3b82f6',
                        '#f59e0b',
                        '#10b981'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createRevenueTrendChart() {
        const ctx = document.getElementById('revenue-trend-chart');
        if (!ctx) return;

        const data = this.dataManager.getRevenueTrend();
        
        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Revenue',
                    data: data.values,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    createWorkerEfficiencyChart() {
        const ctx = document.getElementById('worker-efficiency-chart');
        if (!ctx) return;

        const data = this.dataManager.getWorkerEfficiency();
        
        this.charts.efficiency = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Current Week',
                    data: data.current,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1'
                }, {
                    label: 'Previous Week',
                    data: data.previous,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    startRealTimeUpdates() {
        // Update dashboard every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 30000);

        // Update relative times every minute
        setInterval(() => {
            this.updateRelativeTimes();
        }, 60000);
    }

    refreshDashboard() {
        // Refresh only changed data
        const newStats = this.dataManager.getDashboardStats();
        const currentStats = this.getCurrentStats();
        
        if (this.hasStatsChanged(currentStats, newStats)) {
            this.updateStats();
        }

        // Check for new activities
        const newActivities = this.dataManager.getRecentActivity();
        if (this.hasNewActivities(newActivities)) {
            this.loadActivityFeed();
            this.showNewActivityNotification(newActivities[0]);
        }

        // Update charts with animation
        this.updateChartsData();
    }

    updateChartsData() {
        // Update performance chart
        if (this.charts.performance) {
            const data = this.dataManager.getWeeklyPerformance();
            this.charts.performance.data.datasets[0].data = data.hours;
            this.charts.performance.data.datasets[1].data = data.tasks;
            this.charts.performance.update('none');
        }

        // Update other charts similarly
        this.updateChartIfExists('taskDistribution');
        this.updateChartIfExists('revenue');
        this.updateChartIfExists('efficiency');
    }

    updateChartIfExists(chartName) {
        if (this.charts[chartName]) {
            // Get fresh data and update
            const freshData = this.getChartData(chartName);
            if (freshData) {
                this.charts[chartName].data = freshData;
                this.charts[chartName].update('none');
            }
        }
    }

    getChartData(chartName) {
        switch (chartName) {
            case 'taskDistribution':
                return this.dataManager.getTaskDistribution();
            case 'revenue':
                return this.dataManager.getRevenueTrend();
            case 'efficiency':
                return this.dataManager.getWorkerEfficiency();
            default:
                return null;
        }
    }

    setupEventListeners() {
        // Listen for global events
        document.addEventListener('taskCompleted', (e) => {
            this.handleTaskCompleted(e.detail);
        });

        document.addEventListener('workerAdded', (e) => {
            this.handleWorkerAdded(e.detail);
        });

        document.addEventListener('timeEntryAdded', (e) => {
            this.handleTimeEntryAdded(e.detail);
        });

        // Widget interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.widget-menu-btn')) {
                this.showWidgetMenu(e.target.closest('.widget-menu-btn'));
            }
            
            if (e.target.closest('.notification-item')) {
                this.handleNotificationClick(e.target.closest('.notification-item'));
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R: Refresh dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshDashboard();
            }
            
            // Ctrl/Cmd + D: Toggle dashboard view
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleDashboardView();
            }
        });
    }

    handleTaskCompleted(task) {
        // Update stats
        this.updateStats();
        
        // Add to activity feed
        this.addActivityItem({
            type: 'task_completed',
            title: 'Task Completed',
            description: `${task.assignee || 'Someone'} completed "${task.title}"`,
            timestamp: new Date().toISOString(),
            metadata: {
                user: task.assignee,
                taskId: task.id
            }
        });

        // Show notification
        this.showNotification({
            type: 'success',
            title: 'Task Completed',
            message: `${task.title} has been marked as complete`,
            duration: 3000
        });
    }

    handleWorkerAdded(worker) {
        this.updateStats();
        this.loadTopPerformers();
        
        this.showNotification({
            type: 'info',
            title: 'New Worker Added',
            message: `${worker.name} has been added to the team`,
            duration: 3000
        });
    }

    handleTimeEntryAdded(entry) {
        this.updateStats();
        this.updateChartsData();
        
        // Calculate amount
        const amount = entry.hours * entry.rate;
        
        this.addActivityItem({
            type: 'time_logged',
            title: 'Time Logged',
            description: `${entry.workerName} logged ${entry.hours} hours`,
            timestamp: new Date().toISOString(),
            metadata: {
                user: entry.workerName,
                duration: `${entry.hours} hours`,
                amount: `$${amount.toFixed(2)}`
            }
        });
    }

    addActivityItem(activity) {
        activity.id = this.generateId();
        this.activityFeed.unshift(activity);
        
        // Keep only last 50 activities
        if (this.activityFeed.length > 50) {
            this.activityFeed = this.activityFeed.slice(0, 50);
        }
        
        // Update UI
        this.loadActivityFeed();
    }

    showNotification(notification) {
        // Add to notifications widget
        this.widgets.get('notifications')?.addNotification(notification);
        
        // Show toast notification
        app.showNotification(notification);
    }

    showNewActivityNotification(activity) {
        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Activity', {
                body: activity.description,
                icon: '/icon-192.png',
                tag: activity.id
            });
        }
    }

    toggleTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        this.dataManager.updateTask(taskId, { status: newStatus });
        
        // Reload tasks
        this.loadRecentTasks();
        this.updateStats();
        
        // Trigger event
        if (newStatus === 'completed') {
            document.dispatchEvent(new CustomEvent('taskCompleted', { detail: task }));
        }
    }

    openTaskDetails(taskId) {
        // Open task modal or navigate to task view
        if (window.tasksManager) {
            window.tasksManager.viewTask(taskId);
        }
    }

    changeMonth(direction) {
        // Change calendar month
        this.currentMonth = (this.currentMonth || new Date().getMonth()) + direction;
        this.currentYear = this.currentYear || new Date().getFullYear();
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        this.renderMiniCalendar(this.dataManager.getUpcomingEvents(7));
    }

    showDayEvents(date) {
        const events = this.dataManager.getEventsForDate(date);
        
        // Show events in a modal or popover
        console.log('Events for', date, events);
    }

    // Helper methods
    updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Update time
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    updateRelativeTimes() {
        document.querySelectorAll('[data-timestamp]').forEach(element => {
            const timestamp = element.dataset.timestamp;
            element.textContent = this.getRelativeTime(timestamp);
        });
    }

    getRelativeTime(timestamp) {
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
                return interval === 1 
                    ? `1 ${unit} ago`
                    : `${interval} ${unit}s ago`;
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
            payment_received: 'dollar-sign',
            expense_added: 'receipt',
            note_added: 'sticky-note'
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
            payment_received: 'success',
            expense_added: 'danger',
            note_added: 'secondary'
        };
        return colors[type] || 'secondary';
    }

    getWorkerAvatar(worker) {
        if (worker.avatar) {
            return `<img src="${worker.avatar}" alt="${worker.name}">`;
        }
        
        const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
        const colorIndex = worker.name.charCodeAt(0) % colors.length;
        
        return `<div style="background: ${colors[colorIndex]}">${initials}</div>`;
    }

    formatDate(date) {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (this.isSameDay(d, today)) {
            return 'Today';
        }
        if (this.isSameDay(d, tomorrow)) {
            return 'Tomorrow';
        }
        
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentStats() {
        // Get current displayed stats for comparison
        return {
            hoursToday: parseFloat(document.getElementById('total-hours-today')?.textContent || 0),
            activeWorkers: parseInt(document.getElementById('active-workers')?.textContent || 0),
            tasksCompleted: parseInt(document.getElementById('tasks-completed')?.textContent || 0),
            revenue: parseFloat(document.getElementById('todays-revenue')?.textContent.replace('$', '') || 0)
        };
    }

    hasStatsChanged(oldStats, newStats) {
        return JSON.stringify(oldStats) !== JSON.stringify(newStats);
    }

    hasNewActivities(activities) {
        if (!this.lastActivityId) {
            this.lastActivityId = activities[0]?.id;
            return false;
        }
        
        const hasNew = activities[0]?.id !== this.lastActivityId;
        if (hasNew) {
            this.lastActivityId = activities[0]?.id;
        }
        
        return hasNew;
    }

    initializeMiniCalendar() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.loadUpcomingEvents();
    }

    setupWeatherWidget() {
        // Optional weather widget
        // Could integrate with weather API
    }

    initializePerformanceMonitor() {
        // Monitor dashboard performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log(`Dashboard ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    toggleDashboardView() {
        // Toggle between different dashboard layouts
        const dashboard = document.getElementById('dashboard-tab');
        if (dashboard) {
            dashboard.classList.toggle('compact-view');
        }
    }

    destroy() {
        // Cleanup
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        
        // Destroy widgets
        this.widgets.forEach(widget => widget.destroy?.());
    }
}

// Widget Classes
class StatsWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        // Initialize stats widget
    }

    update(data) {
        // Update stats display
    }
}

class ActivityWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        // Initialize activity widget
    }

    addActivity(activity) {
        // Add new activity to feed
    }
}

class PerformanceWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        // Initialize performance widget
    }

    updateMetrics(metrics) {
        // Update performance metrics
    }
}

class TasksWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        // Initialize tasks widget
    }

    refreshTasks() {
        // Refresh task list
    }
}

class ScheduleWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        // Initialize schedule widget
    }

    updateSchedule(events) {
        // Update schedule display
    }
}

class NotificationsWidget {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.notifications = [];
    }

    init() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    addNotification(notification) {
        notification.id = Date.now();
        notification.timestamp = new Date().toISOString();
        this.notifications.unshift(notification);
        
        // Keep only last 20 notifications
        if (this.notifications.length > 20) {
            this.notifications = this.notifications.slice(0, 20);
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        // Update notifications display in UI
        const badge = document.querySelector('.notification-dot');
        if (badge) {
            const unread = this.notifications.filter(n => !n.read).length;
            badge.style.display = unread > 0 ? 'block' : 'none';
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateDisplay();
        }
    }

    clearAll() {
        this.notifications = [];
        this.updateDisplay();
    }
}

// Initialize Dashboard Manager
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.modules.dataManager) {
        window.dashboardManager = new DashboardManager(window.app.modules.dataManager);
    }
});
