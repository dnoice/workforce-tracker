/**
 * WorkForce Pro - Utilities Module
 * Version: 2.0.0
 * Common utility functions and helpers
 */

// ========== Date & Time Utilities ==========
const DateUtils = {
    /**
     * Format date to various formats
     */
    format(date, format = 'short') {
        const d = new Date(date);
        
        const formats = {
            short: { month: 'short', day: 'numeric' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            iso: () => d.toISOString(),
            custom: (fmt) => this.customFormat(d, fmt)
        };
        
        if (typeof formats[format] === 'function') {
            return formats[format]();
        }
        
        return d.toLocaleDateString('en-US', formats[format] || formats.medium);
    },

    /**
     * Custom date formatting
     */
    customFormat(date, format) {
        const d = new Date(date);
        const replacements = {
            'YYYY': d.getFullYear(),
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'DD': String(d.getDate()).padStart(2, '0'),
            'HH': String(d.getHours()).padStart(2, '0'),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'ss': String(d.getSeconds()).padStart(2, '0')
        };
        
        let result = format;
        Object.keys(replacements).forEach(key => {
            result = result.replace(new RegExp(key, 'g'), replacements[key]);
        });
        
        return result;
    },

    /**
     * Get relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const d = new Date(date);
        const seconds = Math.floor((now - d) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
        if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
        return `${Math.floor(seconds / 31536000)} years ago`;
    },

    /**
     * Check if date is today
     */
    isToday(date) {
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    },

    /**
     * Check if date is in the past
     */
    isPast(date) {
        return new Date(date) < new Date();
    },

    /**
     * Check if date is in the future
     */
    isFuture(date) {
        return new Date(date) > new Date();
    },

    /**
     * Add days to date
     */
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },

    /**
     * Get start of day
     */
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Get end of day
     */
    endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    },

    /**
     * Get week number
     */
    getWeekNumber(date) {
        const d = new Date(date);
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    /**
     * Get days between two dates
     */
    getDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Get business days between two dates
     */
    getBusinessDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        let count = 0;
        
        while (d1 <= d2) {
            const dayOfWeek = d1.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            d1.setDate(d1.getDate() + 1);
        }
        
        return count;
    }
};

// ========== Number & Currency Utilities ==========
const NumberUtils = {
    /**
     * Format number with commas
     */
    formatNumber(num, decimals = 0) {
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format percentage
     */
    formatPercentage(value, decimals = 1) {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Round to decimal places
     */
    round(num, decimals = 2) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    /**
     * Calculate percentage
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    /**
     * Generate random number between min and max
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ========== String Utilities ==========
const StringUtils = {
    /**
     * Truncate string
     */
    truncate(str, length = 50, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Title case
     */
    titleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    /**
     * Camel case to title
     */
    camelToTitle(str) {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    },

    /**
     * Generate slug
     */
    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    /**
     * Generate initials
     */
    getInitials(name, limit = 2) {
        if (!name) return '';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, limit);
    },

    /**
     * Escape HTML
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Generate random string
     */
    generateId(prefix = '') {
        const random = Math.random().toString(36).substr(2, 9);
        const timestamp = Date.now().toString(36);
        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    }
};

// ========== Array Utilities ==========
const ArrayUtils = {
    /**
     * Group array by property
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by property
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    },

    /**
     * Find unique values
     */
    unique(array, key) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },

    /**
     * Chunk array
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * Flatten array
     */
    flatten(array) {
        return array.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
        }, []);
    },

    /**
     * Sum array values
     */
    sum(array, key) {
        return array.reduce((sum, item) => {
            return sum + (key ? item[key] : item);
        }, 0);
    },

    /**
     * Average array values
     */
    average(array, key) {
        if (array.length === 0) return 0;
        return this.sum(array, key) / array.length;
    }
};

