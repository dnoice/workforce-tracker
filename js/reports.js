/**
 * WorkForce Pro - Reports & Analytics Module
 * Version: 2.0.0
 * Comprehensive reporting and analytics functionality
 */

class ReportsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentReport = 'overview';
        this.dateRange = {
            start: null,
            end: null
        };
        this.charts = {};
        this.reportData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDateRange();
        this.loadOverviewReport();
    }

    setupEventListeners() {
        // Report type selector
        document.querySelectorAll('.report-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchReport(e.target.dataset.report);
            });
        });

        // Date range picker
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        
        if (startDate) {
            startDate.addEventListener('change', (e) => {
                this.dateRange.start = e.target.value;
                this.refreshReport();
            });
        }
        
        if (endDate) {
            endDate.addEventListener('change', (e) => {
                this.dateRange.end = e.target.value;
                this.refreshReport();
            });
        }

        // Quick date ranges
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setQuickDateRange(e.target.dataset.range);
            });
        });

        // Export buttons
        document.getElementById('export-pdf')?.addEventListener('click', () => {
            this.exportReport('pdf');
        });
        
        document.getElementById('export-excel')?.addEventListener('click', () => {
            this.exportReport('excel');
        });
        
        document.getElementById('export-csv')?.addEventListener('click', () => {
            this.exportReport('csv');
        });

        // Print button
        document.getElementById('print-report')?.addEventListener('click', () => {
            this.printReport();
        });

        // Schedule report
        document.getElementById('schedule-report')?.addEventListener('click', () => {
            this.openScheduleModal();
        });
    }

    initializeDateRange() {
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        this.dateRange.start = start.toISOString().split('T')[0];
        this.dateRange.end = end.toISOString().split('T')[0];
        
        // Update UI
        const startInput = document.getElementById('report-start-date');
        const endInput = document.getElementById('report-end-date');
        
        if (startInput) startInput.value = this.dateRange.start;
        if (endInput) endInput.value = this.dateRange.end;
    }

    switchReport(reportType) {
        this.currentReport = reportType;
        
        // Update UI
        document.querySelectorAll('.report-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.report === reportType);
        });
        
        // Load report
        switch (reportType) {
            case 'overview':
                this.loadOverviewReport();
                break;
            case 'workers':
                this.loadWorkersReport();
                break;
            case 'tasks':
                this.loadTasksReport();
                break;
            case 'financial':
                this.loadFinancialReport();
                break;
            case 'productivity':
                this.loadProductivityReport();
                break;
            case 'custom':
                this.openCustomReportBuilder();
                break;
            default:
                this.loadOverviewReport();
        }
    }

    loadOverviewReport() {
        const data = this.gatherOverviewData();
        this.reportData = data;
        
        const container = document.getElementById('report-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-header">
                <h2>Overview Report</h2>
                <p class="report-period">Period: ${this.formatDateRange()}</p>
            </div>
            
            <!-- Key Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon blue">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">${data.totalHours.toFixed(1)}</div>
                        <div class="metric-label">Total Hours Worked</div>
                        <div class="metric-change ${data.hoursChange >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${data.hoursChange >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(data.hoursChange)}% vs previous period
                        </div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon green">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">$${data.totalRevenue.toFixed(2)}</div>
                        <div class="metric-label">Total Revenue</div>
                        <div class="metric-change ${data.revenueChange >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${data.revenueChange >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(data.revenueChange)}% vs previous period
                        </div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon purple">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">${data.tasksCompleted}</div>
                        <div class="metric-label">Tasks Completed</div>
                        <div class="metric-sub">${data.taskCompletionRate}% completion rate</div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon orange">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="metric-content">
                        <div class="metric-value">${data.activeWorkers}</div>
                        <div class="metric-label">Active Workers</div>
                        <div class="metric-sub">${data.avgHoursPerWorker.toFixed(1)} avg hours/worker</div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Hours Trend</h3>
                        <select class="chart-option" id="hours-chart-option">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div class="chart-body">
                        <canvas id="hours-trend-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Revenue Breakdown</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="revenue-breakdown-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Task Distribution</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="task-distribution-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Worker Performance</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="worker-performance-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Top Performers Table -->
            <div class="report-section">
                <h3>Top Performers</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Worker</th>
                            <th>Hours Worked</th>
                            <th>Tasks Completed</th>
                            <th>Revenue Generated</th>
                            <th>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topPerformers.map((performer, index) => `
                            <tr>
                                <td>
                                    <span class="rank-badge ${index < 3 ? 'top-3' : ''}">${index + 1}</span>
                                </td>
                                <td>
                                    <div class="worker-cell">
                                        <div class="worker-avatar small">${this.getInitials(performer.name)}</div>
                                        <span>${performer.name}</span>
                                    </div>
                                </td>
                                <td>${performer.hours.toFixed(1)}</td>
                                <td>${performer.tasks}</td>
                                <td>$${performer.revenue.toFixed(2)}</td>
                                <td>
                                    <div class="efficiency-bar">
                                        <div class="efficiency-fill" style="width: ${performer.efficiency}%"></div>
                                        <span>${performer.efficiency}%</span>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Recent Activity -->
            <div class="report-section">
                <h3>Recent Activity Summary</h3>
                <div class="activity-summary">
                    ${data.recentActivity.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon ${activity.type}">
                                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">${activity.title}</div>
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Initialize charts
        this.initializeOverviewCharts(data);
    }

    loadWorkersReport() {
        const data = this.gatherWorkersData();
        this.reportData = data;
        
        const container = document.getElementById('report-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-header">
                <h2>Workers Performance Report</h2>
                <p class="report-period">Period: ${this.formatDateRange()}</p>
            </div>
            
            <!-- Worker Stats Grid -->
            <div class="worker-stats-grid">
                ${data.workers.map(worker => `
                    <div class="worker-stat-card">
                        <div class="worker-header">
                            <div class="worker-info">
                                <div class="worker-avatar">${this.getInitials(worker.name)}</div>
                                <div>
                                    <h4>${worker.name}</h4>
                                    <span class="worker-role">${worker.role || 'Team Member'}</span>
                                </div>
                            </div>
                            <div class="worker-rating">
                                ${this.getStarRating(worker.rating)}
                            </div>
                        </div>
                        
                        <div class="worker-metrics">
                            <div class="metric">
                                <span class="metric-label">Total Hours</span>
                                <span class="metric-value">${worker.totalHours.toFixed(1)}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Tasks</span>
                                <span class="metric-value">${worker.tasksCompleted}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Revenue</span>
                                <span class="metric-value">$${worker.revenue.toFixed(2)}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Avg Hours/Day</span>
                                <span class="metric-value">${worker.avgHoursPerDay.toFixed(1)}</span>
                            </div>
                        </div>
                        
                        <div class="worker-chart">
                            <canvas id="worker-chart-${worker.id}"></canvas>
                        </div>
                        
                        <div class="worker-actions">
                            <button class="btn-text" onclick="reportsManager.viewWorkerDetails('${worker.id}')">
                                View Details <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Comparative Analysis -->
            <div class="report-section">
                <h3>Comparative Analysis</h3>
                <div class="comparison-chart">
                    <canvas id="workers-comparison-chart"></canvas>
                </div>
            </div>
            
            <!-- Detailed Table -->
            <div class="report-section">
                <h3>Detailed Performance Metrics</h3>
                <table class="report-table sortable">
                    <thead>
                        <tr>
                            <th>Worker</th>
                            <th>Hours Worked</th>
                            <th>Overtime Hours</th>
                            <th>Tasks Completed</th>
                            <th>Completion Rate</th>
                            <th>Revenue</th>
                            <th>Cost</th>
                            <th>Profit Margin</th>
                            <th>Efficiency Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.workers.map(worker => `
                            <tr>
                                <td>${worker.name}</td>
                                <td>${worker.totalHours.toFixed(1)}</td>
                                <td>${worker.overtimeHours.toFixed(1)}</td>
                                <td>${worker.tasksCompleted}</td>
                                <td>${worker.completionRate}%</td>
                                <td>$${worker.revenue.toFixed(2)}</td>
                                <td>$${worker.cost.toFixed(2)}</td>
                                <td>${worker.profitMargin}%</td>
                                <td>
                                    <div class="score-badge ${this.getScoreClass(worker.efficiency)}">
                                        ${worker.efficiency}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Initialize worker charts
        this.initializeWorkerCharts(data);
    }

    loadTasksReport() {
        const data = this.gatherTasksData();
        this.reportData = data;
        
        const container = document.getElementById('report-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-header">
                <h2>Tasks Analysis Report</h2>
                <p class="report-period">Period: ${this.formatDateRange()}</p>
            </div>
            
            <!-- Task Overview -->
            <div class="task-overview">
                <div class="overview-card">
                    <h4>Task Status Distribution</h4>
                    <canvas id="task-status-chart"></canvas>
                </div>
                <div class="overview-card">
                    <h4>Priority Breakdown</h4>
                    <canvas id="task-priority-chart"></canvas>
                </div>
                <div class="overview-card">
                    <h4>Completion Trend</h4>
                    <canvas id="task-completion-trend"></canvas>
                </div>
            </div>
            
            <!-- Task Statistics -->
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle text-success"></i>
                    </div>
                    <div class="stat-details">
                        <div class="stat-number">${data.completed}</div>
                        <div class="stat-text">Completed Tasks</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon">
                        <i class="fas fa-spinner text-primary"></i>
                    </div>
                    <div class="stat-details">
                        <div class="stat-number">${data.inProgress}</div>
                        <div class="stat-text">In Progress</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                    </div>
                    <div class="stat-details">
                        <div class="stat-number">${data.overdue}</div>
                        <div class="stat-text">Overdue Tasks</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon">
                        <i class="fas fa-clock text-info"></i>
                    </div>
                    <div class="stat-details">
                        <div class="stat-number">${data.avgCompletionTime}</div>
                        <div class="stat-text">Avg Completion Time</div>
                    </div>
                </div>
            </div>
            
            <!-- Task Categories Performance -->
            <div class="report-section">
                <h3>Task Categories Performance</h3>
                <div class="categories-grid">
                    ${data.categories.map(category => `
                        <div class="category-card">
                            <div class="category-header">
                                <i class="fas fa-${category.icon}"></i>
                                <h4>${category.name}</h4>
                            </div>
                            <div class="category-stats">
                                <div class="stat-row">
                                    <span>Total Tasks:</span>
                                    <strong>${category.total}</strong>
                                </div>
                                <div class="stat-row">
                                    <span>Completed:</span>
                                    <strong>${category.completed}</strong>
                                </div>
                                <div class="stat-row">
                                    <span>Avg Time:</span>
                                    <strong>${category.avgTime} hrs</strong>
                                </div>
                            </div>
                            <div class="category-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${category.completionRate}%"></div>
                                </div>
                                <span class="progress-text">${category.completionRate}% Complete</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Detailed Task List -->
            <div class="report-section">
                <h3>Task Details</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assignee</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Due Date</th>
                            <th>Completed</th>
                            <th>Time Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.tasks.map(task => `
                            <tr>
                                <td>${task.title}</td>
                                <td>${task.assignee || 'Unassigned'}</td>
                                <td>
                                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${task.status}">${task.status}</span>
                                </td>
                                <td>${this.formatDate(task.created)}</td>
                                <td>${task.dueDate ? this.formatDate(task.dueDate) : '-'}</td>
                                <td>${task.completed ? this.formatDate(task.completed) : '-'}</td>
                                <td>${task.timeTaken || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Initialize task charts
        this.initializeTaskCharts(data);
    }

    loadFinancialReport() {
        const data = this.gatherFinancialData();
        this.reportData = data;
        
        const container = document.getElementById('report-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-header">
                <h2>Financial Report</h2>
                <p class="report-period">Period: ${this.formatDateRange()}</p>
            </div>
            
            <!-- Financial Summary -->
            <div class="financial-summary">
                <div class="summary-card revenue">
                    <div class="summary-icon">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div class="summary-content">
                        <div class="summary-label">Total Revenue</div>
                        <div class="summary-value">$${data.totalRevenue.toFixed(2)}</div>
                        <div class="summary-change positive">
                            +${data.revenueGrowth}% from last period
                        </div>
                    </div>
                </div>
                
                <div class="summary-card expenses">
                    <div class="summary-icon">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="summary-content">
                        <div class="summary-label">Total Expenses</div>
                        <div class="summary-value">$${data.totalExpenses.toFixed(2)}</div>
                        <div class="summary-change negative">
                            +${data.expenseGrowth}% from last period
                        </div>
                    </div>
                </div>
                
                <div class="summary-card profit">
                    <div class="summary-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="summary-content">
                        <div class="summary-label">Net Profit</div>
                        <div class="summary-value">$${data.netProfit.toFixed(2)}</div>
                        <div class="summary-change ${data.profitGrowth >= 0 ? 'positive' : 'negative'}">
                            ${data.profitGrowth >= 0 ? '+' : ''}${data.profitGrowth}% from last period
                        </div>
                    </div>
                </div>
                
                <div class="summary-card margin">
                    <div class="summary-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="summary-content">
                        <div class="summary-label">Profit Margin</div>
                        <div class="summary-value">${data.profitMargin}%</div>
                        <div class="summary-sub">Industry Avg: ${data.industryAvgMargin}%</div>
                    </div>
                </div>
            </div>
            
            <!-- Financial Charts -->
            <div class="financial-charts">
                <div class="chart-card full-width">
                    <h3>Revenue vs Expenses Trend</h3>
                    <canvas id="revenue-expense-trend"></canvas>
                </div>
                
                <div class="chart-card half-width">
                    <h3>Revenue by Source</h3>
                    <canvas id="revenue-sources"></canvas>
                </div>
                
                <div class="chart-card half-width">
                    <h3>Expense Categories</h3>
                    <canvas id="expense-categories"></canvas>
                </div>
            </div>
            
            <!-- Cash Flow -->
            <div class="report-section">
                <h3>Cash Flow Statement</h3>
                <table class="report-table financial-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Inflow</th>
                            <th>Outflow</th>
                            <th>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.cashFlow.map(item => `
                            <tr>
                                <td>${item.category}</td>
                                <td class="positive">$${item.inflow.toFixed(2)}</td>
                                <td class="negative">$${item.outflow.toFixed(2)}</td>
                                <td class="${item.net >= 0 ? 'positive' : 'negative'}">
                                    $${item.net.toFixed(2)}
                                </td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td><strong>Total</strong></td>
                            <td class="positive"><strong>$${data.totalInflow.toFixed(2)}</strong></td>
                            <td class="negative"><strong>$${data.totalOutflow.toFixed(2)}</strong></td>
                            <td class="${data.netCashFlow >= 0 ? 'positive' : 'negative'}">
                                <strong>$${data.netCashFlow.toFixed(2)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Invoice Summary -->
            <div class="report-section">
                <h3>Invoice Summary</h3>
                <div class="invoice-stats">
                    <div class="invoice-stat">
                        <span class="stat-label">Total Invoices</span>
                        <span class="stat-value">${data.totalInvoices}</span>
                    </div>
                    <div class="invoice-stat">
                        <span class="stat-label">Paid</span>
                        <span class="stat-value text-success">${data.paidInvoices}</span>
                    </div>
                    <div class="invoice-stat">
                        <span class="stat-label">Pending</span>
                        <span class="stat-value text-warning">${data.pendingInvoices}</span>
                    </div>
                    <div class="invoice-stat">
                        <span class="stat-label">Overdue</span>
                        <span class="stat-value text-danger">${data.overdueInvoices}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize financial charts
        this.initializeFinancialCharts(data);
    }

    loadProductivityReport() {
        const data = this.gatherProductivityData();
        this.reportData = data;
        
        const container = document.getElementById('report-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-header">
                <h2>Productivity Analysis</h2>
                <p class="report-period">Period: ${this.formatDateRange()}</p>
            </div>
            
            <!-- Productivity Score -->
            <div class="productivity-score-section">
                <div class="score-display">
                    <div class="score-circle">
                        <svg viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" stroke="#e5e7eb" stroke-width="20" fill="none"/>
                            <circle cx="100" cy="100" r="90" stroke="url(#scoreGradient)" stroke-width="20" fill="none"
                                    stroke-dasharray="${data.overallScore * 5.65} 565" transform="rotate(-90 100 100)"/>
                            <text x="100" y="100" text-anchor="middle" dy="10" font-size="48" font-weight="bold">
                                ${data.overallScore}%
                            </text>
                            <defs>
                                <linearGradient id="scoreGradient">
                                    <stop offset="0%" stop-color="#10b981"/>
                                    <stop offset="100%" stop-color="#6366f1"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div class="score-details">
                        <h3>Overall Productivity Score</h3>
                        <p>Based on efficiency, task completion, and time utilization</p>
                        <div class="score-breakdown">
                            <div class="score-item">
                                <span>Efficiency:</span>
                                <strong>${data.efficiency}%</strong>
                            </div>
                            <div class="score-item">
                                <span>Utilization:</span>
                                <strong>${data.utilization}%</strong>
                            </div>
                            <div class="score-item">
                                <span>Quality:</span>
                                <strong>${data.quality}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Productivity Metrics -->
            <div class="productivity-metrics">
                <div class="metric-card">
                    <h4>Time Utilization</h4>
                    <canvas id="time-utilization-chart"></canvas>
                </div>
                <div class="metric-card">
                    <h4>Task Efficiency</h4>
                    <canvas id="task-efficiency-chart"></canvas>
                </div>
                <div class="metric-card">
                    <h4>Peak Hours</h4>
                    <canvas id="peak-hours-chart"></canvas>
                </div>
            </div>
            
            <!-- Productivity Trends -->
            <div class="report-section">
                <h3>Productivity Trends</h3>
                <canvas id="productivity-trend-chart"></canvas>
            </div>
            
            <!-- Department Comparison -->
            <div class="report-section">
                <h3>Department Productivity Comparison</h3>
                <div class="department-comparison">
                    ${data.departments.map(dept => `
                        <div class="department-card">
                            <div class="dept-header">
                                <h4>${dept.name}</h4>
                                <span class="dept-score ${this.getScoreClass(dept.score)}">${dept.score}%</span>
                            </div>
                            <div class="dept-metrics">
                                <div class="metric-row">
                                    <span>Workers:</span>
                                    <strong>${dept.workers}</strong>
                                </div>
                                <div class="metric-row">
                                    <span>Hours:</span>
                                    <strong>${dept.hours.toFixed(1)}</strong>
                                </div>
                                <div class="metric-row">
                                    <span>Tasks:</span>
                                    <strong>${dept.tasks}</strong>
                                </div>
                                <div class="metric-row">
                                    <span>Efficiency:</span>
                                    <strong>${dept.efficiency}%</strong>
                                </div>
                            </div>
                            <div class="dept-chart">
                                <canvas id="dept-chart-${dept.id}"></canvas>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Recommendations -->
            <div class="report-section">
                <h3>Productivity Recommendations</h3>
                <div class="recommendations">
                    ${data.recommendations.map(rec => `
                        <div class="recommendation ${rec.priority}">
                            <div class="rec-icon">
                                <i class="fas fa-${rec.icon}"></i>
                            </div>
                            <div class="rec-content">
                                <h4>${rec.title}</h4>
                                <p>${rec.description}</p>
                                <div class="rec-impact">
                                    Potential Impact: <strong>${rec.impact}</strong>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Initialize productivity charts
        this.initializeProductivityCharts(data);
    }

    // Data gathering methods
    gatherOverviewData() {
        const timeEntries = this.dataManager.getTimeEntriesRange(this.dateRange.start, this.dateRange.end);
        const tasks = this.dataManager.getTasksRange(this.dateRange.start, this.dateRange.end);
        const workers = this.dataManager.getWorkers();
        
        // Calculate metrics
        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const totalRevenue = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);
        const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
        const activeWorkers = new Set(timeEntries.map(e => e.workerId)).size;
        
        // Calculate changes (mock data for now)
        const hoursChange = 12.5;
        const revenueChange = 8.3;
        
        // Top performers
        const workerPerformance = {};
        timeEntries.forEach(entry => {
            if (!workerPerformance[entry.workerId]) {
                workerPerformance[entry.workerId] = {
                    hours: 0,
                    tasks: 0,
                    revenue: 0
                };
            }
            workerPerformance[entry.workerId].hours += entry.hours;
            workerPerformance[entry.workerId].revenue += entry.hours * entry.rate;
        });
        
        tasks.filter(t => t.status === 'completed').forEach(task => {
            if (task.assigneeId && workerPerformance[task.assigneeId]) {
                workerPerformance[task.assigneeId].tasks++;
            }
        });
        
        const topPerformers = Object.entries(workerPerformance)
            .map(([workerId, stats]) => {
                const worker = workers.find(w => w.id === workerId);
                return {
                    id: workerId,
                    name: worker?.name || 'Unknown',
                    ...stats,
                    efficiency: Math.min(100, Math.round((stats.tasks / Math.max(1, stats.hours)) * 10))
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        return {
            totalHours,
            totalRevenue,
            tasksCompleted,
            activeWorkers,
            hoursChange,
            revenueChange,
            taskCompletionRate: tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0,
            avgHoursPerWorker: activeWorkers > 0 ? totalHours / activeWorkers : 0,
            topPerformers,
            recentActivity: this.dataManager.getRecentActivity().slice(0, 5),
            chartData: this.prepareOverviewChartData(timeEntries, tasks)
        };
    }

    gatherWorkersData() {
        const workers = this.dataManager.getWorkers();
        const timeEntries = this.dataManager.getTimeEntriesRange(this.dateRange.start, this.dateRange.end);
        const tasks = this.dataManager.getTasksRange(this.dateRange.start, this.dateRange.end);
        
        const workerData = workers.map(worker => {
            const workerEntries = timeEntries.filter(e => e.workerId === worker.id);
            const workerTasks = tasks.filter(t => t.assigneeId === worker.id);
            
            const totalHours = workerEntries.reduce((sum, e) => sum + e.hours, 0);
            const overtimeHours = workerEntries
                .filter(e => e.overtime)
                .reduce((sum, e) => sum + e.hours, 0);
            
            const tasksCompleted = workerTasks.filter(t => t.status === 'completed').length;
            const revenue = workerEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);
            const cost = workerEntries.reduce((sum, e) => sum + (e.hours * worker.rate), 0);
            
            return {
                ...worker,
                totalHours,
                overtimeHours,
                tasksCompleted,
                tasksTotal: workerTasks.length,
                completionRate: workerTasks.length > 0 
                    ? Math.round((tasksCompleted / workerTasks.length) * 100) 
                    : 0,
                revenue,
                cost,
                profitMargin: revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0,
                avgHoursPerDay: this.calculateAvgHoursPerDay(workerEntries),
                efficiency: this.calculateEfficiency(totalHours, tasksCompleted),
                rating: worker.rating || 4.5
            };
        });
        
        return {
            workers: workerData
        };
    }

    gatherTasksData() {
        const tasks = this.dataManager.getTasksRange(this.dateRange.start, this.dateRange.end);
        
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
        
        // Group by categories
        const categories = this.groupTasksByCategory(tasks);
        
        return {
            tasks: tasks.slice(0, 50), // Limit to 50 for display
            total: tasks.length,
            completed,
            inProgress,
            overdue,
            avgCompletionTime: this.calculateAvgCompletionTime(tasks),
            categories
        };
    }

    gatherFinancialData() {
        const timeEntries = this.dataManager.getTimeEntriesRange(this.dateRange.start, this.dateRange.end);
        const expenses = this.dataManager.getExpensesRange(this.dateRange.start, this.dateRange.end) || [];
        const invoices = this.dataManager.getInvoicesRange(this.dateRange.start, this.dateRange.end) || [];
        
        const totalRevenue = timeEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        
        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
            revenueGrowth: 15.2, // Mock data
            expenseGrowth: 8.7, // Mock data
            profitGrowth: 23.5, // Mock data
            industryAvgMargin: 25, // Mock data
            cashFlow: this.calculateCashFlow(timeEntries, expenses),
            totalInflow: totalRevenue,
            totalOutflow: totalExpenses,
            netCashFlow: totalRevenue - totalExpenses,
            totalInvoices: invoices.length,
            paidInvoices: invoices.filter(i => i.status === 'paid').length,
            pendingInvoices: invoices.filter(i => i.status === 'pending').length,
            overdueInvoices: invoices.filter(i => i.status === 'overdue').length
        };
    }

    gatherProductivityData() {
        const timeEntries = this.dataManager.getTimeEntriesRange(this.dateRange.start, this.dateRange.end);
        const tasks = this.dataManager.getTasksRange(this.dateRange.start, this.dateRange.end);
        const workers = this.dataManager.getWorkers();
        
        // Calculate productivity metrics
        const efficiency = this.calculateOverallEfficiency(timeEntries, tasks);
        const utilization = this.calculateUtilization(timeEntries, workers);
        const quality = this.calculateQualityScore(tasks);
        
        const overallScore = Math.round((efficiency + utilization + quality) / 3);
        
        // Department data
        const departments = this.calculateDepartmentProductivity(workers, timeEntries, tasks);
        
        // Recommendations
        const recommendations = this.generateProductivityRecommendations(efficiency, utilization, quality);
        
        return {
            overallScore,
            efficiency,
            utilization,
            quality,
            departments,
            recommendations
        };
    }

    // Chart initialization methods
    initializeOverviewCharts(data) {
        // Hours Trend Chart
        const hoursTrendCtx = document.getElementById('hours-trend-chart');
        if (hoursTrendCtx) {
            this.charts.hoursTrend = new Chart(hoursTrendCtx, {
                type: 'line',
                data: {
                    labels: data.chartData.dates,
                    datasets: [{
                        label: 'Hours Worked',
                        data: data.chartData.hours,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: this.getLineChartOptions()
            });
        }

        // Revenue Breakdown Chart
        const revenueBreakdownCtx = document.getElementById('revenue-breakdown-chart');
        if (revenueBreakdownCtx) {
            this.charts.revenueBreakdown = new Chart(revenueBreakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: data.chartData.revenueCategories,
                    datasets: [{
                        data: data.chartData.revenueValues,
                        backgroundColor: [
                            '#6366f1',
                            '#8b5cf6',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }

        // Task Distribution Chart
        const taskDistributionCtx = document.getElementById('task-distribution-chart');
        if (taskDistributionCtx) {
            this.charts.taskDistribution = new Chart(taskDistributionCtx, {
                type: 'bar',
                data: {
                    labels: ['To Do', 'In Progress', 'Review', 'Completed'],
                    datasets: [{
                        label: 'Tasks',
                        data: data.chartData.taskDistribution,
                        backgroundColor: [
                            'rgba(156, 163, 175, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(16, 185, 129, 0.8)'
                        ]
                    }]
                },
                options: this.getBarChartOptions()
            });
        }

        // Worker Performance Chart
        const workerPerformanceCtx = document.getElementById('worker-performance-chart');
        if (workerPerformanceCtx) {
            this.charts.workerPerformance = new Chart(workerPerformanceCtx, {
                type: 'radar',
                data: {
                    labels: data.topPerformers.map(p => p.name),
                    datasets: [{
                        label: 'Efficiency',
                        data: data.topPerformers.map(p => p.efficiency),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)'
                    }]
                },
                options: this.getRadarChartOptions()
            });
        }
    }

    // Helper methods
    formatDateRange() {
        const start = new Date(this.dateRange.start).toLocaleDateString();
        const end = new Date(this.dateRange.end).toLocaleDateString();
        return `${start} - ${end}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatRelativeTime(timestamp) {
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

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    getStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        
        return stars;
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
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

    // Chart options
    getLineChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    getBarChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    getDoughnutChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    }

    getRadarChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        };
    }

    // Export methods
    exportReport(format) {
        if (!this.reportData) {
            app.showError('No report data to export');
            return;
        }

        const filename = `report_${this.currentReport}_${Date.now()}`;
        
        switch (format) {
            case 'pdf':
                this.exportPDF(filename);
                break;
            case 'excel':
                this.exportExcel(filename);
                break;
            case 'csv':
                this.exportCSV(filename);
                break;
            default:
                app.showError('Unsupported export format');
        }
    }

    exportPDF(filename) {
        // TODO: Implement PDF export using jsPDF or similar
        app.showNotification({
            type: 'info',
            title: 'PDF Export',
            message: 'PDF export feature coming soon'
        });
    }

    exportExcel(filename) {
        // TODO: Implement Excel export using SheetJS or similar
        app.showNotification({
            type: 'info',
            title: 'Excel Export',
            message: 'Excel export feature coming soon'
        });
    }

    exportCSV(filename) {
        // Convert report data to CSV
        let csv = this.convertToCSV(this.reportData);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        app.showSuccess('Report exported as CSV');
    }

    convertToCSV(data) {
        // Simple CSV conversion (can be enhanced)
        const lines = [];
        
        // Add headers based on report type
        if (this.currentReport === 'overview') {
            lines.push('Metric,Value');
            lines.push(`Total Hours,${data.totalHours}`);
            lines.push(`Total Revenue,${data.totalRevenue}`);
            lines.push(`Tasks Completed,${data.tasksCompleted}`);
            lines.push(`Active Workers,${data.activeWorkers}`);
        }
        
        return lines.join('\n');
    }

    printReport() {
        window.print();
    }

    setQuickDateRange(range) {
        const end = new Date();
        const start = new Date();
        
        switch (range) {
            case 'today':
                // Both start and end are today
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
        }
        
        this.dateRange.start = start.toISOString().split('T')[0];
        this.dateRange.end = end.toISOString().split('T')[0];
        
        // Update UI
        document.getElementById('report-start-date').value = this.dateRange.start;
        document.getElementById('report-end-date').value = this.dateRange.end;
        
        this.refreshReport();
    }

    refreshReport() {
        this.switchReport(this.currentReport);
    }

    // Calculation helper methods
    calculateAvgHoursPerDay(entries) {
        if (entries.length === 0) return 0;
        
        const days = new Set(entries.map(e => new Date(e.date).toDateString())).size;
        const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
        
        return days > 0 ? totalHours / days : 0;
    }

    calculateEfficiency(hours, tasks) {
        if (hours === 0) return 0;
        return Math.min(100, Math.round((tasks / hours) * 10));
    }

    calculateAvgCompletionTime(tasks) {
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
        if (completedTasks.length === 0) return '0 days';
        
        const totalDays = completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.completedAt);
            const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        
        const avgDays = Math.round(totalDays / completedTasks.length);
        return `${avgDays} day${avgDays !== 1 ? 's' : ''}`;
    }

    groupTasksByCategory(tasks) {
        // Mock categories for now
        return [
            {
                id: 'maintenance',
                name: 'Maintenance',
                icon: 'wrench',
                total: tasks.filter(t => t.category === 'maintenance').length,
                completed: tasks.filter(t => t.category === 'maintenance' && t.status === 'completed').length,
                avgTime: 2.5,
                completionRate: 75
            },
            {
                id: 'delivery',
                name: 'Delivery',
                icon: 'truck',
                total: tasks.filter(t => t.category === 'delivery').length,
                completed: tasks.filter(t => t.category === 'delivery' && t.status === 'completed').length,
                avgTime: 1.5,
                completionRate: 85
            },
            {
                id: 'general',
                name: 'General',
                icon: 'tasks',
                total: tasks.filter(t => !t.category || t.category === 'general').length,
                completed: tasks.filter(t => (!t.category || t.category === 'general') && t.status === 'completed').length,
                avgTime: 3.0,
                completionRate: 65
            }
        ];
    }

    calculateCashFlow(timeEntries, expenses) {
        // Mock cash flow data
        return [
            {
                category: 'Service Revenue',
                inflow: timeEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0),
                outflow: 0,
                net: timeEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0)
            },
            {
                category: 'Labor Costs',
                inflow: 0,
                outflow: timeEntries.reduce((sum, e) => sum + (e.hours * 15), 0), // Mock labor cost
                net: -timeEntries.reduce((sum, e) => sum + (e.hours * 15), 0)
            },
            {
                category: 'Operating Expenses',
                inflow: 0,
                outflow: expenses.reduce((sum, e) => sum + e.amount, 0),
                net: -expenses.reduce((sum, e) => sum + e.amount, 0)
            }
        ];
    }

    calculateOverallEfficiency(timeEntries, tasks) {
        const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        
        if (totalHours === 0) return 0;
        return Math.min(100, Math.round((completedTasks / totalHours) * 10));
    }

    calculateUtilization(timeEntries, workers) {
        const totalPossibleHours = workers.length * 8 * 22; // 8 hours/day, 22 working days
        const actualHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
        
        if (totalPossibleHours === 0) return 0;
        return Math.min(100, Math.round((actualHours / totalPossibleHours) * 100));
    }

    calculateQualityScore(tasks) {
        // Mock quality score based on task completion within deadline
        const completedOnTime = tasks.filter(t => 
            t.status === 'completed' && 
            (!t.dueDate || new Date(t.completedAt) <= new Date(t.dueDate))
        ).length;
        
        const totalCompleted = tasks.filter(t => t.status === 'completed').length;
        
        if (totalCompleted === 0) return 100;
        return Math.round((completedOnTime / totalCompleted) * 100);
    }

    calculateDepartmentProductivity(workers, timeEntries, tasks) {
        // Mock department data
        return [
            {
                id: 'delivery',
                name: 'Delivery',
                workers: workers.filter(w => w.department === 'delivery').length,
                hours: timeEntries.filter(e => {
                    const worker = workers.find(w => w.id === e.workerId);
                    return worker?.department === 'delivery';
                }).reduce((sum, e) => sum + e.hours, 0),
                tasks: tasks.filter(t => t.category === 'delivery').length,
                efficiency: 85,
                score: 82
            },
            {
                id: 'maintenance',
                name: 'Maintenance',
                workers: workers.filter(w => w.department === 'maintenance').length,
                hours: timeEntries.filter(e => {
                    const worker = workers.find(w => w.id === e.workerId);
                    return worker?.department === 'maintenance';
                }).reduce((sum, e) => sum + e.hours, 0),
                tasks: tasks.filter(t => t.category === 'maintenance').length,
                efficiency: 78,
                score: 75
            }
        ];
    }

    generateProductivityRecommendations(efficiency, utilization, quality) {
        const recommendations = [];
        
        if (efficiency < 70) {
            recommendations.push({
                priority: 'high',
                icon: 'exclamation-triangle',
                title: 'Improve Task Efficiency',
                description: 'Consider implementing task batching and time-blocking techniques to improve efficiency.',
                impact: '+15-20% productivity'
            });
        }
        
        if (utilization < 60) {
            recommendations.push({
                priority: 'medium',
                icon: 'clock',
                title: 'Increase Time Utilization',
                description: 'Review work schedules and consider redistributing tasks to maximize working hours.',
                impact: '+10-15% utilization'
            });
        }
        
        if (quality < 80) {
            recommendations.push({
                priority: 'high',
                icon: 'check-circle',
                title: 'Enhance Quality Control',
                description: 'Implement quality checkpoints and review processes to reduce rework.',
                impact: '+20% quality score'
            });
        }
        
        return recommendations;
    }

    prepareOverviewChartData(timeEntries, tasks) {
        // Prepare data for charts
        const dates = this.getDateRange();
        const hours = dates.map(date => {
            const dayEntries = timeEntries.filter(e => 
                new Date(e.date).toDateString() === new Date(date).toDateString()
            );
            return dayEntries.reduce((sum, e) => sum + e.hours, 0);
        });
        
        return {
            dates: dates.map(d => new Date(d).toLocaleDateString()),
            hours,
            revenueCategories: ['Service A', 'Service B', 'Service C', 'Other'],
            revenueValues: [4500, 3200, 2800, 1500],
            taskDistribution: [
                tasks.filter(t => t.status === 'todo').length,
                tasks.filter(t => t.status === 'in-progress').length,
                tasks.filter(t => t.status === 'review').length,
                tasks.filter(t => t.status === 'completed').length
            ]
        };
    }

    getDateRange() {
        const dates = [];
        const start = new Date(this.dateRange.start);
        const end = new Date(this.dateRange.end);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        
        return dates;
    }

    initializeWorkerCharts(data) {
        // Initialize individual worker charts
        data.workers.forEach(worker => {
            const ctx = document.getElementById(`worker-chart-${worker.id}`);
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                        datasets: [{
                            label: 'Hours',
                            data: [35, 40, 38, 42], // Mock data
                            borderColor: '#6366f1',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        });

        // Workers comparison chart
        const comparisonCtx = document.getElementById('workers-comparison-chart');
        if (comparisonCtx) {
            new Chart(comparisonCtx, {
                type: 'bar',
                data: {
                    labels: data.workers.map(w => w.name),
                    datasets: [
                        {
                            label: 'Hours',
                            data: data.workers.map(w => w.totalHours),
                            backgroundColor: 'rgba(99, 102, 241, 0.8)'
                        },
                        {
                            label: 'Tasks',
                            data: data.workers.map(w => w.tasksCompleted),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)'
                        }
                    ]
                },
                options: this.getBarChartOptions()
            });
        }
    }

    initializeTaskCharts(data) {
        // Task status chart
        const statusCtx = document.getElementById('task-status-chart');
        if (statusCtx) {
            new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: ['To Do', 'In Progress', 'Review', 'Completed'],
                    datasets: [{
                        data: [
                            data.tasks.filter(t => t.status === 'todo').length,
                            data.tasks.filter(t => t.status === 'in-progress').length,
                            data.tasks.filter(t => t.status === 'review').length,
                            data.completed
                        ],
                        backgroundColor: [
                            '#9ca3af',
                            '#3b82f6',
                            '#f59e0b',
                            '#10b981'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }

        // Priority chart
        const priorityCtx = document.getElementById('task-priority-chart');
        if (priorityCtx) {
            new Chart(priorityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Urgent'],
                    datasets: [{
                        data: [
                            data.tasks.filter(t => t.priority === 'low').length,
                            data.tasks.filter(t => t.priority === 'medium').length,
                            data.tasks.filter(t => t.priority === 'high').length,
                            data.tasks.filter(t => t.priority === 'urgent').length
                        ],
                        backgroundColor: [
                            '#3b82f6',
                            '#f59e0b',
                            '#ef4444',
                            '#dc2626'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }

        // Completion trend
        const trendCtx = document.getElementById('task-completion-trend');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: this.getDateRange().map(d => new Date(d).toLocaleDateString()),
                    datasets: [{
                        label: 'Tasks Completed',
                        data: this.getDateRange().map(() => Math.floor(Math.random() * 10) + 1), // Mock data
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: this.getLineChartOptions()
            });
        }
    }

    initializeFinancialCharts(data) {
        // Revenue vs Expenses trend
        const trendCtx = document.getElementById('revenue-expense-trend');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: this.getDateRange().map(d => new Date(d).toLocaleDateString()),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: this.getDateRange().map(() => Math.floor(Math.random() * 1000) + 500),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Expenses',
                            data: this.getDateRange().map(() => Math.floor(Math.random() * 800) + 200),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: this.getLineChartOptions()
            });
        }

        // Revenue sources
        const sourcesCtx = document.getElementById('revenue-sources');
        if (sourcesCtx) {
            new Chart(sourcesCtx, {
                type: 'pie',
                data: {
                    labels: ['Services', 'Products', 'Consulting', 'Other'],
                    datasets: [{
                        data: [5000, 3000, 2000, 1000],
                        backgroundColor: [
                            '#6366f1',
                            '#8b5cf6',
                            '#10b981',
                            '#f59e0b'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }

        // Expense categories
        const expensesCtx = document.getElementById('expense-categories');
        if (expensesCtx) {
            new Chart(expensesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Labor', 'Materials', 'Overhead', 'Other'],
                    datasets: [{
                        data: [4000, 2000, 1500, 500],
                        backgroundColor: [
                            '#ef4444',
                            '#f59e0b',
                            '#3b82f6',
                            '#9ca3af'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }
    }

    initializeProductivityCharts(data) {
        // Time utilization
        const utilizationCtx = document.getElementById('time-utilization-chart');
        if (utilizationCtx) {
            new Chart(utilizationCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Productive', 'Breaks', 'Idle'],
                    datasets: [{
                        data: [70, 15, 15],
                        backgroundColor: [
                            '#10b981',
                            '#f59e0b',
                            '#ef4444'
                        ]
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }

        // Task efficiency
        const efficiencyCtx = document.getElementById('task-efficiency-chart');
        if (efficiencyCtx) {
            new Chart(efficiencyCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    datasets: [{
                        label: 'Efficiency %',
                        data: [85, 78, 92, 88, 75],
                        backgroundColor: 'rgba(99, 102, 241, 0.8)'
                    }]
                },
                options: this.getBarChartOptions()
            });
        }

        // Peak hours
        const peakHoursCtx = document.getElementById('peak-hours-chart');
        if (peakHoursCtx) {
            new Chart(peakHoursCtx, {
                type: 'line',
                data: {
                    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                    datasets: [{
                        label: 'Productivity',
                        data: [20, 85, 70, 90, 60, 30],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: this.getLineChartOptions()
            });
        }

        // Productivity trend
        const trendCtx = document.getElementById('productivity-trend-chart');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: this.getDateRange().map(d => new Date(d).toLocaleDateString()),
                    datasets: [{
                        label: 'Productivity Score',
                        data: this.getDateRange().map(() => Math.floor(Math.random() * 20) + 70),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: this.getLineChartOptions()
            });
        }

        // Department charts
        data.departments.forEach(dept => {
            const ctx = document.getElementById(`dept-chart-${dept.id}`);
            if (ctx) {
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['Efficiency', 'Quality', 'Speed', 'Collaboration', 'Innovation'],
                        datasets: [{
                            label: dept.name,
                            data: [dept.efficiency, 85, 75, 80, 70], // Mock data
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)'
                        }]
                    },
                    options: this.getRadarChartOptions()
                });
            }
        });
    }

    openScheduleModal() {
        // TODO: Implement report scheduling
        app.showNotification({
            type: 'info',
            title: 'Schedule Reports',
            message: 'Report scheduling feature coming soon'
        });
    }

    openCustomReportBuilder() {
        // TODO: Implement custom report builder
        app.showNotification({
            type: 'info',
            title: 'Custom Report Builder',
            message: 'Custom report builder coming soon'
        });
    }

    viewWorkerDetails(workerId) {
        // TODO: Implement detailed worker report
        app.showNotification({
            type: 'info',
            title: 'Worker Details',
            message: 'Detailed worker report coming soon'
        });
    }
}

// Initialize Reports Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.modules.dataManager) {
        window.reportsManager = new ReportsManager(window.app.modules.dataManager);
    }
});
