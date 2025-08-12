/**
 * WorkForce Pro - Tasks Management Module
 * Version: 2.0.0
 * Comprehensive task management system
 */

class TasksManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'kanban';
        this.filters = {
            status: 'all',
            priority: 'all',
            assignee: 'all',
            search: '',
            dateRange: 'all'
        };
        this.sortBy = 'dueDate';
        this.sortOrder = 'asc';
        this.selectedTasks = new Set();
        this.draggedTask = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.initializeKanban();
        this.initializeCalendar();
    }

    setupEventListeners() {
        // Add Task Button
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
        }

        // View Toggle
        document.querySelectorAll('.task-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.closest('.task-view-btn').dataset.view);
            });
        });

        // Search
        const taskSearch = document.getElementById('task-search');
        if (taskSearch) {
            taskSearch.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.filterTasks();
            });
        }

        // Filters
        document.querySelectorAll('.task-filter').forEach(select => {
            select.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filter;
                this.filters[filterType] = e.target.value;
                this.filterTasks();
            });
        });

        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.quickFilter;
                this.applyQuickFilter(filter);
            });
        });
    }

    loadTasks() {
        const tasks = this.dataManager.getTasks();
        this.displayTasks(tasks);
        this.updateTaskStats(tasks);
    }

    displayTasks(tasks) {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const filteredTasks = this.applyFilters(tasks);
        const sortedTasks = this.sortTasks(filteredTasks);

        switch (this.currentView) {
            case 'kanban':
                container.innerHTML = this.getKanbanViewHTML(sortedTasks);
                this.initializeKanbanDragDrop();
                break;
            case 'list':
                container.innerHTML = this.getListViewHTML(sortedTasks);
                break;
            case 'calendar':
                container.innerHTML = this.getCalendarViewHTML(sortedTasks);
                this.renderCalendarTasks(sortedTasks);
                break;
            case 'timeline':
                container.innerHTML = this.getTimelineViewHTML(sortedTasks);
                break;
            default:
                container.innerHTML = this.getKanbanViewHTML(sortedTasks);
        }

        this.attachTaskEventListeners();
    }

    getKanbanViewHTML(tasks) {
        const columns = {
            'todo': { title: 'To Do', icon: 'clipboard-list', color: 'secondary' },
            'in-progress': { title: 'In Progress', icon: 'spinner', color: 'primary' },
            'review': { title: 'Review', icon: 'eye', color: 'warning' },
            'completed': { title: 'Completed', icon: 'check-circle', color: 'success' }
        };

        return `
            <div class="kanban-board">
                ${Object.entries(columns).map(([status, config]) => {
                    const columnTasks = tasks.filter(task => task.status === status);
                    return `
                        <div class="kanban-column" data-status="${status}">
                            <div class="kanban-header">
                                <div class="kanban-title">
                                    <i class="fas fa-${config.icon} text-${config.color}"></i>
                                    <span>${config.title}</span>
                                    <span class="task-count">${columnTasks.length}</span>
                                </div>
                                <button class="btn-icon" onclick="tasksManager.addTaskToColumn('${status}')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="kanban-body" data-status="${status}">
                                ${columnTasks.map(task => this.getTaskCardHTML(task)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getTaskCardHTML(task) {
        const worker = task.assigneeId ? this.dataManager.getWorkerById(task.assigneeId) : null;
        const priorityColors = {
            'low': 'info',
            'medium': 'warning',
            'high': 'danger',
            'urgent': 'danger'
        };

        return `
            <div class="task-card" draggable="true" data-task-id="${task.id}">
                <div class="task-card-header">
                    <span class="task-priority ${priorityColors[task.priority]}">
                        <i class="fas fa-flag"></i> ${task.priority}
                    </span>
                    <button class="btn-icon task-menu-btn" data-task-id="${task.id}">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                
                <div class="task-card-body">
                    <h4 class="task-title">${task.title}</h4>
                    <p class="task-description">${task.description}</p>
                    
                    ${task.checklist && task.checklist.length > 0 ? `
                        <div class="task-checklist">
                            <div class="checklist-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${this.getChecklistProgress(task.checklist)}%"></div>
                                </div>
                                <span class="progress-text">${this.getChecklistCompleted(task.checklist)}/${task.checklist.length}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="task-tags">
                        ${task.tags ? task.tags.map(tag => `
                            <span class="task-tag">${tag}</span>
                        `).join('') : ''}
                    </div>
                </div>
                
                <div class="task-card-footer">
                    <div class="task-meta">
                        ${worker ? `
                            <div class="task-assignee">
                                <div class="assignee-avatar">
                                    ${this.getWorkerAvatar(worker, 'small')}
                                </div>
                                <span>${worker.name}</span>
                            </div>
                        ` : '<div class="task-assignee unassigned">Unassigned</div>'}
                        
                        ${task.dueDate ? `
                            <div class="task-due ${this.isDue

(task.dueDate) ? 'overdue' : ''}">
                                <i class="far fa-calendar"></i>
                                <span>${this.formatDate(task.dueDate)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="task-actions">
                        ${task.attachments && task.attachments.length > 0 ? `
                            <span class="task-attachment">
                                <i class="fas fa-paperclip"></i> ${task.attachments.length}
                            </span>
                        ` : ''}
                        ${task.comments && task.comments.length > 0 ? `
                            <span class="task-comments">
                                <i class="far fa-comment"></i> ${task.comments.length}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getListViewHTML(tasks) {
        return `
            <div class="tasks-list-wrapper">
                <table class="tasks-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="select-all-tasks">
                            </th>
                            <th class="sortable" data-sort="title">
                                Task <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="priority">
                                Priority <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="status">
                                Status <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="assignee">
                                Assignee <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="dueDate">
                                Due Date <i class="fas fa-sort"></i>
                            </th>
                            <th>Progress</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(task => this.getTaskRowHTML(task)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getTaskRowHTML(task) {
        const worker = task.assigneeId ? this.dataManager.getWorkerById(task.assigneeId) : null;
        const statusColors = {
            'todo': 'secondary',
            'in-progress': 'primary',
            'review': 'warning',
            'completed': 'success'
        };
        const priorityColors = {
            'low': 'info',
            'medium': 'warning',
            'high': 'danger',
            'urgent': 'danger'
        };

        return `
            <tr data-task-id="${task.id}">
                <td>
                    <input type="checkbox" class="task-checkbox" value="${task.id}">
                </td>
                <td>
                    <div class="task-cell">
                        <div class="task-title-cell">
                            <strong>${task.title}</strong>
                            <small class="text-muted">${task.description.substring(0, 50)}...</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${priorityColors[task.priority]}">
                        <i class="fas fa-flag"></i> ${task.priority}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusColors[task.status]}">
                        ${task.status.replace('-', ' ')}
                    </span>
                </td>
                <td>
                    ${worker ? `
                        <div class="assignee-cell">
                            ${this.getWorkerAvatar(worker, 'tiny')}
                            <span>${worker.name}</span>
                        </div>
                    ` : '<span class="text-muted">Unassigned</span>'}
                </td>
                <td>
                    ${task.dueDate ? `
                        <span class="${this.isOverdue(task.dueDate) ? 'text-danger' : ''}">
                            ${this.formatDate(task.dueDate)}
                        </span>
                    ` : '<span class="text-muted">No due date</span>'}
                </td>
                <td>
                    <div class="progress-cell">
                        <div class="progress-bar-small">
                            <div class="progress-fill" style="width: ${this.getTaskProgress(task)}%"></div>
                        </div>
                        <span class="progress-text-small">${this.getTaskProgress(task)}%</span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" title="View" onclick="tasksManager.viewTask('${task.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" title="Edit" onclick="tasksManager.editTask('${task.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="tasksManager.deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getCalendarViewHTML(tasks) {
        return `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="btn-icon" id="calendar-prev">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="calendar-month-year"></h3>
                    <button class="btn-icon" id="calendar-next">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-grid" id="calendar-grid">
                    <!-- Calendar will be rendered here -->
                </div>
            </div>
        `;
    }

    getTimelineViewHTML(tasks) {
        const groupedTasks = this.groupTasksByDate(tasks);
        
        return `
            <div class="timeline-container">
                ${Object.entries(groupedTasks).map(([date, dateTasks]) => `
                    <div class="timeline-section">
                        <div class="timeline-date">
                            <span class="date-badge">${this.formatDate(date)}</span>
                        </div>
                        <div class="timeline-tasks">
                            ${dateTasks.map(task => `
                                <div class="timeline-task" data-task-id="${task.id}">
                                    <div class="timeline-task-time">
                                        ${task.startTime || '09:00'}
                                    </div>
                                    <div class="timeline-task-content">
                                        <div class="timeline-task-header">
                                            <span class="task-title">${task.title}</span>
                                            <span class="task-priority ${task.priority}">${task.priority}</span>
                                        </div>
                                        <p class="task-description">${task.description}</p>
                                        ${task.assigneeId ? `
                                            <div class="task-assignee">
                                                ${this.getWorkerName(task.assigneeId)}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    initializeKanbanDragDrop() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.kanban-body');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedTask = e.target;
                e.target.classList.add('dragging');
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(this.draggedTask);
                } else {
                    column.insertBefore(this.draggedTask, afterElement);
                }
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = this.draggedTask.dataset.taskId;
                const newStatus = column.dataset.status;
                this.updateTaskStatus(taskId, newStatus);
                this.draggedTask = null;
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    openAddTaskModal(presetStatus = null) {
        const modal = this.createTaskModal(null, presetStatus);
        document.body.appendChild(modal);
        modal.classList.add('active');

        // Setup form submission
        const form = modal.querySelector('#task-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask(new FormData(form));
        });
    }

    createTaskModal(task = null, presetStatus = null) {
        const modalId = 'task-modal';
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const workers = this.dataManager.getWorkers();
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = modalId;

        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.classList.remove('active')"></div>
            <div class="modal-content modal-xl">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-${task ? 'edit' : 'plus-circle'}"></i>
                        <h3>${task ? 'Edit Task' : 'Create New Task'}</h3>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="task-form" class="enhanced-form">
                        <div class="form-row">
                            <div class="form-group flex-2">
                                <label for="task-title">
                                    <i class="fas fa-heading"></i> Task Title *
                                </label>
                                <input type="text" id="task-title" name="title" required 
                                       value="${task?.title || ''}" placeholder="Enter task title...">
                            </div>
                            
                            <div class="form-group">
                                <label for="task-priority">
                                    <i class="fas fa-flag"></i> Priority
                                </label>
                                <select id="task-priority" name="priority">
                                    <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>High</option>
                                    <option value="urgent" ${task?.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="task-description">
                                <i class="fas fa-align-left"></i> Description
                            </label>
                            <textarea id="task-description" name="description" rows="4" 
                                      placeholder="Provide detailed task description...">${task?.description || ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-assignee">
                                    <i class="fas fa-user"></i> Assign To
                                </label>
                                <select id="task-assignee" name="assigneeId">
                                    <option value="">Unassigned</option>
                                    ${workers.map(worker => `
                                        <option value="${worker.id}" ${task?.assigneeId === worker.id ? 'selected' : ''}>
                                            ${worker.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="task-status">
                                    <i class="fas fa-tasks"></i> Status
                                </label>
                                <select id="task-status" name="status">
                                    <option value="todo" ${(task?.status === 'todo' || presetStatus === 'todo') ? 'selected' : ''}>To Do</option>
                                    <option value="in-progress" ${(task?.status === 'in-progress' || presetStatus === 'in-progress') ? 'selected' : ''}>In Progress</option>
                                    <option value="review" ${(task?.status === 'review' || presetStatus === 'review') ? 'selected' : ''}>Review</option>
                                    <option value="completed" ${(task?.status === 'completed' || presetStatus === 'completed') ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="task-due-date">
                                    <i class="fas fa-calendar"></i> Due Date
                                </label>
                                <input type="date" id="task-due-date" name="dueDate" 
                                       value="${task?.dueDate || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="task-due-time">
                                    <i class="fas fa-clock"></i> Due Time
                                </label>
                                <input type="time" id="task-due-time" name="dueTime" 
                                       value="${task?.dueTime || ''}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-estimated-hours">
                                    <i class="fas fa-hourglass-half"></i> Estimated Hours
                                </label>
                                <input type="number" id="task-estimated-hours" name="estimatedHours" 
                                       min="0" step="0.5" value="${task?.estimatedHours || ''}" 
                                       placeholder="0.0">
                            </div>
                            
                            <div class="form-group">
                                <label for="task-actual-hours">
                                    <i class="fas fa-hourglass-end"></i> Actual Hours
                                </label>
                                <input type="number" id="task-actual-hours" name="actualHours" 
                                       min="0" step="0.5" value="${task?.actualHours || ''}" 
                                       placeholder="0.0">
                            </div>
                            
                            <div class="form-group">
                                <label for="task-project">
                                    <i class="fas fa-project-diagram"></i> Project
                                </label>
                                <select id="task-project" name="projectId">
                                    <option value="">No Project</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="delivery">Delivery Service</option>
                                    <option value="custom">Custom Project</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-list-check"></i> Checklist
                            </label>
                            <div class="checklist-container" id="task-checklist">
                                ${task?.checklist ? task.checklist.map((item, index) => `
                                    <div class="checklist-item">
                                        <input type="checkbox" id="check-${index}" ${item.completed ? 'checked' : ''}>
                                        <input type="text" value="${item.text}" placeholder="Checklist item...">
                                        <button type="button" class="btn-icon" onclick="this.parentElement.remove()">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                `).join('') : ''}
                            </div>
                            <button type="button" class="btn-secondary btn-sm" onclick="tasksManager.addChecklistItem()">
                                <i class="fas fa-plus"></i> Add Checklist Item
                            </button>
                        </div>
                        
                        <div class="form-group">
                            <label for="task-tags">
                                <i class="fas fa-tags"></i> Tags
                            </label>
                            <input type="text" id="task-tags" name="tags" 
                                   value="${task?.tags ? task.tags.join(', ') : ''}" 
                                   placeholder="Enter tags separated by commas...">
                        </div>
                        
                        <div class="form-group">
                            <label for="task-attachments">
                                <i class="fas fa-paperclip"></i> Attachments
                            </label>
                            <div class="file-upload-area">
                                <input type="file" id="task-attachments" name="attachments" multiple>
                                <div class="file-upload-text">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drop files here or click to upload</p>
                                    <span>Supports: Images, PDFs, Documents (Max 10MB)</span>
                                </div>
                            </div>
                            ${task?.attachments && task.attachments.length > 0 ? `
                                <div class="attached-files">
                                    ${task.attachments.map(file => `
                                        <div class="attached-file">
                                            <i class="fas fa-file"></i>
                                            <span>${file.name}</span>
                                            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label for="task-notes">
                                <i class="fas fa-sticky-note"></i> Additional Notes
                            </label>
                            <textarea id="task-notes" name="notes" rows="3" 
                                      placeholder="Any additional notes or instructions...">${task?.notes || ''}</textarea>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').classList.remove('active')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> ${task ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        return modal;
    }

    addChecklistItem() {
        const container = document.getElementById('task-checklist');
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.innerHTML = `
            <input type="checkbox">
            <input type="text" placeholder="Checklist item...">
            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(item);
    }

    saveTask(formData) {
        const taskData = Object.fromEntries(formData.entries());
        
        // Process checklist
        const checklistItems = document.querySelectorAll('.checklist-item');
        taskData.checklist = Array.from(checklistItems).map(item => ({
            text: item.querySelector('input[type="text"]').value,
            completed: item.querySelector('input[type="checkbox"]').checked
        })).filter(item => item.text);

        // Process tags
        if (taskData.tags) {
            taskData.tags = taskData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Validate required fields
        if (!taskData.title) {
            app.showError('Task title is required');
            return;
        }

        // Save task
        const savedTask = this.dataManager.addTask(taskData);
        
        if (savedTask) {
            app.showSuccess('Task created successfully!');
            document.getElementById('task-modal').classList.remove('active');
            this.loadTasks();
        } else {
            app.showError('Failed to save task');
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const updated = this.dataManager.updateTask(taskId, { status: newStatus });
        if (updated) {
            app.showSuccess(`Task moved to ${newStatus.replace('-', ' ')}`);
            // Update analytics
            app.modules.analyticsManager.track('task_status_changed', {
                taskId: taskId,
                newStatus: newStatus
            });
        }
    }

    // Helper methods
    getChecklistProgress(checklist) {
        if (!checklist || checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.completed).length;
        return Math.round((completed / checklist.length) * 100);
    }

    getChecklistCompleted(checklist) {
        if (!checklist) return 0;
        return checklist.filter(item => item.completed).length;
    }

    getTaskProgress(task) {
        // Calculate based on checklist or estimated vs actual hours
        if (task.checklist && task.checklist.length > 0) {
            return this.getChecklistProgress(task.checklist);
        }
        if (task.estimatedHours && task.actualHours) {
            return Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100));
        }
        return task.status === 'completed' ? 100 : 0;
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
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

    getWorkerAvatar(worker, size = 'small') {
        const sizeClass = `avatar-${size}`;
        if (worker.avatar) {
            return `<img src="${worker.avatar}" alt="${worker.name}" class="${sizeClass}">`;
        }
        
        const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `<div class="${sizeClass} avatar-initials">${initials}</div>`;
    }

    getWorkerName(workerId) {
        const worker = this.dataManager.getWorkerById(workerId);
        return worker ? worker.name : 'Unassigned';
    }

    applyFilters(tasks) {
        let filtered = [...tasks];

        // Search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === this.filters.status);
        }

        // Priority filter
        if (this.filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === this.filters.priority);
        }

        // Assignee filter
        if (this.filters.assignee !== 'all') {
            filtered = filtered.filter(task => task.assigneeId === this.filters.assignee);
        }

        return filtered;
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];
            
            if (this.sortBy === 'dueDate') {
                aVal = aVal ? new Date(aVal) : new Date('9999-12-31');
                bVal = bVal ? new Date(bVal) : new Date('9999-12-31');
            }
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    groupTasksByDate(tasks) {
        const grouped = {};
        tasks.forEach(task => {
            const date = task.dueDate || 'No Date';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });
        return grouped;
    }

    updateTaskStats(tasks) {
        const stats = {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            overdue: tasks.filter(t => t.dueDate && this.isOverdue(t.dueDate)).length
        };

        // Update UI with stats
        const taskCount = document.getElementById('task-count');
        if (taskCount) {
            taskCount.textContent = stats.total - stats.completed;
        }
    }

    attachTaskEventListeners() {
        // Task menu buttons
        document.querySelectorAll('.task-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTaskContextMenu(e, btn.dataset.taskId);
            });
        });

        // Task cards click
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                this.viewTask(card.dataset.taskId);
            });
        });
    }

    showTaskContextMenu(event, taskId) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu) return;

        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="tasksManager.viewTask('${taskId}')">
                <i class="fas fa-eye"></i> View Details
            </div>
            <div class="context-menu-item" onclick="tasksManager.editTask('${taskId}')">
                <i class="fas fa-edit"></i> Edit Task
            </div>
            <div class="context-menu-item" onclick="tasksManager.duplicateTask('${taskId}')">
                <i class="fas fa-copy"></i> Duplicate
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" onclick="tasksManager.moveTask('${taskId}')">
                <i class="fas fa-arrows-alt"></i> Move To...
            </div>
            <div class="context-menu-item" onclick="tasksManager.assignTask('${taskId}')">
                <i class="fas fa-user-plus"></i> Assign To...
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item text-danger" onclick="tasksManager.deleteTask('${taskId}')">
                <i class="fas fa-trash"></i> Delete Task
            </div>
        `;

        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.classList.add('active');

        document.addEventListener('click', () => {
            contextMenu.classList.remove('active');
        }, { once: true });
    }

    viewTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;

        // TODO: Create detailed task view modal
        console.log('View task:', task);
    }

    editTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;

        const modal = this.createTaskModal(task);
        document.body.appendChild(modal);
        modal.classList.add('active');

        const form = modal.querySelector('#task-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask(taskId, new FormData(form));
        });
    }

    updateTask(taskId, formData) {
        const taskData = Object.fromEntries(formData.entries());
        
        // Process checklist and tags as before
        const checklistItems = document.querySelectorAll('.checklist-item');
        taskData.checklist = Array.from(checklistItems).map(item => ({
            text: item.querySelector('input[type="text"]').value,
            completed: item.querySelector('input[type="checkbox"]').checked
        })).filter(item => item.text);

        if (taskData.tags) {
            taskData.tags = taskData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        const updated = this.dataManager.updateTask(taskId, taskData);
        if (updated) {
            app.showSuccess('Task updated successfully!');
            document.getElementById('task-modal').classList.remove('active');
            this.loadTasks();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const deleted = this.dataManager.deleteTask(taskId);
            if (deleted) {
                app.showSuccess('Task deleted successfully');
                this.loadTasks();
            }
        }
    }

    duplicateTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;

        const duplicate = { ...task };
        delete duplicate.id;
        duplicate.title = `${task.title} (Copy)`;
        
        const newTask = this.dataManager.addTask(duplicate);
        if (newTask) {
            app.showSuccess('Task duplicated successfully');
            this.loadTasks();
        }
    }

    addTaskToColumn(status) {
        this.openAddTaskModal(status);
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.task-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.loadTasks();
    }

    applyQuickFilter(filter) {
        switch (filter) {
            case 'my-tasks':
                // Filter to current user's tasks
                break;
            case 'due-today':
                this.filters.dateRange = 'today';
                break;
            case 'overdue':
                this.filters.dateRange = 'overdue';
                break;
            case 'high-priority':
                this.filters.priority = 'high';
                break;
        }
        this.filterTasks();
    }

    filterTasks() {
        this.loadTasks();
    }

    initializeCalendar() {
        // Initialize calendar view
        // Implementation for calendar functionality
    }

    renderCalendarTasks(tasks) {
        // Render tasks on calendar
        // Implementation for calendar task rendering
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state-container">
                <div class="empty-state-icon">
                    <i class="fas fa-tasks fa-4x"></i>
                </div>
                <h3>No Tasks Yet</h3>
                <p>Create your first task to get started with task management.</p>
                <button class="btn-primary" onclick="tasksManager.openAddTaskModal()">
                    <i class="fas fa-plus-circle"></i> Create Your First Task
                </button>
            </div>
        `;
    }
}

// Initialize Tasks Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.modules.dataManager) {
        window.tasksManager = new TasksManager(window.app.modules.dataManager);
    }
});