// ========== Object Utilities ==========
const ObjectUtils = {
    /**
     * Deep clone object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    },

    /**
     * Check if object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * Pick properties from object
     */
    pick(obj, keys) {
        return keys.reduce((result, key) => {
            if (key in obj) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    },

    /**
     * Omit properties from object
     */
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    },

    /**
     * Check if object is empty
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
};

// ========== DOM Utilities ==========
const DOMUtils = {
    /**
     * Query selector with error handling
     */
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Query selector all
     */
    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    /**
     * Add class
     */
    addClass(element, ...classes) {
        element.classList.add(...classes);
    },

    /**
     * Remove class
     */
    removeClass(element, ...classes) {
        element.classList.remove(...classes);
    },

    /**
     * Toggle class
     */
    toggleClass(element, className, force) {
        return element.classList.toggle(className, force);
    },

    /**
     * Has class
     */
    hasClass(element, className) {
        return element.classList.contains(className);
    },

    /**
     * Insert after element
     */
    insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },

    /**
     * Remove element
     */
    remove(element) {
        element.parentNode?.removeChild(element);
    },

    /**
     * Empty element
     */
    empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Animate element
     */
    animate(element, animation, duration = 300) {
        return new Promise(resolve => {
            element.style.animation = `${animation} ${duration}ms`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
};

// ========== Storage Utilities ==========
const StorageUtils = {
    /**
     * Set item in localStorage with expiry
     */
    set(key, value, expiryInMinutes) {
        const item = {
            value: value,
            expiry: expiryInMinutes ? Date.now() + (expiryInMinutes * 60000) : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    /**
     * Get item from localStorage
     */
    get(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch (e) {
            return itemStr;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage
     */
    clear() {
        localStorage.clear();
    },

    /**
     * Get storage size
     */
    getSize() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    },

    /**
     * Session storage methods
     */
    session: {
        set(key, value) {
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        
        get(key) {
            const item = sessionStorage.getItem(key);
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        },
        
        remove(key) {
            sessionStorage.removeItem(key);
        },
        
        clear() {
            sessionStorage.clear();
        }
    }
};

// ========== Validation Utilities ==========
const ValidationUtils = {
    /**
     * Validate email
     */
    isEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone
     */
    isPhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    },

    /**
     * Validate URL
     */
    isURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Validate number
     */
    isNumber(value) {
        return !isNaN(value) && isFinite(value);
    },

    /**
     * Validate date
     */
    isDate(date) {
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Validate required
     */
    isRequired(value) {
        return value !== null && value !== undefined && value !== '';
    },

    /**
     * Validate min length
     */
    minLength(value, min) {
        return value && value.length >= min;
    },

    /**
     * Validate max length
     */
    maxLength(value, max) {
        return !value || value.length <= max;
    },

    /**
     * Validate range
     */
    inRange(value, min, max) {
        const num = Number(value);
        return num >= min && num <= max;
    },

    /**
     * Custom validation
     */
    validate(value, rules) {
        const errors = [];
        
        Object.entries(rules).forEach(([rule, param]) => {
            switch (rule) {
                case 'required':
                    if (param && !this.isRequired(value)) {
                        errors.push('This field is required');
                    }
                    break;
                case 'email':
                    if (param && value && !this.isEmail(value)) {
                        errors.push('Invalid email address');
                    }
                    break;
                case 'phone':
                    if (param && value && !this.isPhone(value)) {
                        errors.push('Invalid phone number');
                    }
                    break;
                case 'minLength':
                    if (!this.minLength(value, param)) {
                        errors.push(`Minimum length is ${param} characters`);
                    }
                    break;
                case 'maxLength':
                    if (!this.maxLength(value, param)) {
                        errors.push(`Maximum length is ${param} characters`);
                    }
                    break;
                case 'min':
                    if (Number(value) < param) {
                        errors.push(`Minimum value is ${param}`);
                    }
                    break;
                case 'max':
                    if (Number(value) > param) {
                        errors.push(`Maximum value is ${param}`);
                    }
                    break;
                case 'pattern':
                    if (!new RegExp(param).test(value)) {
                        errors.push('Invalid format');
                    }
                    break;
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

// ========== API Utilities ==========
const APIUtils = {
    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    },

    /**
     * Retry fetch
     */
    async fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    /**
     * Build query string
     */
    buildQueryString(params) {
        return Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    },

    /**
     * Parse query string
     */
    parseQueryString(queryString) {
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
};

// ========== Event Utilities ==========
const EventUtils = {
    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Once function
     */
    once(func) {
        let called = false;
        return function(...args) {
            if (!called) {
                called = true;
                return func.apply(this, args);
            }
        };
    },

    /**
     * Event emitter
     */
    createEventEmitter() {
        const events = {};
        
        return {
            on(event, listener) {
                if (!events[event]) events[event] = [];
                events[event].push(listener);
            },
            
            off(event, listener) {
                if (!events[event]) return;
                events[event] = events[event].filter(l => l !== listener);
            },
            
            emit(event, ...args) {
                if (!events[event]) return;
                events[event].forEach(listener => listener(...args));
            },
            
            once(event, listener) {
                const onceListener = (...args) => {
                    listener(...args);
                    this.off(event, onceListener);
                };
                this.on(event, onceListener);
            }
        };
    }
};

// ========== Color Utilities ==========
const ColorUtils = {
    /**
     * Generate random color
     */
    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    /**
     * Hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * RGB to Hex
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    /**
     * Lighten color
     */
    lighten(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const amt = Math.round(2.55 * percent);
        const r = Math.min(255, rgb.r + amt);
        const g = Math.min(255, rgb.g + amt);
        const b = Math.min(255, rgb.b + amt);
        
        return this.rgbToHex(r, g, b);
    },

    /**
     * Darken color
     */
    darken(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const amt = Math.round(2.55 * percent);
        const r = Math.max(0, rgb.r - amt);
        const g = Math.max(0, rgb.g - amt);
        const b = Math.max(0, rgb.b - amt);
        
        return this.rgbToHex(r, g, b);
    },

    /**
     * Get contrast color
     */
    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
};

// ========== Export Utilities ==========
const ExportUtils = {
    /**
     * Export to CSV
     */
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        this.download(csvContent, filename, 'text/csv');
    },

    /**
     * Export to JSON
     */
    exportToJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        this.download(json, filename, 'application/json');
    },

    /**
     * Export to Excel (basic)
     */
    exportToExcel(data, filename = 'export.xls') {
        let html = '<table>';
        
        // Headers
        if (data.length > 0) {
            html += '<tr>';
            Object.keys(data[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });
            html += '</tr>';
        }
        
        // Data
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        
        this.download(html, filename, 'application/vnd.ms-excel');
    },

    /**
     * Download file
     */
    download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Print content
     */
    print(content, title = 'Print') {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
};

// ========== Performance Utilities ==========
const PerformanceUtils = {
    /**
     * Measure function performance
     */
    measure(fn, label = 'Function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Measure async function performance
     */
    async measureAsync(fn, label = 'Async Function') {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: NumberUtils.formatFileSize(performance.memory.usedJSHeapSize),
                total: NumberUtils.formatFileSize(performance.memory.totalJSHeapSize),
                limit: NumberUtils.formatFileSize(performance.memory.jsHeapSizeLimit),
                percentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
            };
        }
        return null;
    }
};

// ========== Crypto Utilities ==========
const CryptoUtils = {
    /**
     * Generate UUID
     */
    generateUUID() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }
        
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Hash string (simple)
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    },

    /**
     * Encode base64
     */
    encodeBase64(str) {
        return btoa(encodeURIComponent(str));
    },

    /**
     * Decode base64
     */
    decodeBase64(str) {
        return decodeURIComponent(atob(str));
    }
};

// ========== Browser Utilities ==========
const BrowserUtils = {
    /**
     * Get browser info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)[1];
        } else if (ua.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)[1];
        } else if (ua.indexOf('Safari') > -1) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)[1];
        } else if (ua.indexOf('Edge') > -1) {
            browser = 'Edge';
            version = ua.match(/Edge\/(\d+)/)[1];
        }
        
        return { browser, version, userAgent: ua };
    },

    /**
     * Check if mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if touch device
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Get viewport size
     */
    getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },

    /**
     * Request fullscreen
     */
    requestFullscreen(element = document.documentElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    },

    /**
     * Exit fullscreen
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// ========== Export All Utilities ==========
window.Utils = {
    Date: DateUtils,
    Number: NumberUtils,
    String: StringUtils,
    Array: ArrayUtils,
    Object: ObjectUtils,
    DOM: DOMUtils,
    Storage: StorageUtils,
    Validation: ValidationUtils,
    API: APIUtils,
    Event: EventUtils,
    Color: ColorUtils,
    Export: ExportUtils,
    Performance: PerformanceUtils,
    Crypto: CryptoUtils,
    Browser: BrowserUtils
};

// Make utilities globally available
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.ObjectUtils = ObjectUtils;
window.DOMUtils = DOMUtils;
window.StorageUtils = StorageUtils;
window.ValidationUtils = ValidationUtils;
window.APIUtils = APIUtils;
window.EventUtils = EventUtils;
window.ColorUtils = ColorUtils;
window.ExportUtils = ExportUtils;
window.PerformanceUtils = PerformanceUtils;
window.CryptoUtils = CryptoUtils;
window.BrowserUtils = BrowserUtils;
