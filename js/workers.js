/**
 * WorkForce Pro - Workers Management Module
 * Version: 2.0.0
 * Handles all worker-related functionality
 */

class WorkersManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentView = 'grid';
        this.filters = {
            status: 'all',
            department: 'all',
            search: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.selectedWorkers = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWorkers();
        this.initializeStats();
    }

    setupEventListeners() {
        // Add Worker Button
        const addWorkerBtn = document.getElementById('add-worker-btn');
        if (addWorkerBtn) {
            addWorkerBtn.addEventListener('click', () => this.openAddWorkerModal());
        }

        // View Toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Search
        const workerSearch = document.getElementById('worker-search');
        if (workerSearch) {
            workerSearch.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.filterWorkers();
            });
        }

        // Filters
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const filterType = e.target.dataset.filter;
                this.filters[filterType] = e.target.value;
                this.filterWorkers();
            });
        });

        // Bulk Actions
        const bulkActions = document.getElementById('bulk-actions');
        if (bulkActions) {
            bulkActions.addEventListener('change', (e) => {
                this.handleBulkAction(e.target.value);
            });
        }
    }

    loadWorkers() {
        const workers = this.dataManager.getWorkers();
        this.displayWorkers(workers);
        this.updateWorkerCount(workers.length);
    }

    displayWorkers(workers) {
        const container = document.getElementById('workers-list');
        if (!container) return;

        if (workers.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const sortedWorkers = this.sortWorkers(workers);
        
        if (this.currentView === 'grid') {
            container.innerHTML = this.getGridViewHTML(sortedWorkers);
        } else {
            container.innerHTML = this.getListViewHTML(sortedWorkers);
        }

        // Add event listeners to worker cards
        this.attachWorkerCardListeners();
    }

    getGridViewHTML(workers) {
        return workers.map(worker => `
            <div class="worker-card" data-worker-id="${worker.id}">
                <div class="worker-card-header">
                    <div class="worker-avatar-wrapper">
                        ${this.getWorkerAvatar(worker)}
                        <span class="worker-status-indicator ${worker.status}"></span>
                    </div>
                    <div class="worker-card-menu">
                        <button class="btn-icon worker-menu-btn" data-worker-id="${worker.id}">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <div class="worker-card-body">
                    <h4 class="worker-name">${worker.name}</h4>
                    <p class="worker-role">${worker.role || 'Team Member'}</p>
                    
                    <div class="worker-meta">
                        ${worker.email ? `
                            <div class="meta-item">
                                <i class="fas fa-envelope"></i>
                                <span>${worker.email}</span>
                            </div>
                        ` : ''}
                        ${worker.phone ? `
                            <div class="meta-item">
                                <i class="fas fa-phone"></i>
                                <span>${worker.phone}</span>
                            </div>
                        ` : ''}
                        <div class="meta-item">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${worker.rate || '15.00'}/hr</span>
                        </div>
                    </div>
                    
                    <div class="worker-skills">
                        ${this.getSkillTags(worker.skills)}
                    </div>
                    
                    <div class="worker-stats">
                        <div class="stat">
                            <span class="stat-value">${this.getWorkerHours(worker.id)}</span>
                            <span class="stat-label">Hours This Week</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.getWorkerTasks(worker.id)}</span>
                            <span class="stat-label">Active Tasks</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.getWorkerRating(worker.id)}</span>
                            <span class="stat-label">Rating</span>
                        </div>
                    </div>
                </div>
                
                <div class="worker-card-footer">
                    <button class="btn-secondary btn-sm" onclick="workersManager.viewWorkerProfile('${worker.id}')">
                        <i class="fas fa-user"></i> Profile
                    </button>
                    <button class="btn-primary btn-sm" onclick="workersManager.addTimeEntry('${worker.id}')">
                        <i class="fas fa-clock"></i> Add Time
                    </button>
                </div>
            </div>
        `).join('');
    }

    getListViewHTML(workers) {
        return `
            <div class="workers-table-wrapper">
                <table class="workers-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="select-all-workers">
                            </th>
                            <th class="sortable" data-sort="name">
                                Name <i class="fas fa-sort"></i>
                            </th>
                            <th class="sortable" data-sort="role">
                                Role <i class="fas fa-sort"></i>
                            </th>
                            <th>Contact</th>
                            <th class="sortable" data-sort="rate">
                                Rate <i class="fas fa-sort"></i>
                            </th>
                            <th>Hours (Week)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workers.map(worker => `
                            <tr data-worker-id="${worker.id}">
                                <td>
                                    <input type="checkbox" class="worker-checkbox" value="${worker.id}">
                                </td>
                                <td>
                                    <div class="worker-cell">
                                        ${this.getWorkerAvatar(worker, 'small')}
                                        <div>
                                            <div class="worker-name">${worker.name}</div>
                                            <div class="worker-department">${worker.department || 'General'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${worker.role || 'Team Member'}</td>
                                <td>
                                    <div class="contact-info">
                                        ${worker.email ? `<div><i class="fas fa-envelope"></i> ${worker.email}</div>` : ''}
                                        ${worker.phone ? `<div><i class="fas fa-phone"></i> ${worker.phone}</div>` : ''}
                                    </div>
                                </td>
                                <td>$${worker.rate || '15.00'}/hr</td>
                                <td>${this.getWorkerHours(worker.id)}</td>
                                <td>
                                    <span class="status-badge ${worker.status}">${worker.status}</span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" title="Edit" onclick="workersManager.editWorker('${worker.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon" title="View" onclick="workersManager.viewWorkerProfile('${worker.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon" title="Delete" onclick="workersManager.deleteWorker('${worker.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getWorkerAvatar(worker, size = 'medium') {
        const sizeClasses = {
            small: 'avatar-sm',
            medium: 'avatar-md',
            large: 'avatar-lg'
        };

        if (worker.avatar) {
            return `<img src="${worker.avatar}" alt="${worker.name}" class="worker-avatar ${sizeClasses[size]}">`;
        }

        const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
        const colorIndex = worker.name.charCodeAt(0) % colors.length;
        
        return `
            <div class="worker-avatar ${sizeClasses[size]}" style="background: ${colors[colorIndex]}">
                ${initials}
            </div>
        `;
    }

    getSkillTags(skills) {
        if (!skills) return '<span class="text-muted">No skills listed</span>';
        
        const skillArray = skills.split(',').map(s => s.trim());
        return skillArray.map(skill => `
            <span class="skill-tag">${skill}</span>
        `).join('');
    }

    getWorkerHours(workerId) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const timeEntries = this.dataManager.getTimeEntriesForWorker(workerId, weekStart, new Date());
        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
        
        return totalHours.toFixed(1);
    }

    getWorkerTasks(workerId) {
        const tasks = this.dataManager.getTasksForWorker(workerId);
        return tasks.filter(t => t.status !== 'completed').length;
    }

    getWorkerRating(workerId) {
        // Mock rating for now
        const ratings = ['4.5', '4.8', '4.9', '5.0', '4.7'];
        return ratings[Math.floor(Math.random() * ratings.length)] + ' ⭐';
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state-container">
                <div class="empty-state-icon">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="var(--bg-tertiary)"/>
                        <path d="M60 40 L60 80 M40 60 L80 60" stroke="var(--text-tertiary)" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3>No Workers Yet</h3>
                <p>Start building your team by adding your first worker.</p>
                <button class="btn-primary" onclick="workersManager.openAddWorkerModal()">
                    <i class="fas fa-user-plus"></i> Add Your First Worker
                </button>
            </div>
        `;
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Reload workers with new view
        this.loadWorkers();
    }

    filterWorkers() {
        let workers = this.dataManager.getWorkers();
        
        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            workers = workers.filter(worker => 
                worker.name.toLowerCase().includes(searchTerm) ||
                (worker.email && worker.email.toLowerCase().includes(searchTerm)) ||
                (worker.phone && worker.phone.includes(searchTerm)) ||
                (worker.skills && worker.skills.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply status filter
        if (this.filters.status !== 'all') {
            workers = workers.filter(worker => worker.status === this.filters.status);
        }
        
        // Apply department filter
        if (this.filters.department !== 'all') {
            workers = workers.filter(worker => worker.department === this.filters.department);
        }
        
        this.displayWorkers(workers);
    }

    sortWorkers(workers) {
        return workers.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    attachWorkerCardListeners() {
        // Context menu for worker cards
        document.querySelectorAll('.worker-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showWorkerContextMenu(e, btn.dataset.workerId);
            });
        });

        // Checkbox listeners for list view
        const selectAll = document.getElementById('select-all-workers');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                document.querySelectorAll('.worker-checkbox').forEach(cb => {
                    cb.checked = e.target.checked;
                    if (e.target.checked) {
                        this.selectedWorkers.add(cb.value);
                    } else {
                        this.selectedWorkers.clear();
                    }
                });
                this.updateBulkActionsVisibility();
            });
        }

        document.querySelectorAll('.worker-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedWorkers.add(e.target.value);
                } else {
                    this.selectedWorkers.delete(e.target.value);
                }
                this.updateBulkActionsVisibility();
            });
        });

        // Sortable columns
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortField = th.dataset.sort;
                if (this.sortBy === sortField) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sortField;
                    this.sortOrder = 'asc';
                }
                this.loadWorkers();
            });
        });
    }

    showWorkerContextMenu(event, workerId) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu) return;

        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="workersManager.viewWorkerProfile('${workerId}')">
                <i class="fas fa-user"></i> View Profile
            </div>
            <div class="context-menu-item" onclick="workersManager.editWorker('${workerId}')">
                <i class="fas fa-edit"></i> Edit Worker
            </div>
            <div class="context-menu-item" onclick="workersManager.addTimeEntry('${workerId}')">
                <i class="fas fa-clock"></i> Add Time Entry
            </div>
            <div class="context-menu-item" onclick="workersManager.assignTask('${workerId}')">
                <i class="fas fa-tasks"></i> Assign Task
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" onclick="workersManager.duplicateWorker('${workerId}')">
                <i class="fas fa-copy"></i> Duplicate
            </div>
            <div class="context-menu-item" onclick="workersManager.exportWorkerData('${workerId}')">
                <i class="fas fa-download"></i> Export Data
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item text-danger" onclick="workersManager.deleteWorker('${workerId}')">
                <i class="fas fa-trash"></i> Delete Worker
            </div>
        `;

        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.classList.add('active');

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            contextMenu.classList.remove('active');
        }, { once: true });
    }

    updateBulkActionsVisibility() {
        const bulkActionsBar = document.getElementById('bulk-actions-bar');
        if (bulkActionsBar) {
            if (this.selectedWorkers.size > 0) {
                bulkActionsBar.classList.add('active');
                bulkActionsBar.querySelector('.selected-count').textContent = 
                    `${this.selectedWorkers.size} worker(s) selected`;
            } else {
                bulkActionsBar.classList.remove('active');
            }
        }
    }

    handleBulkAction(action) {
        if (this.selectedWorkers.size === 0) {
            app.showNotification({
                type: 'warning',
                title: 'No Selection',
                message: 'Please select workers first'
            });
            return;
        }

        switch (action) {
            case 'delete':
                this.bulkDeleteWorkers();
                break;
            case 'export':
                this.bulkExportWorkers();
                break;
            case 'status':
                this.bulkUpdateStatus();
                break;
            case 'department':
                this.bulkUpdateDepartment();
                break;
            default:
                break;
        }
    }

    bulkDeleteWorkers() {
        if (confirm(`Are you sure you want to delete ${this.selectedWorkers.size} worker(s)?`)) {
            this.selectedWorkers.forEach(workerId => {
                this.dataManager.deleteWorker(workerId);
            });
            this.selectedWorkers.clear();
            this.loadWorkers();
            app.showSuccess(`${this.selectedWorkers.size} worker(s) deleted successfully`);
        }
    }

    bulkExportWorkers() {
        const workers = Array.from(this.selectedWorkers).map(id => 
            this.dataManager.getWorkerById(id)
        );
        
        const exportData = {
            workers: workers,
            exportDate: new Date().toISOString(),
            totalWorkers: workers.length
        };
        
        app.modules.exportManager.export(exportData, 'json', 'workers_export');
        app.showSuccess('Workers exported successfully');
    }

    openAddWorkerModal() {
        const modal = this.createWorkerModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
        
        // Setup form submission
        const form = modal.querySelector('#worker-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWorker(new FormData(form));
        });
    }

    createWorkerModal(worker = null) {
        const modalId = 'worker-modal';
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = modalId;
        
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.classList.remove('active')"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-user-${worker ? 'edit' : 'plus'}"></i>
                        <h3>${worker ? 'Edit Worker' : 'Add New Worker'}</h3>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="worker-form" class="enhanced-form">
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="basic">
                                <i class="fas fa-user"></i> Basic Info
                            </button>
                            <button type="button" class="tab-btn" data-tab="contact">
                                <i class="fas fa-address-card"></i> Contact
                            </button>
                            <button type="button" class="tab-btn" data-tab="employment">
                                <i class="fas fa-briefcase"></i> Employment
                            </button>
                            <button type="button" class="tab-btn" data-tab="skills">
                                <i class="fas fa-certificate"></i> Skills
                            </button>
                        </div>
                        
                        <div class="form-tab-content active" data-tab="basic">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="worker-name">
                                        <i class="fas fa-user"></i> Full Name *
                                    </label>
                                    <input type="text" id="worker-name" name="name" required 
                                           value="${worker?.name || ''}" placeholder="John Doe">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-role">
                                        <i class="fas fa-user-tag"></i> Role/Position
                                    </label>
                                    <input type="text" id="worker-role" name="role" 
                                           value="${worker?.role || ''}" placeholder="Team Member">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-department">
                                        <i class="fas fa-building"></i> Department
                                    </label>
                                    <select id="worker-department" name="department">
                                        <option value="">Select Department</option>
                                        <option value="delivery" ${worker?.department === 'delivery' ? 'selected' : ''}>Delivery</option>
                                        <option value="maintenance" ${worker?.department === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                                        <option value="general" ${worker?.department === 'general' ? 'selected' : ''}>General</option>
                                        <option value="admin" ${worker?.department === 'admin' ? 'selected' : ''}>Administration</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-status">
                                        <i class="fas fa-toggle-on"></i> Status
                                    </label>
                                    <select id="worker-status" name="status">
                                        <option value="active" ${worker?.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="inactive" ${worker?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                        <option value="vacation" ${worker?.status === 'vacation' ? 'selected' : ''}>On Vacation</option>
                                        <option value="sick" ${worker?.status === 'sick' ? 'selected' : ''}>Sick Leave</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="worker-avatar">
                                    <i class="fas fa-camera"></i> Profile Picture
                                </label>
                                <div class="avatar-upload">
                                    <div class="avatar-preview">
                                        ${worker?.avatar ? `<img src="${worker.avatar}" alt="Avatar">` : '<i class="fas fa-user fa-3x"></i>'}
                                    </div>
                                    <input type="file" id="worker-avatar" name="avatar" accept="image/*">
                                    <label for="worker-avatar" class="btn-secondary">Choose Photo</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-tab-content" data-tab="contact">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="worker-email">
                                        <i class="fas fa-envelope"></i> Email Address
                                    </label>
                                    <input type="email" id="worker-email" name="email" 
                                           value="${worker?.email || ''}" placeholder="john@example.com">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-phone">
                                        <i class="fas fa-phone"></i> Phone Number
                                    </label>
                                    <input type="tel" id="worker-phone" name="phone" 
                                           value="${worker?.phone || ''}" placeholder="(555) 123-4567">
                                </div>
                                
                                <div class="form-group span-2">
                                    <label for="worker-address">
                                        <i class="fas fa-map-marker-alt"></i> Address
                                    </label>
                                    <input type="text" id="worker-address" name="address" 
                                           value="${worker?.address || ''}" placeholder="123 Main St, City, State 12345">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-emergency-contact">
                                        <i class="fas fa-user-shield"></i> Emergency Contact
                                    </label>
                                    <input type="text" id="worker-emergency-contact" name="emergencyContact" 
                                           value="${worker?.emergencyContact || ''}" placeholder="Jane Doe">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-emergency-phone">
                                        <i class="fas fa-phone-alt"></i> Emergency Phone
                                    </label>
                                    <input type="tel" id="worker-emergency-phone" name="emergencyPhone" 
                                           value="${worker?.emergencyPhone || ''}" placeholder="(555) 987-6543">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-tab-content" data-tab="employment">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="worker-employee-id">
                                        <i class="fas fa-id-badge"></i> Employee ID
                                    </label>
                                    <input type="text" id="worker-employee-id" name="employeeId" 
                                           value="${worker?.employeeId || ''}" placeholder="EMP001">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-start-date">
                                        <i class="fas fa-calendar-plus"></i> Start Date
                                    </label>
                                    <input type="date" id="worker-start-date" name="startDate" 
                                           value="${worker?.startDate || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-rate">
                                        <i class="fas fa-dollar-sign"></i> Hourly Rate
                                    </label>
                                    <input type="number" id="worker-rate" name="rate" step="0.01" min="0" 
                                           value="${worker?.rate || '15.00'}" placeholder="15.00">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-overtime-rate">
                                        <i class="fas fa-business-time"></i> Overtime Rate
                                    </label>
                                    <input type="number" id="worker-overtime-rate" name="overtimeRate" step="0.01" min="0" 
                                           value="${worker?.overtimeRate || '22.50'}" placeholder="22.50">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-payment-method">
                                        <i class="fas fa-money-check"></i> Payment Method
                                    </label>
                                    <select id="worker-payment-method" name="paymentMethod">
                                        <option value="cash" ${worker?.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                                        <option value="check" ${worker?.paymentMethod === 'check' ? 'selected' : ''}>Check</option>
                                        <option value="direct-deposit" ${worker?.paymentMethod === 'direct-deposit' ? 'selected' : ''}>Direct Deposit</option>
                                        <option value="paypal" ${worker?.paymentMethod === 'paypal' ? 'selected' : ''}>PayPal</option>
                                        <option value="venmo" ${worker?.paymentMethod === 'venmo' ? 'selected' : ''}>Venmo</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-schedule">
                                        <i class="fas fa-clock"></i> Work Schedule
                                    </label>
                                    <select id="worker-schedule" name="schedule">
                                        <option value="full-time" ${worker?.schedule === 'full-time' ? 'selected' : ''}>Full Time</option>
                                        <option value="part-time" ${worker?.schedule === 'part-time' ? 'selected' : ''}>Part Time</option>
                                        <option value="contract" ${worker?.schedule === 'contract' ? 'selected' : ''}>Contract</option>
                                        <option value="on-call" ${worker?.schedule === 'on-call' ? 'selected' : ''}>On Call</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="worker-notes">
                                    <i class="fas fa-sticky-note"></i> Employment Notes
                                </label>
                                <textarea id="worker-notes" name="notes" rows="3" 
                                          placeholder="Any additional employment information...">${worker?.notes || ''}</textarea>
                            </div>
                        </div>
                        
                        <div class="form-tab-content" data-tab="skills">
                            <div class="form-group">
                                <label for="worker-skills">
                                    <i class="fas fa-tools"></i> Skills & Certifications
                                </label>
                                <div class="skills-input-wrapper">
                                    <input type="text" id="worker-skills-input" placeholder="Type a skill and press Enter">
                                    <div class="skills-tags" id="skills-tags">
                                        ${worker?.skills ? this.getEditableSkillTags(worker.skills) : ''}
                                    </div>
                                </div>
                                <input type="hidden" id="worker-skills" name="skills" value="${worker?.skills || ''}">
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="worker-experience">
                                        <i class="fas fa-award"></i> Years of Experience
                                    </label>
                                    <input type="number" id="worker-experience" name="experience" min="0" 
                                           value="${worker?.experience || ''}" placeholder="5">
                                </div>
                                
                                <div class="form-group">
                                    <label for="worker-rating">
                                        <i class="fas fa-star"></i> Performance Rating
                                    </label>
                                    <select id="worker-rating" name="rating">
                                        <option value="">Not Rated</option>
                                        <option value="1" ${worker?.rating === '1' ? 'selected' : ''}>1 Star</option>
                                        <option value="2" ${worker?.rating === '2' ? 'selected' : ''}>2 Stars</option>
                                        <option value="3" ${worker?.rating === '3' ? 'selected' : ''}>3 Stars</option>
                                        <option value="4" ${worker?.rating === '4' ? 'selected' : ''}>4 Stars</option>
                                        <option value="5" ${worker?.rating === '5' ? 'selected' : ''}>5 Stars</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="worker-certifications">
                                    <i class="fas fa-certificate"></i> Certifications
                                </label>
                                <textarea id="worker-certifications" name="certifications" rows="3" 
                                          placeholder="List any relevant certifications...">${worker?.certifications || ''}</textarea>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').classList.remove('active')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> ${worker ? 'Update Worker' : 'Add Worker'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Setup tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update buttons
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update content
                modal.querySelectorAll('.form-tab-content').forEach(content => {
                    content.classList.toggle('active', content.dataset.tab === tabName);
                });
            });
        });

        // Setup skills input
        this.setupSkillsInput(modal);

        return modal;
    }

    getEditableSkillTags(skills) {
        const skillArray = skills.split(',').map(s => s.trim());
        return skillArray.map(skill => `
            <span class="skill-tag editable">
                ${skill}
                <button type="button" class="remove-skill" data-skill="${skill}">×</button>
            </span>
        `).join('');
    }

    setupSkillsInput(modal) {
        const input = modal.querySelector('#worker-skills-input');
        const tagsContainer = modal.querySelector('#skills-tags');
        const hiddenInput = modal.querySelector('#worker-skills');

        if (!input || !tagsContainer || !hiddenInput) return;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const skill = input.value.trim();
                if (skill) {
                    this.addSkillTag(skill, tagsContainer, hiddenInput);
                    input.value = '';
                }
            }
        });

        tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-skill')) {
                e.target.parentElement.remove();
                this.updateSkillsInput(tagsContainer, hiddenInput);
            }
        });
    }

    addSkillTag(skill, container, hiddenInput) {
        const tag = document.createElement('span');
        tag.className = 'skill-tag editable';
        tag.innerHTML = `
            ${skill}
            <button type="button" class="remove-skill" data-skill="${skill}">×</button>
        `;
        container.appendChild(tag);
        this.updateSkillsInput(container, hiddenInput);
    }

    updateSkillsInput(container, hiddenInput) {
        const skills = Array.from(container.querySelectorAll('.skill-tag')).map(tag => 
            tag.textContent.replace('×', '').trim()
        );
        hiddenInput.value = skills.join(', ');
    }

    saveWorker(formData) {
        const workerData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!workerData.name) {
            app.showError('Worker name is required');
            return;
        }

        // Save worker
        const savedWorker = this.dataManager.addWorker(workerData);
        
        if (savedWorker) {
            app.showSuccess('Worker added successfully!');
            document.getElementById('worker-modal').classList.remove('active');
            this.loadWorkers();
        } else {
            app.showError('Failed to save worker');
        }
    }

    editWorker(workerId) {
        const worker = this.dataManager.getWorkerById(workerId);
        if (!worker) {
            app.showError('Worker not found');
            return;
        }

        const modal = this.createWorkerModal(worker);
        document.body.appendChild(modal);
        modal.classList.add('active');

        // Setup form submission for update
        const form = modal.querySelector('#worker-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateWorker(workerId, new FormData(form));
        });
    }

    updateWorker(workerId, formData) {
        const workerData = Object.fromEntries(formData.entries());
        
        const updatedWorker = this.dataManager.updateWorker(workerId, workerData);
        
        if (updatedWorker) {
            app.showSuccess('Worker updated successfully!');
            document.getElementById('worker-modal').classList.remove('active');
            this.loadWorkers();
        } else {
            app.showError('Failed to update worker');
        }
    }

    deleteWorker(workerId) {
        const worker = this.dataManager.getWorkerById(workerId);
        if (!worker) return;

        if (confirm(`Are you sure you want to delete ${worker.name}? This action cannot be undone.`)) {
            const deleted = this.dataManager.deleteWorker(workerId);
            
            if (deleted) {
                app.showSuccess('Worker deleted successfully');
                this.loadWorkers();
            } else {
                app.showError('Failed to delete worker');
            }
        }
    }

    viewWorkerProfile(workerId) {
        // Create and show worker profile modal
        const worker = this.dataManager.getWorkerById(workerId);
        if (!worker) {
            app.showError('Worker not found');
            return;
        }

        // TODO: Implement detailed worker profile view
        console.log('View profile for:', worker);
        app.showNotification({
            type: 'info',
            title: 'Worker Profile',
            message: `Viewing profile for ${worker.name}`
        });
    }

    addTimeEntry(workerId) {
        // Open quick add modal with worker pre-selected
        app.openQuickAdd();
        setTimeout(() => {
            const workerSelect = document.getElementById('quick-worker');
            if (workerSelect) {
                workerSelect.value = workerId;
            }
        }, 100);
    }

    assignTask(workerId) {
        // TODO: Implement task assignment
        app.showNotification({
            type: 'info',
            title: 'Assign Task',
            message: 'Task assignment feature coming soon'
        });
    }

    duplicateWorker(workerId) {
        const worker = this.dataManager.getWorkerById(workerId);
        if (!worker) return;

        const duplicate = { ...worker };
        delete duplicate.id;
        duplicate.name = `${worker.name} (Copy)`;
        duplicate.employeeId = `${worker.employeeId || 'EMP'}_COPY`;

        const newWorker = this.dataManager.addWorker(duplicate);
        if (newWorker) {
            app.showSuccess('Worker duplicated successfully');
            this.loadWorkers();
        }
    }

    exportWorkerData(workerId) {
        const worker = this.dataManager.getWorkerById(workerId);
        if (!worker) return;

        const timeEntries = this.dataManager.getTimeEntriesForWorker(workerId);
        const tasks = this.dataManager.getTasksForWorker(workerId);

        const exportData = {
            worker: worker,
            timeEntries: timeEntries,
            tasks: tasks,
            summary: {
                totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
                totalEarnings: timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0),
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length
            },
            exportDate: new Date().toISOString()
        };

        app.modules.exportManager.export(exportData, 'json', `worker_${worker.name.replace(/\s+/g, '_')}`);
        app.showSuccess(`Data exported for ${worker.name}`);
    }

    updateWorkerCount(count) {
        const counterElement = document.getElementById('worker-count');
        if (counterElement) {
            counterElement.textContent = count;
        }
    }

    initializeStats() {
        // Initialize worker statistics
        const workers = this.dataManager.getWorkers();
        const activeWorkers = workers.filter(w => w.status === 'active').length;
        const totalHours = this.dataManager.getTotalHoursThisWeek();
        
        // Update any stat displays
        const statsContainer = document.getElementById('workers-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <div class="stat-value">${workers.length}</div>
                    <div class="stat-label">Total Workers</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-check"></i>
                    <div class="stat-value">${activeWorkers}</div>
                    <div class="stat-label">Active Workers</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock"></i>
                    <div class="stat-value">${totalHours.toFixed(1)}</div>
                    <div class="stat-label">Hours This Week</div>
                </div>
            `;
        }
    }
}

// Initialize Workers Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.modules.dataManager) {
        window.workersManager = new WorkersManager(window.app.modules.dataManager);
    }
});
