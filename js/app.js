// WorkForce Tracker - Main Application JavaScript
// Comprehensive workforce management system for small businesses

// Data Management Class
class DataManager {
    constructor() {
        this.storageKey = 'workforceData';
        this.initializeData();
    }

    initializeData() {
        const existingData = this.getData();
        if (!existingData) {
            const defaultData = {
                workers: [],
                tasks: [],
                timeEntries: [],
                settings: {
                    businessName: 'My Business',
                    defaultHourlyRate: 15.00,
                    currency: 'USD'
                }
            };
            this.saveData(defaultData);
        }
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Worker Management
    addWorker(worker) {
        const data = this.getData();
        worker.id = this.generateId();
        worker.createdAt = new Date().toISOString();
        worker.status = 'active';
        data.workers.push(worker);
        this.saveData(data);
        return worker;
    }

    updateWorker(workerId, updates) {
        const data = this.getData();
        const workerIndex = data.workers.findIndex(w => w.id === workerId);
        if (workerIndex !== -1) {
            data.workers[workerIndex] = { ...data.workers[workerIndex], ...updates };
            this.saveData(data);
            return data.workers[workerIndex];
        }
        return null;
    }

    deleteWorker(workerId) {
        const data = this.getData();
        data.workers = data.workers.filter(w => w.id !== workerId);
        this.saveData(data);
    }

    getWorkers() {
        const data = this.getData();
        return data.workers || [];
    }

    // Task Management
    addTask(task) {
        const data = this.getData();
        task.id = this.generateId();
        task.createdAt = new Date().toISOString();
        data.tasks.push(task);
        this.saveData(data);
        return task;
    }

    updateTask(taskId, updates) {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
            this.saveData(data);
            return data.tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        const data = this.getData();
        data.tasks = data.tasks.filter(t => t.id !== taskId);
        this.saveData(data);
    }

    getTasks() {
        const data = this.getData();
        return data.tasks || [];
    }

    // Time Entry Management
    addTimeEntry(entry) {
        const data = this.getData();
        entry.id = this.generateId();
        entry.createdAt = new Date().toISOString();
        data.timeEntries.push(entry);
        this.saveData(data);
        return entry;
    }

    getTimeEntries(date = null) {
        const data = this.getData();
        if (!date) return data.timeEntries || [];
        
        const targetDate = new Date(date).toDateString();
        return (data.timeEntries || []).filter(entry => {
            return new Date(entry.date).toDateString() === targetDate;
        });
    }

    getTimeEntriesRange(startDate, endDate) {
        const data = this.getData();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return (data.timeEntries || []).filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
        });
    }

    // Utility Functions
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    exportData() {
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workforce_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveData(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// UI Manager Class
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.loadDashboard();
        this.populateWorkerSelects();
        setInterval(() => this.updateDateTime(), 60000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(item.dataset.tab);
            });
        });

        // Quick Add Button
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.openModal('quick-add-modal');
        });

        // Worker Management
        document.getElementById('add-worker-btn').addEventListener('click', () => {
            this.openModal('add-worker-modal');
        });

        // Task Management
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openModal('add-task-modal');
        });

        // Form Submissions
        document.getElementById('quick-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickAdd();
        });

        document.getElementById('add-worker-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddWorker();
        });

        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });

        // Task Filter
        document.getElementById('task-filter').addEventListener('change', (e) => {
            this.filterTasks(e.target.value);
        });

        // Report Generation
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        // Start Tracking Button
        document.getElementById('start-tracking').addEventListener('click', () => {
            this.openModal('quick-add-modal');
        });

        // View All Activities
        document.getElementById('view-all-activities').addEventListener('click', () => {
            this.switchTab('reports');
        });

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quick-date').value = today;
        document.getElementById('report-end-date').value = today;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        document.getElementById('report-start-date').value = thirtyDaysAgo.toISOString().split('T')[0];
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            workers: 'Workers',
            tasks: 'Tasks',
            reports: 'Reports & Analytics'
        };
        document.getElementById('page-title').textContent = titles[tabName];

        // Load tab-specific content
        this.currentTab = tabName;
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'workers':
                this.loadWorkers();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'reports':
                // Reports are loaded on demand
                break;
        }
    }

    loadDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.dataManager.getTimeEntries(today);
        const workers = this.dataManager.getWorkers();
        const tasks = this.dataManager.getTasks();
        
        // Calculate stats
        const totalHours = todayEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
        const activeWorkers = new Set(todayEntries.map(entry => entry.workerId)).size;
        const completedTasks = tasks.filter(task => 
            task.status === 'completed' && 
            new Date(task.updatedAt || task.createdAt).toDateString() === new Date().toDateString()
        ).length;
        const todaysEarnings = todayEntries.reduce((sum, entry) => 
            sum + (parseFloat(entry.hours) * parseFloat(entry.rate)), 0
        );

        // Update stats
        document.getElementById('total-hours-today').textContent = totalHours.toFixed(1);
        document.getElementById('active-workers').textContent = activeWorkers;
        document.getElementById('tasks-completed').textContent = completedTasks;
        document.getElementById('todays-earnings').textContent = `$${todaysEarnings.toFixed(2)}`;

        // Load today's activities
        this.loadTodaysActivities(todayEntries);
    }

    loadTodaysActivities(entries) {
        const container = document.getElementById('todays-activities');
        
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" fill="currentColor" opacity="0.3" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <p>No activities recorded today</p>
                    <button class="btn-secondary" onclick="uiManager.openModal('quick-add-modal')">Start Tracking</button>
                </div>
            `;
            return;
        }

        const workers = this.dataManager.getWorkers();
        const activitiesHtml = entries.map(entry => {
            const worker = workers.find(w => w.id === entry.workerId);
            const workerName = worker ? worker.name : 'Unknown Worker';
            const amount = parseFloat(entry.hours) * parseFloat(entry.rate);
            
            return `
                <div class="activity-item">
                    <div class="activity-time">${entry.hours} hours</div>
                    <div class="activity-content">
                        <div class="activity-title">${entry.taskDescription}</div>
                        <div class="activity-meta">By ${workerName} • Rate: $${entry.rate}/hr</div>
                    </div>
                    <div class="activity-amount">$${amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = activitiesHtml;
    }

    loadWorkers() {
        const workers = this.dataManager.getWorkers();
        const container = document.getElementById('workers-list');
        
        if (workers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg width="48" height="48" fill="currentColor" opacity="0.3" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <p>No workers added yet</p>
                    <button class="btn-secondary" onclick="uiManager.openModal('add-worker-modal')">Add First Worker</button>
                </div>
            `;
            return;
        }

        const workersHtml = workers.map(worker => {
            const todayEntries = this.dataManager.getTimeEntries(new Date().toISOString().split('T')[0])
                .filter(entry => entry.workerId === worker.id);
            const hoursToday = todayEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
            
            return `
                <div class="worker-card">
                    <div class="worker-header">
                        <div class="worker-name">${worker.name}</div>
                        <span class="worker-status ${worker.status}">${worker.status}</span>
                    </div>
                    <div class="worker-info">
                        ${worker.email ? `
                            <div class="worker-info-item">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                ${worker.email}
                            </div>
                        ` : ''}
                        ${worker.phone ? `
                            <div class="worker-info-item">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                </svg>
                                ${worker.phone}
                            </div>
                        ` : ''}
                        <div class="worker-info-item">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"/>
                            </svg>
                            $${worker.rate || '15.00'}/hr
                        </div>
                        <div class="worker-info-item">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                            </svg>
                            ${hoursToday.toFixed(1)} hrs today
                        </div>
                    </div>
                    ${worker.skills ? `
                        <div class="worker-info-item" style="margin-top: 8px;">
                            <small style="color: var(--text-tertiary);">${worker.skills}</small>
                        </div>
                    ` : ''}
                    <div class="worker-actions">
                        <button class="btn-secondary" onclick="uiManager.editWorker('${worker.id}')">Edit</button>
                        <button class="btn-secondary" onclick="uiManager.addTimeForWorker('${worker.id}')">Add Time</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = workersHtml;
    }

    loadTasks() {
        const tasks = this.dataManager.getTasks();
        const container = document.getElementById('tasks-list');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" fill="currentColor" opacity="0.3" viewBox="0 0 24 24">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14l-4-4 1.41-1.41L14 14.17l6.59-6.59L22 9l-8 8z"/>
                    </svg>
                    <p>No tasks created yet</p>
                    <button class="btn-secondary" onclick="uiManager.openModal('add-task-modal')">Create First Task</button>
                </div>
            `;
            return;
        }

        const workers = this.dataManager.getWorkers();
        const tasksHtml = tasks.map(task => {
            const worker = task.workerId ? workers.find(w => w.id === task.workerId) : null;
            const priorityClass = `${task.priority}-priority`;
            
            return `
                <div class="task-card ${priorityClass}">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <span class="task-status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                    </div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-footer">
                        <div class="task-meta">
                            ${worker ? `
                                <div class="task-meta-item">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                    </svg>
                                    ${worker.name}
                                </div>
                            ` : ''}
                            ${task.dueDate ? `
                                <div class="task-meta-item">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                                    </svg>
                                    ${new Date(task.dueDate).toLocaleDateString()}
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-text" onclick="uiManager.updateTaskStatus('${task.id}')">Update</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = tasksHtml;
    }

    filterTasks(status) {
        const tasks = this.dataManager.getTasks();
        const filteredTasks = status === 'all' 
            ? tasks 
            : tasks.filter(task => task.status === status);
        
        // Re-render with filtered tasks
        const container = document.getElementById('tasks-list');
        const workers = this.dataManager.getWorkers();
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No ${status === 'all' ? '' : status} tasks found</p>
                </div>
            `;
            return;
        }

        const tasksHtml = filteredTasks.map(task => {
            const worker = task.workerId ? workers.find(w => w.id === task.workerId) : null;
            const priorityClass = `${task.priority}-priority`;
            
            return `
                <div class="task-card ${priorityClass}">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <span class="task-status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                    </div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-footer">
                        <div class="task-meta">
                            ${worker ? `
                                <div class="task-meta-item">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                    </svg>
                                    ${worker.name}
                                </div>
                            ` : ''}
                            ${task.dueDate ? `
                                <div class="task-meta-item">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                                    </svg>
                                    ${new Date(task.dueDate).toLocaleDateString()}
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-text" onclick="uiManager.updateTaskStatus('${task.id}')">Update</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = tasksHtml;
    }

    generateReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        const entries = this.dataManager.getTimeEntriesRange(startDate, endDate);
        const workers = this.dataManager.getWorkers();
        const tasks = this.dataManager.getTasks();
        
        // Calculate summary statistics
        const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
        const totalEarnings = entries.reduce((sum, entry) => 
            sum + (parseFloat(entry.hours) * parseFloat(entry.rate)), 0
        );
        const uniqueWorkers = new Set(entries.map(entry => entry.workerId)).size;
        const averageHoursPerDay = totalHours / Math.max(1, this.getDaysBetween(startDate, endDate));
        
        // Group entries by worker
        const workerStats = {};
        entries.forEach(entry => {
            if (!workerStats[entry.workerId]) {
                const worker = workers.find(w => w.id === entry.workerId);
                workerStats[entry.workerId] = {
                    name: worker ? worker.name : 'Unknown Worker',
                    hours: 0,
                    earnings: 0,
                    tasks: []
                };
            }
            workerStats[entry.workerId].hours += parseFloat(entry.hours);
            workerStats[entry.workerId].earnings += parseFloat(entry.hours) * parseFloat(entry.rate);
            if (!workerStats[entry.workerId].tasks.includes(entry.taskDescription)) {
                workerStats[entry.workerId].tasks.push(entry.taskDescription);
            }
        });

        // Generate HTML report
        const reportHtml = `
            <div class="report-summary">
                <div class="summary-item">
                    <div class="summary-label">Total Hours</div>
                    <div class="summary-value">${totalHours.toFixed(1)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Earnings</div>
                    <div class="summary-value">$${totalEarnings.toFixed(2)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Active Workers</div>
                    <div class="summary-value">${uniqueWorkers}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Avg Hours/Day</div>
                    <div class="summary-value">${averageHoursPerDay.toFixed(1)}</div>
                </div>
            </div>
            
            <h3 style="margin-top: 32px; margin-bottom: 16px;">Worker Performance</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Worker</th>
                        <th>Hours</th>
                        <th>Earnings</th>
                        <th>Tasks Completed</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(workerStats).map(stat => `
                        <tr>
                            <td><strong>${stat.name}</strong></td>
                            <td>${stat.hours.toFixed(1)}</td>
                            <td>$${stat.earnings.toFixed(2)}</td>
                            <td>${stat.tasks.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 32px; display: flex; gap: 12px;">
                <button class="btn-secondary" onclick="uiManager.exportReport()">Export Report</button>
                <button class="btn-secondary" onclick="window.print()">Print Report</button>
            </div>
        `;

        document.getElementById('report-content').innerHTML = reportHtml;
    }

    handleQuickAdd() {
        const workerId = document.getElementById('quick-worker').value;
        const date = document.getElementById('quick-date').value;
        const hours = document.getElementById('quick-hours').value;
        const taskDescription = document.getElementById('quick-task').value;
        const rate = document.getElementById('quick-rate').value;

        if (!workerId || !date || !hours || !taskDescription || !rate) {
            alert('Please fill in all fields');
            return;
        }

        const entry = {
            workerId,
            date,
            hours,
            taskDescription,
            rate
        };

        this.dataManager.addTimeEntry(entry);
        this.closeModal('quick-add-modal');
        document.getElementById('quick-add-form').reset();
        
        // Refresh dashboard if on dashboard tab
        if (this.currentTab === 'dashboard') {
            this.loadDashboard();
        }
        
        this.showNotification('Time entry added successfully!');
    }

    handleAddWorker() {
        const name = document.getElementById('worker-name').value;
        const email = document.getElementById('worker-email').value;
        const phone = document.getElementById('worker-phone').value;
        const rate = document.getElementById('worker-rate').value || '15.00';
        const skills = document.getElementById('worker-skills').value;

        if (!name) {
            alert('Please enter a worker name');
            return;
        }

        const worker = {
            name,
            email,
            phone,
            rate,
            skills
        };

        this.dataManager.addWorker(worker);
        this.closeModal('add-worker-modal');
        document.getElementById('add-worker-form').reset();
        
        // Refresh workers list if on workers tab
        if (this.currentTab === 'workers') {
            this.loadWorkers();
        }
        
        // Update worker selects
        this.populateWorkerSelects();
        
        this.showNotification('Worker added successfully!');
    }

    handleAddTask() {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const workerId = document.getElementById('task-worker').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const dueDate = document.getElementById('task-due-date').value;

        if (!title || !description) {
            alert('Please enter task title and description');
            return;
        }

        const task = {
            title,
            description,
            workerId,
            priority,
            status,
            dueDate
        };

        this.dataManager.addTask(task);
        this.closeModal('add-task-modal');
        document.getElementById('add-task-form').reset();
        
        // Refresh tasks list if on tasks tab
        if (this.currentTab === 'tasks') {
            this.loadTasks();
        }
        
        this.showNotification('Task added successfully!');
    }

    populateWorkerSelects() {
        const workers = this.dataManager.getWorkers();
        const quickWorkerSelect = document.getElementById('quick-worker');
        const taskWorkerSelect = document.getElementById('task-worker');
        
        // Clear and repopulate quick worker select
        quickWorkerSelect.innerHTML = '<option value="">Select a worker...</option>';
        workers.forEach(worker => {
            quickWorkerSelect.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
        });
        
        // Clear and repopulate task worker select
        taskWorkerSelect.innerHTML = '<option value="">Unassigned</option>';
        workers.forEach(worker => {
            taskWorkerSelect.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    editWorker(workerId) {
        // Implementation for editing worker
        alert('Edit worker functionality to be implemented');
    }

    addTimeForWorker(workerId) {
        this.openModal('quick-add-modal');
        document.getElementById('quick-worker').value = workerId;
    }

    updateTaskStatus(taskId) {
        const task = this.dataManager.getTasks().find(t => t.id === taskId);
        if (!task) return;

        const newStatus = prompt(`Update status for "${task.title}":\n\n1. pending\n2. in-progress\n3. completed\n\nEnter new status:`, task.status);
        
        if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
            this.dataManager.updateTask(taskId, { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            this.loadTasks();
            this.showNotification('Task status updated!');
        }
    }

    exportReport() {
        this.dataManager.exportData();
        this.showNotification('Report exported successfully!');
    }

    showNotification(message) {
        // Simple notification (can be enhanced with a toast library)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    }
}

// Global modal close function
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Initialize the application
let dataManager, uiManager;

document.addEventListener('DOMContentLoaded', () => {
    dataManager = new DataManager();
    uiManager = new UIManager(dataManager);
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Service Worker Registration (for offline capability)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, app will work online only
        });
    });
}
