/**
 * WorkForce Pro - Modals & Dialogs Module
 * Version: 2.0.0
 * Advanced modal management system
 */

class ModalsManager {
    constructor() {
        this.activeModals = new Map();
        this.modalStack = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createModalContainer();
    }

    setupEventListeners() {
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                const topModal = this.modalStack[this.modalStack.length - 1];
                if (topModal.closable) {
                    this.close(topModal.id);
                }
            }
        });
    }

    createModalContainer() {
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }
    }

    // ========== Worker Profile Modal ==========
    showWorkerProfile(workerId) {
        const worker = app.modules.dataManager.getWorkerById(workerId);
        if (!worker) {
            app.showError('Worker not found');
            return;
        }

        const timeEntries = app.modules.dataManager.getTimeEntriesForWorker(workerId);
        const tasks = app.modules.dataManager.getTasksForWorker(workerId);
        const stats = this.calculateWorkerStats(worker, timeEntries, tasks);

        const modalContent = `
            <div class="worker-profile-modal">
                <div class="profile-header">
                    <div class="profile-cover" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="profile-actions">
                            <button class="btn-icon white" onclick="modalsManager.editWorker('${workerId}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon white" onclick="modalsManager.exportWorkerProfile('${workerId}')">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="profile-info">
                        <div class="profile-avatar-large">
                            ${this.getWorkerAvatar(worker, 'large')}
                        </div>
                        <div class="profile-details">
                            <h2>${worker.name}</h2>
                            <p class="profile-role">${worker.role || 'Team Member'}</p>
                            <div class="profile-badges">
                                <span class="badge ${worker.status}">${worker.status}</span>
                                ${worker.department ? `<span class="badge department">${worker.department}</span>` : ''}
                                ${stats.topPerformer ? '<span class="badge gold"><i class="fas fa-trophy"></i> Top Performer</span>' : ''}
                            </div>
                        </div>
                        <div class="profile-stats-summary">
                            <div class="stat">
                                <span class="stat-value">${stats.totalHours.toFixed(1)}</span>
                                <span class="stat-label">Total Hours</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${stats.tasksCompleted}</span>
                                <span class="stat-label">Tasks Done</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${stats.rating} ⭐</span>
                                <span class="stat-label">Rating</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">$${stats.totalEarnings.toFixed(0)}</span>
                                <span class="stat-label">Earnings</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-tabs">
                    <button class="tab-btn active" onclick="modalsManager.switchProfileTab('overview', '${workerId}')">
                        <i class="fas fa-chart-line"></i> Overview
                    </button>
                    <button class="tab-btn" onclick="modalsManager.switchProfileTab('schedule', '${workerId}')">
                        <i class="fas fa-calendar"></i> Schedule
                    </button>
                    <button class="tab-btn" onclick="modalsManager.switchProfileTab('tasks', '${workerId}')">
                        <i class="fas fa-tasks"></i> Tasks
                    </button>
                    <button class="tab-btn" onclick="modalsManager.switchProfileTab('performance', '${workerId}')">
                        <i class="fas fa-chart-bar"></i> Performance
                    </button>
                    <button class="tab-btn" onclick="modalsManager.switchProfileTab('documents', '${workerId}')">
                        <i class="fas fa-folder"></i> Documents
                    </button>
                </div>

                <div class="profile-content">
                    <div class="tab-panel active" id="overview-panel">
                        <div class="panel-grid">
                            <div class="panel-section">
                                <h3><i class="fas fa-user-circle"></i> Personal Information</h3>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Employee ID:</span>
                                        <span class="info-value">${worker.employeeId || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">${worker.email || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Phone:</span>
                                        <span class="info-value">${worker.phone || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Address:</span>
                                        <span class="info-value">${worker.address || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Start Date:</span>
                                        <span class="info-value">${worker.startDate ? DateUtils.format(worker.startDate, 'medium') : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h3><i class="fas fa-briefcase"></i> Employment Details</h3>
                                <div class="info-list">
                                    <div class="info-item">
                                        <span class="info-label">Department:</span>
                                        <span class="info-value">${worker.department || 'General'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Schedule:</span>
                                        <span class="info-value">${worker.schedule || 'Full Time'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Hourly Rate:</span>
                                        <span class="info-value">$${worker.rate || '15.00'}/hr</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Overtime Rate:</span>
                                        <span class="info-value">$${worker.overtimeRate || '22.50'}/hr</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Payment Method:</span>
                                        <span class="info-value">${worker.paymentMethod || 'Direct Deposit'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="panel-section">
                                <h3><i class="fas fa-tools"></i> Skills & Expertise</h3>
                                <div class="skills-cloud">
                                    ${worker.skills ? worker.skills.split(',').map(skill => 
                                        `<span class="skill-bubble">${skill.trim()}</span>`
                                    ).join('') : '<p class="text-muted">No skills listed</p>'}
                                </div>
                            </div>

                            <div class="panel-section">
                                <h3><i class="fas fa-chart-line"></i> Recent Activity</h3>
                                <canvas id="worker-activity-chart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="tab-panel" id="schedule-panel">
                        <div class="schedule-calendar" id="worker-schedule">
                            <!-- Calendar will be rendered here -->
                        </div>
                    </div>

                    <div class="tab-panel" id="tasks-panel">
                        <div class="tasks-list">
                            ${tasks.map(task => `
                                <div class="task-item ${task.priority}-priority">
                                    <div class="task-status ${task.status}">
                                        ${task.status === 'completed' ? '<i class="fas fa-check"></i>' : 
                                          task.status === 'in-progress' ? '<i class="fas fa-spinner"></i>' :
                                          '<i class="fas fa-clock"></i>'}
                                    </div>
                                    <div class="task-details">
                                        <h4>${task.title}</h4>
                                        <p>${task.description}</p>
                                        <div class="task-meta">
                                            ${task.dueDate ? `<span><i class="fas fa-calendar"></i> ${DateUtils.format(task.dueDate)}</span>` : ''}
                                            <span><i class="fas fa-flag"></i> ${task.priority}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            ${tasks.length === 0 ? '<p class="text-muted text-center">No tasks assigned</p>' : ''}
                        </div>
                    </div>

                    <div class="tab-panel" id="performance-panel">
                        <div class="performance-metrics">
                            <div class="metric-card">
                                <h4>Productivity Score</h4>
                                <div class="circular-progress" data-progress="${stats.productivityScore}">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" stroke="#e5e7eb" stroke-width="10" fill="none"/>
                                        <circle cx="50" cy="50" r="45" stroke="#6366f1" stroke-width="10" fill="none"
                                                stroke-dasharray="${stats.productivityScore * 2.83} 283"
                                                transform="rotate(-90 50 50)"/>
                                        <text x="50" y="50" text-anchor="middle" dy="7" font-size="24" font-weight="bold">
                                            ${stats.productivityScore}%
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <div class="metric-card">
                                <h4>Attendance Rate</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${stats.attendanceRate}%"></div>
                                </div>
                                <span>${stats.attendanceRate}%</span>
                            </div>
                            <div class="metric-card">
                                <h4>Task Completion Rate</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill green" style="width: ${stats.completionRate}%"></div>
                                </div>
                                <span>${stats.completionRate}%</span>
                            </div>
                        </div>
                        <div class="performance-chart">
                            <canvas id="performance-trend-chart"></canvas>
                        </div>
                    </div>

                    <div class="tab-panel" id="documents-panel">
                        <div class="documents-grid">
                            <div class="document-upload">
                                <i class="fas fa-cloud-upload-alt fa-3x"></i>
                                <p>Drop files here or click to upload</p>
                                <input type="file" multiple hidden>
                            </div>
                            <div class="documents-list">
                                <!-- Documents will be listed here -->
                                <p class="text-muted">No documents uploaded yet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.show({
            id: `worker-profile-${workerId}`,
            title: `${worker.name} - Profile`,
            content: modalContent,
            size: 'xl',
            closable: true,
            onOpen: () => {
                this.initializeWorkerCharts(workerId, stats);
            }
        });
    }

    // ========== Task Details Modal ==========
    showTaskDetails(taskId) {
        const task = app.modules.dataManager.getTaskById(taskId);
        if (!task) {
            app.showError('Task not found');
            return;
        }

        const worker = task.assigneeId ? app.modules.dataManager.getWorkerById(task.assigneeId) : null;
        const subtasks = task.subtasks || [];
        const comments = task.comments || [];
        const attachments = task.attachments || [];

        const modalContent = `
            <div class="task-details-modal">
                <div class="task-header-section">
                    <div class="task-status-indicator ${task.status}">
                        ${this.getStatusIcon(task.status)}
                    </div>
                    <div class="task-header-info">
                        <h2>${task.title}</h2>
                        <div class="task-meta-info">
                            <span class="priority-badge ${task.priority}">
                                <i class="fas fa-flag"></i> ${task.priority} priority
                            </span>
                            ${task.category ? `<span class="category-badge">${task.category}</span>` : ''}
                            ${task.projectId ? `<span class="project-badge">Project: ${task.projectId}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon" onclick="modalsManager.editTask('${taskId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="modalsManager.duplicateTask('${taskId}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon" onclick="modalsManager.deleteTask('${taskId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="task-details-grid">
                    <div class="task-main-content">
                        <div class="task-section">
                            <h3>Description</h3>
                            <p>${task.description || 'No description provided'}</p>
                        </div>

                        ${task.checklist && task.checklist.length > 0 ? `
                            <div class="task-section">
                                <h3>Checklist</h3>
                                <div class="checklist">
                                    ${task.checklist.map((item, index) => `
                                        <div class="checklist-item ${item.completed ? 'completed' : ''}">
                                            <input type="checkbox" id="check-${index}" 
                                                   ${item.completed ? 'checked' : ''}
                                                   onchange="modalsManager.toggleChecklistItem('${taskId}', ${index})">
                                            <label for="check-${index}">${item.text}</label>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="checklist-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${this.getChecklistProgress(task.checklist)}%"></div>
                                    </div>
                                    <span>${this.getChecklistCompleted(task.checklist)} of ${task.checklist.length} completed</span>
                                </div>
                            </div>
                        ` : ''}

                        <div class="task-section">
                            <h3>Subtasks</h3>
                            <div class="subtasks-list">
                                ${subtasks.map(subtask => `
                                    <div class="subtask-item">
                                        <span class="subtask-status ${subtask.completed ? 'completed' : ''}">
                                            ${subtask.completed ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
                                        </span>
                                        <span class="subtask-title">${subtask.title}</span>
                                    </div>
                                `).join('')}
                                ${subtasks.length === 0 ? '<p class="text-muted">No subtasks</p>' : ''}
                            </div>
                            <button class="btn-text" onclick="modalsManager.addSubtask('${taskId}')">
                                <i class="fas fa-plus"></i> Add Subtask
                            </button>
                        </div>

                        <div class="task-section">
                            <h3>Activity & Comments</h3>
                            <div class="comments-section">
                                <div class="comment-input">
                                    <div class="user-avatar small">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <input type="text" placeholder="Add a comment..." id="comment-input-${taskId}">
                                    <button class="btn-primary" onclick="modalsManager.addComment('${taskId}')">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                                <div class="comments-list">
                                    ${comments.map(comment => `
                                        <div class="comment-item">
                                            <div class="user-avatar small">
                                                <i class="fas fa-user"></i>
                                            </div>
                                            <div class="comment-content">
                                                <div class="comment-header">
                                                    <span class="comment-author">${comment.author}</span>
                                                    <span class="comment-time">${DateUtils.getRelativeTime(comment.timestamp)}</span>
                                                </div>
                                                <p>${comment.text}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${comments.length === 0 ? '<p class="text-muted text-center">No comments yet</p>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="task-sidebar">
                        <div class="task-info-card">
                            <h4>Details</h4>
                            <div class="info-list">
                                <div class="info-item">
                                    <i class="fas fa-user"></i>
                                    <span class="label">Assignee:</span>
                                    <span class="value">${worker ? worker.name : 'Unassigned'}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar-plus"></i>
                                    <span class="label">Created:</span>
                                    <span class="value">${DateUtils.format(task.createdAt, 'medium')}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar-check"></i>
                                    <span class="label">Due Date:</span>
                                    <span class="value ${this.isOverdue(task.dueDate) ? 'text-danger' : ''}">
                                        ${task.dueDate ? DateUtils.format(task.dueDate, 'medium') : 'Not set'}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-hourglass-half"></i>
                                    <span class="label">Estimated:</span>
                                    <span class="value">${task.estimatedHours || '0'} hours</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-hourglass-end"></i>
                                    <span class="label">Actual:</span>
                                    <span class="value">${task.actualHours || '0'} hours</span>
                                </div>
                            </div>
                        </div>

                        <div class="task-info-card">
                            <h4>Attachments</h4>
                            <div class="attachments-list">
                                ${attachments.map(file => `
                                    <div class="attachment-item">
                                        <i class="fas ${this.getFileIcon(file.type)}"></i>
                                        <span>${file.name}</span>
                                        <button class="btn-icon small">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                `).join('')}
                                ${attachments.length === 0 ? '<p class="text-muted">No attachments</p>' : ''}
                            </div>
                            <button class="btn-secondary full-width">
                                <i class="fas fa-paperclip"></i> Add Attachment
                            </button>
                        </div>

                        <div class="task-info-card">
                            <h4>Tags</h4>
                            <div class="tags-list">
                                ${task.tags ? task.tags.map(tag => 
                                    `<span class="tag">${tag}</span>`
                                ).join('') : '<p class="text-muted">No tags</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.show({
            id: `task-details-${taskId}`,
            title: `Task: ${task.title}`,
            content: modalContent,
            size: 'xl',
            closable: true
        });
    }

    // ========== Custom Report Builder Modal ==========
    showCustomReportBuilder() {
        const modalContent = `
            <div class="report-builder-modal">
                <div class="builder-header">
                    <h3>Custom Report Builder</h3>
                    <p>Create personalized reports by selecting data points and visualization options</p>
                </div>

                <div class="builder-content">
                    <div class="builder-sidebar">
                        <h4>Data Sources</h4>
                        <div class="data-sources">
                            <label class="checkbox-item">
                                <input type="checkbox" name="data-source" value="workers">
                                <span><i class="fas fa-users"></i> Workers</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="data-source" value="tasks">
                                <span><i class="fas fa-tasks"></i> Tasks</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="data-source" value="time">
                                <span><i class="fas fa-clock"></i> Time Entries</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="data-source" value="finance">
                                <span><i class="fas fa-dollar-sign"></i> Financial</span>
                            </label>
                        </div>

                        <h4>Metrics</h4>
                        <div class="metrics-list" id="available-metrics">
                            <!-- Metrics will be populated based on selected data sources -->
                        </div>
                    </div>

                    <div class="builder-main">
                        <div class="builder-section">
                            <h4>Report Configuration</h4>
                            <div class="config-grid">
                                <div class="form-group">
                                    <label>Report Name</label>
                                    <input type="text" id="report-name" placeholder="My Custom Report">
                                </div>
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <select id="report-date-range">
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month" selected>This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Group By</label>
                                    <select id="report-group-by">
                                        <option value="none">None</option>
                                        <option value="day">Day</option>
                                        <option value="week">Week</option>
                                        <option value="month">Month</option>
                                        <option value="worker">Worker</option>
                                        <option value="department">Department</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Chart Type</label>
                                    <select id="report-chart-type">
                                        <option value="line">Line Chart</option>
                                        <option value="bar">Bar Chart</option>
                                        <option value="pie">Pie Chart</option>
                                        <option value="doughnut">Doughnut Chart</option>
                                        <option value="radar">Radar Chart</option>
                                        <option value="table">Table Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="builder-section">
                            <h4>Selected Metrics</h4>
                            <div class="selected-metrics" id="selected-metrics">
                                <p class="text-muted">Drag metrics here or click to add</p>
                            </div>
                        </div>

                        <div class="builder-section">
                            <h4>Preview</h4>
                            <div class="report-preview" id="report-preview">
                                <div class="preview-placeholder">
                                    <i class="fas fa-chart-bar fa-3x"></i>
                                    <p>Configure your report to see preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="builder-footer">
                    <button class="btn-secondary" onclick="modalsManager.previewReport()">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn-secondary" onclick="modalsManager.saveReportTemplate()">
                        <i class="fas fa-save"></i> Save Template
                    </button>
                    <button class="btn-primary" onclick="modalsManager.generateCustomReport()">
                        <i class="fas fa-file-export"></i> Generate Report
                    </button>
                </div>
            </div>
        `;

        this.show({
            id: 'custom-report-builder',
            title: 'Custom Report Builder',
            content: modalContent,
            size: 'xl',
            closable: true,
            onOpen: () => {
                this.initializeReportBuilder();
            }
        });
    }

    // ========== Schedule Report Modal ==========
    showScheduleReportModal() {
        const modalContent = `
            <div class="schedule-report-modal">
                <div class="schedule-header">
                    <i class="fas fa-calendar-plus fa-3x text-primary"></i>
                    <h3>Schedule Automated Reports</h3>
                    <p>Set up recurring reports to be generated and delivered automatically</p>
                </div>

                <form id="schedule-report-form">
                    <div class="form-section">
                        <h4>Report Details</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Report Type</label>
                                <select id="scheduled-report-type">
                                    <option value="overview">Overview Report</option>
                                    <option value="workers">Workers Performance</option>
                                    <option value="tasks">Task Analysis</option>
                                    <option value="financial">Financial Summary</option>
                                    <option value="productivity">Productivity Report</option>
                                    <option value="custom">Custom Report</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Report Name</label>
                                <input type="text" id="scheduled-report-name" placeholder="Monthly Performance Report">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Schedule</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Frequency</label>
                                <select id="schedule-frequency" onchange="modalsManager.updateScheduleOptions()">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                </select>
                            </div>
                            <div class="form-group" id="schedule-day-group">
                                <label>Day</label>
                                <select id="schedule-day">
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Time</label>
                                <input type="time" id="schedule-time" value="09:00">
                            </div>
                            <div class="form-group">
                                <label>Timezone</label>
                                <select id="schedule-timezone">
                                    <option value="UTC">UTC</option>
                                    <option value="EST">Eastern Time</option>
                                    <option value="CST">Central Time</option>
                                    <option value="MST">Mountain Time</option>
                                    <option value="PST" selected>Pacific Time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Delivery Options</h4>
                        <div class="delivery-options">
                            <label class="checkbox-item">
                                <input type="checkbox" id="delivery-email" checked>
                                <span><i class="fas fa-envelope"></i> Email</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" id="delivery-dashboard">
                                <span><i class="fas fa-tachometer-alt"></i> Dashboard</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" id="delivery-download">
                                <span><i class="fas fa-download"></i> Auto-Download</span>
                            </label>
                        </div>
                        
                        <div class="form-group" id="email-recipients">
                            <label>Email Recipients</label>
                            <input type="text" id="recipient-emails" placeholder="email1@example.com, email2@example.com">
                            <small>Separate multiple emails with commas</small>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Report Format</h4>
                        <div class="format-options">
                            <label class="radio-item">
                                <input type="radio" name="report-format" value="pdf" checked>
                                <span><i class="fas fa-file-pdf"></i> PDF</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="report-format" value="excel">
                                <span><i class="fas fa-file-excel"></i> Excel</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="report-format" value="csv">
                                <span><i class="fas fa-file-csv"></i> CSV</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Active Schedules</h4>
                        <div class="scheduled-reports-list">
                            ${this.getScheduledReports().map(schedule => `
                                <div class="scheduled-item">
                                    <div class="schedule-info">
                                        <strong>${schedule.name}</strong>
                                        <span>${schedule.frequency} at ${schedule.time}</span>
                                    </div>
                                    <div class="schedule-actions">
                                        <button type="button" class="btn-icon" onclick="modalsManager.toggleSchedule('${schedule.id}')">
                                            <i class="fas fa-${schedule.active ? 'pause' : 'play'}"></i>
                                        </button>
                                        <button type="button" class="btn-icon" onclick="modalsManager.deleteSchedule('${schedule.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                            ${this.getScheduledReports().length === 0 ? '<p class="text-muted">No scheduled reports yet</p>' : ''}
                        </div>
                    </div>
                </form>
            </div>
        `;

        this.show({
            id: 'schedule-report',
            title: 'Schedule Reports',
            content: modalContent,
            size: 'lg',
            closable: true,
            footer: `
                <button class="btn-secondary" onclick="modalsManager.close('schedule-report')">Cancel</button>
                <button class="btn-primary" onclick="modalsManager.saveScheduledReport()">
                    <i class="fas fa-save"></i> Save Schedule
                </button>
            `
        });
    }

    // ========== Task Assignment Modal ==========
    showTaskAssignment(taskId) {
        const task = app.modules.dataManager.getTaskById(taskId);
        const workers = app.modules.dataManager.getWorkers();
        
        const modalContent = `
            <div class="assignment-modal">
                <div class="assignment-header">
                    <h3>Assign Task</h3>
                    <div class="task-summary">
                        <span class="task-title">${task.title}</span>
                        <span class="priority-badge ${task.priority}">${task.priority}</span>
                    </div>
                </div>

                <div class="workers-selection">
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search workers..." id="assignment-search">
                    </div>

                    <div class="workers-list">
                        ${workers.map(worker => {
                            const workload = this.getWorkerWorkload(worker.id);
                            return `
                                <div class="worker-option ${task.assigneeId === worker.id ? 'selected' : ''}" 
                                     data-worker-id="${worker.id}">
                                    <div class="worker-info">
                                        <div class="worker-avatar small">
                                            ${this.getWorkerAvatar(worker, 'small')}
                                        </div>
                                        <div class="worker-details">
                                            <strong>${worker.name}</strong>
                                            <span>${worker.role || 'Team Member'}</span>
                                        </div>
                                    </div>
                                    <div class="worker-workload">
                                        <div class="workload-indicator ${workload.level}">
                                            <span>${workload.tasks} tasks</span>
                                            <div class="workload-bar">
                                                <div class="workload-fill" style="width: ${workload.percentage}%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn-primary btn-sm" onclick="modalsManager.assignToWorker('${taskId}', '${worker.id}')">
                                        Assign
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="assignment-notes">
                    <label>Assignment Notes (Optional)</label>
                    <textarea id="assignment-notes" placeholder="Add any special instructions..."></textarea>
                </div>

                <div class="assignment-options">
                    <label class="checkbox-item">
                        <input type="checkbox" id="notify-worker" checked>
                        <span>Notify worker via email</span>
                    </label>
                    <label class="checkbox-item">
                        <input type="checkbox" id="add-to-calendar">
                        <span>Add to worker's calendar</span>
                    </label>
                </div>
            </div>
        `;

        this.show({
            id: `assign-task-${taskId}`,
            title: 'Assign Task',
            content: modalContent,
            size: 'md',
            closable: true
        });
    }

    // ========== Helper Methods ==========
    
    show(options) {
        const modal = this.createModal(options);
        document.getElementById('modal-container').appendChild(modal);
        
        // Add to stack
        this.modalStack.push(options);
        this.activeModals.set(options.id, modal);
        
        // Show with animation
        setTimeout(() => {
            modal.classList.add('show');
            if (options.onOpen) {
                options.onOpen();
            }
        }, 10);
        
        return modal;
    }

    close(modalId) {
        const modal = this.activeModals.get(modalId);
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            this.activeModals.delete(modalId);
            this.modalStack = this.modalStack.filter(m => m.id !== modalId);
        }, 300);
    }

    createModal(options) {
        const modal = document.createElement('div');
        modal.className = `modal ${options.size || 'md'}`;
        modal.id = options.id;
        
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="modalsManager.close('${options.id}')"></div>
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${options.title}</h3>
                        ${options.closable !== false ? `
                            <button class="modal-close" onclick="modalsManager.close('${options.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="modal-body">
                        ${options.content}
                    </div>
                    ${options.footer ? `
                        <div class="modal-footer">
                            ${options.footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return modal;
    }

    calculateWorkerStats(worker, timeEntries, tasks) {
        const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
        const totalEarnings = timeEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);
        const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
        const completionRate = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;
        
        return {
            totalHours,
            totalEarnings,
            tasksCompleted,
            completionRate,
            rating: worker.rating || 4.5,
            productivityScore: Math.min(100, Math.round((tasksCompleted / Math.max(1, totalHours)) * 10)),
            attendanceRate: 95, // Mock data
            topPerformer: totalHours > 100 && completionRate > 80
        };
    }

    initializeWorkerCharts(workerId, stats) {
        // Activity chart
        const activityCtx = document.getElementById('worker-activity-chart');
        if (activityCtx) {
            new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Hours Worked',
                        data: [8, 7.5, 8, 9, 8.5, 4, 0],
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
                    }
                }
            });
        }

        // Performance trend chart
        const performanceCtx = document.getElementById('performance-trend-chart');
        if (performanceCtx) {
            new Chart(performanceCtx, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Tasks Completed',
                        data: [12, 15, 18, 20],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    switchProfileTab(tab, workerId) {
        // Switch tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tab}-panel`)?.classList.add('active');
        
        // Update tab buttons
        document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Load tab-specific content if needed
        if (tab === 'schedule') {
            this.loadWorkerSchedule(workerId);
        }
    }

    loadWorkerSchedule(workerId) {
        // Load and render worker's schedule
        const scheduleElement = document.getElementById('worker-schedule');
        if (scheduleElement) {
            // Implementation for calendar/schedule view
            scheduleElement.innerHTML = '<p>Schedule calendar will be rendered here</p>';
        }
    }

    getWorkerAvatar(worker, size = 'medium') {
        if (worker.avatar) {
            return `<img src="${worker.avatar}" alt="${worker.name}" class="avatar-${size}">`;
        }
        
        const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `<span>${initials}</span>`;
    }

    getStatusIcon(status) {
        const icons = {
            'todo': '<i class="fas fa-clock"></i>',
            'in-progress': '<i class="fas fa-spinner fa-spin"></i>',
            'review': '<i class="fas fa-eye"></i>',
            'completed': '<i class="fas fa-check-circle"></i>'
        };
        return icons[status] || '<i class="fas fa-question-circle"></i>';
    }

    getFileIcon(type) {
        if (type.includes('image')) return 'fa-image';
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('word')) return 'fa-file-word';
        if (type.includes('excel')) return 'fa-file-excel';
        if (type.includes('zip')) return 'fa-file-archive';
        return 'fa-file';
    }

    getChecklistProgress(checklist) {
        if (!checklist || checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.completed).length;
        return Math.round((completed / checklist.length) * 100);
    }

    getChecklistCompleted(checklist) {
        if (!checklist) return 0;
        return checklist.filter(item => item.completed).length;
    }

    isOverdue(dueDate) {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    getWorkerWorkload(workerId) {
        const tasks = app.modules.dataManager.getTasksForWorker(workerId);
        const activeTasks = tasks.filter(t => t.status !== 'completed').length;
        
        let level = 'low';
        if (activeTasks > 10) level = 'high';
        else if (activeTasks > 5) level = 'medium';
        
        return {
            tasks: activeTasks,
            level,
            percentage: Math.min(100, activeTasks * 10)
        };
    }

    getScheduledReports() {
        // Get scheduled reports from storage
        return StorageUtils.get('scheduled_reports') || [];
    }

    initializeReportBuilder() {
        // Initialize drag and drop for metrics
        const availableMetrics = document.getElementById('available-metrics');
        const selectedMetrics = document.getElementById('selected-metrics');
        
        // Populate available metrics based on selected data sources
        document.querySelectorAll('input[name="data-source"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateAvailableMetrics();
            });
        });
    }

    updateAvailableMetrics() {
        const selected = Array.from(document.querySelectorAll('input[name="data-source"]:checked'))
            .map(cb => cb.value);
        
        const metrics = {
            workers: ['Total Hours', 'Average Hours', 'Overtime Hours', 'Active Workers'],
            tasks: ['Total Tasks', 'Completed Tasks', 'Pending Tasks', 'Overdue Tasks'],
            time: ['Total Time', 'Billable Hours', 'Non-Billable Hours', 'Break Time'],
            finance: ['Revenue', 'Expenses', 'Profit', 'Profit Margin']
        };
        
        const availableMetrics = document.getElementById('available-metrics');
        availableMetrics.innerHTML = selected.flatMap(source => 
            metrics[source] ? metrics[source].map(metric => `
                <div class="metric-item" draggable="true" data-metric="${metric}">
                    <i class="fas fa-grip-vertical"></i>
                    <span>${metric}</span>
                </div>
            `) : []
        ).join('');
    }

    // Additional modal methods for various actions
    toggleChecklistItem(taskId, index) {
        const task = app.modules.dataManager.getTaskById(taskId);
        if (task && task.checklist && task.checklist[index]) {
            task.checklist[index].completed = !task.checklist[index].completed;
            app.modules.dataManager.updateTask(taskId, { checklist: task.checklist });
        }
    }

    addComment(taskId) {
        const input = document.getElementById(`comment-input-${taskId}`);
        if (input && input.value.trim()) {
            const task = app.modules.dataManager.getTaskById(taskId);
            if (!task.comments) task.comments = [];
            
            task.comments.push({
                id: StringUtils.generateId(),
                author: 'Current User',
                text: input.value.trim(),
                timestamp: new Date().toISOString()
            });
            
            app.modules.dataManager.updateTask(taskId, { comments: task.comments });
            input.value = '';
            
            // Refresh the modal
            this.showTaskDetails(taskId);
        }
    }

    assignToWorker(taskId, workerId) {
        app.modules.dataManager.updateTask(taskId, { assigneeId: workerId });
        app.showSuccess('Task assigned successfully');
        this.close(`assign-task-${taskId}`);
    }
}

// Initialize Modals Manager
document.addEventListener('DOMContentLoaded', () => {
    window.modalsManager = new ModalsManager();
    
    // Connect to existing managers
    if (window.workersManager) {
        window.workersManager.viewWorkerProfile = (workerId) => {
            window.modalsManager.showWorkerProfile(workerId);
        };
    }
    
    if (window.tasksManager) {
        window.tasksManager.viewTask = (taskId) => {
            window.modalsManager.showTaskDetails(taskId);
        };
        window.tasksManager.assignTask = (taskId) => {
            window.modalsManager.showTaskAssignment(taskId);
        };
    }
    
    if (window.reportsManager) {
        window.reportsManager.openScheduleModal = () => {
            window.modalsManager.showScheduleReportModal();
        };
        window.reportsManager.openCustomReportBuilder = () => {
            window.modalsManager.showCustomReportBuilder();
        };
    }
});
