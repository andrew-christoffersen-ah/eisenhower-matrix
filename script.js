// Eisenhower Matrix Application

class EisenhowerMatrix {
    constructor() {
        this.currentDate = new Date();
        this.copiedMatrix = null;
        this.data = this.loadData();
        this.fileHandle = null;
        this.quotes = [];

        this.initializeElements();
        this.attachEventListeners();
        this.loadQuotes();
        this.checkFileSavingStatus();
        this.displayCurrentDate();
        this.displayDailyQuote();
        this.loadTasksForCurrentDate();
        this.loadCompletedThisMonth();
    }

    initializeElements() {
        this.currentDateElement = document.getElementById('current-date');
        this.taskInput = document.getElementById('task-input');
        this.quadrantSelect = document.getElementById('quadrant-select');
        this.addTaskButton = document.getElementById('add-task');
        this.prevDayButton = document.getElementById('prev-day');
        this.nextDayButton = document.getElementById('next-day');
        this.autoCopyTasksButton = document.getElementById('auto-copy-tasks');
        this.copyMatrixButton = document.getElementById('copy-matrix');
        this.pasteMatrixButton = document.getElementById('paste-matrix');
        this.copyStatus = document.getElementById('copy-status');
        this.exportDataButton = document.getElementById('export-data');
        this.importDataButton = document.getElementById('import-data');
        this.importFileInput = document.getElementById('import-file');
        this.dataStatus = document.getElementById('data-status');
        this.enableFileSavingButton = document.getElementById('enable-file-saving');
        this.fileSaveStatus = document.getElementById('file-save-status');
        this.dailyQuoteElement = document.getElementById('daily-quote');
        this.completedThisMonthSection = document.getElementById('completed-this-month-section');
        this.completedThisMonthList = document.getElementById('completed-this-month-list');

        // Quadrant elements
        this.doNowTasks = document.getElementById('do-now-tasks');
        this.scheduleTasks = document.getElementById('schedule-tasks');
        this.delegateTasks = document.getElementById('delegate-tasks');
        this.eliminateTasks = document.getElementById('eliminate-tasks');
    }

    attachEventListeners() {
        this.addTaskButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.prevDayButton.addEventListener('click', () => this.navigateDate(-1));
        this.nextDayButton.addEventListener('click', () => this.navigateDate(1));

        this.autoCopyTasksButton.addEventListener('click', () => this.autoCopyTasks());
        this.copyMatrixButton.addEventListener('click', () => this.copyMatrix());
        this.pasteMatrixButton.addEventListener('click', () => this.pasteMatrix());
        this.exportDataButton.addEventListener('click', () => this.exportData());
        this.importDataButton.addEventListener('click', () => this.importFileInput.click());
        this.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        this.enableFileSavingButton.addEventListener('click', () => this.enableFileSaving());
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    loadData() {
        // Try to load from cookies first (for automatic persistence)
        let data = this.loadFromCookies();

        // If no cookie data, try localStorage
        if (!data || Object.keys(data).length === 0) {
            data = localStorage.getItem('eisenhower-matrix-data');
            data = data ? JSON.parse(data) : {};
        }

        return data;
    }

    loadFromCookies() {
        try {
            const cookieData = this.getCookie('eisenhower-matrix-data');
            return cookieData ? JSON.parse(cookieData) : {};
        } catch (error) {
            console.warn('Failed to load data from cookies:', error);
            return {};
        }
    }

    saveToCookies(data) {
        try {
            const dataStr = JSON.stringify(data);
            // Set cookie to expire in 1 year
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);

            document.cookie = `eisenhower-matrix-data=${encodeURIComponent(dataStr)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
        } catch (error) {
            console.warn('Failed to save data to cookies:', error);
        }
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop().split(';').shift());
        }
        return null;
    }

    checkFileSavingStatus() {
        // Check if File System Access API is supported
        if (!('showSaveFilePicker' in window)) {
            this.fileSaveStatus.textContent = '⚠️ Automatic file saving requires a Chromium-based browser (Chrome, Edge, etc.)';
            this.enableFileSavingButton.disabled = true;
            return;
        }

        // Check if we previously had file access (but file handles don't persist across sessions)
        const hasFileAccess = localStorage.getItem('eisenhower-matrix-file-access') === 'true';
        if (hasFileAccess && this.fileHandle) {
            this.enableFileSavingButton.textContent = 'File Saving Enabled ✓';
            this.enableFileSavingButton.classList.add('enabled');
            this.fileSaveStatus.textContent = '✅ Data will automatically save to your selected JSON file';
        } else if (hasFileAccess) {
            // User previously enabled it but we need to re-grant permission
            this.fileSaveStatus.textContent = '🔄 Click "Enable Automatic File Saving" again to re-grant file access';
            localStorage.removeItem('eisenhower-matrix-file-access'); // Reset for clean state
        } else {
            this.fileSaveStatus.textContent = '💡 Click "Enable Automatic File Saving" to save your data to a JSON file automatically';
        }
    }

    async enableFileSaving() {
        try {
            const options = {
                suggestedName: 'eisenhower-matrix-data.json',
                types: [{
                    description: 'JSON Files',
                    accept: {
                        'application/json': ['.json'],
                    },
                }],
            };

            this.fileHandle = await window.showSaveFilePicker(options);

            // Mark that we have file access
            localStorage.setItem('eisenhower-matrix-file-access', 'true');

            // Update UI
            this.enableFileSavingButton.textContent = 'File Saving Enabled ✓';
            this.enableFileSavingButton.classList.add('enabled');
            this.fileSaveStatus.textContent = '✅ Data will automatically save to your selected JSON file';

            // Save current data immediately
            await this.saveToFile();

            console.log('File access granted for:', this.fileHandle.name);
        } catch (error) {
            console.log('File access denied or cancelled:', error);
            this.fileSaveStatus.textContent = '❌ File access was denied. You can still use the Export button manually.';
            throw error;
        }
    }

    saveData() {
        // Always save to localStorage for immediate persistence
        localStorage.setItem('eisenhower-matrix-data', JSON.stringify(this.data));

        // Also save to cookies for automatic persistence across sessions
        this.saveToCookies(this.data);

        // Also save to JSON file if we have file access
        this.saveToFile();
    }

    async saveToFile() {
        if (!this.fileHandle || !('createWritable' in this.fileHandle)) {
            return;
        }

        try {
            const writable = await this.fileHandle.createWritable();
            const dataStr = JSON.stringify(this.data, null, 2);
            await writable.write(dataStr);
            await writable.close();
            console.log('Data saved to file successfully');
        } catch (error) {
            console.error('Failed to save to file:', error);
            // If we lose access, reset the UI
            this.resetFileSavingStatus();
        }
    }

    async loadQuotes() {
        try {
            const response = await fetch('quotes.json');
            const data = await response.json();
            this.quotes = data.quotes || [];
        } catch (error) {
            console.error('Failed to load quotes:', error);
            this.quotes = ['"The only way to do great work is to love what you do." - Steve Jobs'];
        }
    }

    displayDailyQuote() {
        if (this.quotes.length === 0) {
            // Quotes not loaded yet, wait a bit and try again
            setTimeout(() => this.displayDailyQuote(), 100);
            return;
        }

        const dateKey = this.getDateKey(this.currentDate);

        // Use date as seed for consistent random selection
        const dateSeed = this.getDateSeed(dateKey);
        const quoteIndex = this.seededRandom(dateSeed, 0, this.quotes.length - 1);
        const styleIndex = this.seededRandom(dateSeed + 1, 1, 15);

        const quote = this.quotes[quoteIndex];
        const styleClass = `quote-style-${styleIndex}`;

        this.dailyQuoteElement.textContent = quote;
        this.dailyQuoteElement.className = `daily-quote ${styleClass}`;
    }

    // Generate a seed from date string for consistent random values
    getDateSeed(dateKey) {
        let seed = 0;
        for (let i = 0; i < dateKey.length; i++) {
            seed += dateKey.charCodeAt(i);
        }
        return seed;
    }

    // Seeded random number generator for consistent results per date
    seededRandom(seed, min, max) {
        const x = Math.sin(seed) * 10000;
        const random = x - Math.floor(x);
        return Math.floor(random * (max - min + 1)) + min;
    }

    // Convert URLs in text to clickable links
    convertUrlsToLinks(text) {
        // Regex to match URLs (http, https, and www)
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

        return text.replace(urlRegex, (url) => {
            // Add http:// if the URL starts with www
            const fullUrl = url.startsWith('www.') ? 'http://' + url : url;

            // Escape HTML characters for security
            const escapedUrl = fullUrl.replace(/&/g, '&amp;')
                                     .replace(/</g, '&lt;')
                                     .replace(/>/g, '&gt;')
                                     .replace(/"/g, '&quot;')
                                     .replace(/'/g, '&#39;');

            return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="task-link">${url}</a>`;
        });
    }

    resetFileSavingStatus() {
        localStorage.removeItem('eisenhower-matrix-file-access');
        this.fileHandle = null;
        this.enableFileSavingButton.textContent = 'Enable Automatic File Saving';
        this.enableFileSavingButton.classList.remove('enabled');
        this.fileSaveStatus.textContent = '💡 Click "Enable Automatic File Saving" to save your data to a JSON file automatically';
    }

    displayCurrentDate() {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        this.currentDateElement.textContent = this.currentDate.toLocaleDateString('en-US', options);
    }

    navigateDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.displayCurrentDate();
        this.displayDailyQuote();
        this.loadTasksForCurrentDate();
    }

    loadTasksForCurrentDate() {
        const dateKey = this.getDateKey(this.currentDate);
        const dayData = this.data[dateKey] || {
            'do-now': [],
            'schedule': [],
            'delegate': [],
            'eliminate': []
        };

        this.renderTasks('do-now', dayData['do-now']);
        this.renderTasks('schedule', dayData['schedule']);
        this.renderTasks('delegate', dayData['delegate']);
        this.renderTasks('eliminate', dayData['eliminate']);
    }

    renderTasks(quadrant, tasks) {
        const container = this.getQuadrantContainer(quadrant);
        container.innerHTML = '';

        // Add drop zone event listeners to the quadrant container
        const quadrantElement = container.closest('.quadrant');
        this.setupDropZone(quadrantElement, quadrant);

        tasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task, quadrant, index);
            container.appendChild(taskElement);
        });
    }

    setupDropZone(quadrantElement, targetQuadrant) {
        // Remove existing listeners to avoid duplicates
        quadrantElement.removeEventListener('dragover', this.handleDragOver);
        quadrantElement.removeEventListener('dragenter', this.handleDragEnter);
        quadrantElement.removeEventListener('dragleave', this.handleDragLeave);
        quadrantElement.removeEventListener('drop', this.handleDrop);

        // Add drop zone event listeners
        quadrantElement.addEventListener('dragover', (e) => this.handleDragOver(e));
        quadrantElement.addEventListener('dragenter', (e) => this.handleDragEnter(e, targetQuadrant));
        quadrantElement.addEventListener('dragleave', (e) => this.handleDragLeave(e, targetQuadrant));
        quadrantElement.addEventListener('drop', (e) => this.handleDrop(e, targetQuadrant));
    }

    handleDragOver(e) {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e, targetQuadrant) {
        e.preventDefault();
        const quadrantElement = e.currentTarget;
        quadrantElement.classList.add('drag-over');
    }

    handleDragLeave(e, targetQuadrant) {
        e.preventDefault();
        const quadrantElement = e.currentTarget;

        // Only remove drag-over if we're actually leaving the quadrant (not entering a child)
        if (!quadrantElement.contains(e.relatedTarget)) {
            quadrantElement.classList.remove('drag-over');
        }
    }

    handleDrop(e, targetQuadrant) {
        e.preventDefault();

        const quadrantElement = e.currentTarget;
        quadrantElement.classList.remove('drag-over');

        try {
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const { sourceQuadrant, sourceIndex, task } = dragData;

            // Don't do anything if dropping in the same quadrant
            if (sourceQuadrant === targetQuadrant) {
                return;
            }

            // Move the task to the new quadrant
            this.moveTask(sourceQuadrant, sourceIndex, targetQuadrant, task);
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    createTaskElement(task, quadrant, index) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.draggable = true;

        // Store drag data
        taskItem.dataset.quadrant = quadrant;
        taskItem.dataset.index = index;
        taskItem.dataset.task = task;

        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.innerHTML = this.convertUrlsToLinks(task);

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        // Green checkbox for completion with confetti
        const completeButton = document.createElement('button');
        completeButton.className = 'task-complete';
        completeButton.innerHTML = '✓';
        completeButton.title = 'Complete task';
        completeButton.addEventListener('click', () => this.completeTask(quadrant, task));

        // Red X for deletion
        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-delete';
        deleteButton.textContent = '×';
        deleteButton.title = 'Delete task';
        deleteButton.addEventListener('click', () => this.deleteTask(quadrant, task));

        taskActions.appendChild(completeButton);
        taskActions.appendChild(deleteButton);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);

        // Add drag event listeners
        taskItem.addEventListener('dragstart', (e) => this.handleDragStart(e, quadrant, index, task));
        taskItem.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return taskItem;
    }

    handleDragStart(e, quadrant, index, task) {
        // Store the drag data
        e.dataTransfer.setData('text/plain', JSON.stringify({
            sourceQuadrant: quadrant,
            sourceIndex: index,
            task: task
        }));

        // Add dragging class for visual feedback
        e.target.classList.add('dragging');
        document.body.classList.add('dragging');
    }

    handleDragEnd(e) {
        // Remove dragging class
        e.target.classList.remove('dragging');
        document.body.classList.remove('dragging');

        // Remove drag-over classes from all quadrants
        document.querySelectorAll('.quadrant').forEach(quadrant => {
            quadrant.classList.remove('drag-over');
        });
    }

    getQuadrantContainer(quadrant) {
        switch (quadrant) {
            case 'do-now': return this.doNowTasks;
            case 'schedule': return this.scheduleTasks;
            case 'delegate': return this.delegateTasks;
            case 'eliminate': return this.eliminateTasks;
            default: return null;
        }
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        const quadrant = this.quadrantSelect.value;

        if (!taskText) {
            alert('Please enter a task description.');
            return;
        }

        const dateKey = this.getDateKey(this.currentDate);
        if (!this.data[dateKey]) {
            this.data[dateKey] = {
                'do-now': [],
                'schedule': [],
                'delegate': [],
                'eliminate': []
            };
        }

        this.data[dateKey][quadrant].push(taskText);
        this.saveData();
        this.loadTasksForCurrentDate();

        this.taskInput.value = '';
        this.taskInput.focus();
    }

    deleteTask(quadrant, task) {
        const dateKey = this.getDateKey(this.currentDate);
        if (this.data[dateKey] && this.data[dateKey][quadrant]) {
            const taskIndex = this.data[dateKey][quadrant].findIndex(t => t === task);
            if (taskIndex !== -1) {
                this.data[dateKey][quadrant].splice(taskIndex, 1);
                this.saveData();
                this.loadTasksForCurrentDate();
            }
        }
    }

    completeTask(quadrant, task) {
        // Show confetti animation
        this.showConfetti();

        // Add to completed this month list
        this.addToCompletedThisMonth(task);

        // Remove the task from the matrix
        this.deleteTask(quadrant, task);

        // Refresh the completed this month list
        this.loadCompletedThisMonth();
    }

    showConfetti() {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        // Create confetti pieces
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#a8e6cf', '#ff8a80', '#ba68c8', '#81c784', '#ffb74d', '#f06292', '#7986cb'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 4000);
    }

    moveTask(sourceQuadrant, sourceIndex, targetQuadrant, task) {
        const dateKey = this.getDateKey(this.currentDate);

        // Ensure the date entry exists
        if (!this.data[dateKey]) {
            this.data[dateKey] = {
                'do-now': [],
                'schedule': [],
                'delegate': [],
                'eliminate': []
            };
        }

        // Find and remove the task from source quadrant by content, not by stored index
        // This prevents issues with stale indices after multiple drag operations
        if (this.data[dateKey][sourceQuadrant]) {
            const taskIndex = this.data[dateKey][sourceQuadrant].findIndex(t => t === task);
            if (taskIndex !== -1) {
                this.data[dateKey][sourceQuadrant].splice(taskIndex, 1);
            }
        }

        // Add to target quadrant (only if it doesn't already exist there)
        if (!this.data[dateKey][targetQuadrant]) {
            this.data[dateKey][targetQuadrant] = [];
        }
        // Check if task already exists in target to prevent duplicates
        if (!this.data[dateKey][targetQuadrant].includes(task)) {
            this.data[dateKey][targetQuadrant].push(task);
        }

        // Save and refresh
        this.saveData();
        this.loadTasksForCurrentDate();
    }

    copyMatrix() {
        const dateKey = this.getDateKey(this.currentDate);
        this.copiedMatrix = this.data[dateKey] ? JSON.parse(JSON.stringify(this.data[dateKey])) : {
            'do-now': [],
            'schedule': [],
            'delegate': [],
            'eliminate': []
        };

        this.pasteMatrixButton.disabled = false;
        this.copyStatus.textContent = 'Matrix copied! Click "Paste Matrix to Today" to apply it to another day.';
        this.copyStatus.style.color = '#27ae60';

        setTimeout(() => {
            this.copyStatus.textContent = '';
        }, 3000);
    }

    pasteMatrix() {
        if (!this.copiedMatrix) return;

        const dateKey = this.getDateKey(this.currentDate);
        this.data[dateKey] = JSON.parse(JSON.stringify(this.copiedMatrix));
        this.saveData();
        this.loadTasksForCurrentDate();

        this.copyStatus.textContent = 'Matrix pasted successfully!';
        this.copyStatus.style.color = '#27ae60';

        setTimeout(() => {
            this.copyStatus.textContent = '';
        }, 3000);
    }

    // Export data as JSON (for backup purposes)
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `eisenhower-matrix-data-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.dataStatus.textContent = 'Data exported successfully!';
        this.dataStatus.style.color = '#27ae60';
        setTimeout(() => {
            this.dataStatus.textContent = '';
        }, 3000);
    }

    // Import data from JSON (for restore purposes)
    importData(jsonData) {
        try {
            this.data = JSON.parse(jsonData);
            this.saveData();
            this.loadTasksForCurrentDate();
            this.dataStatus.textContent = 'Data imported successfully!';
            this.dataStatus.style.color = '#27ae60';
            setTimeout(() => {
                this.dataStatus.textContent = '';
            }, 3000);
        } catch (e) {
            this.dataStatus.textContent = 'Invalid JSON data. Please check your file.';
            this.dataStatus.style.color = '#e74c3c';
            setTimeout(() => {
                this.dataStatus.textContent = '';
            }, 5000);
        }
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.importData(e.target.result);
        };
        reader.readAsText(file);

        // Reset the input so the same file can be selected again
        event.target.value = '';
    }
    // Check if a day has any tasks in active quadrants
    isDayEmpty(dayData) {
        const activeQuadrants = ['do-now', 'schedule', 'delegate', 'eliminate'];
        return activeQuadrants.every(quadrant => !dayData[quadrant] || dayData[quadrant].length === 0);
    }

    // Auto-copy tasks from the most recent non-blank day within 7 days
    autoCopyTasks() {
        const dateKey = this.getDateKey(this.currentDate);

        // Check if current day already has tasks
        const currentDayData = this.data[dateKey];
        if (currentDayData && !this.isDayEmpty(currentDayData)) {
            this.showCopyStatus('Current day already has tasks. Clear them first to auto-copy.', 'orange');
            return;
        }

        // Find the most recent non-blank day within 7 days
        const sourceDateKey = this.findRecentNonBlankDay(7);

        if (!sourceDateKey) {
            this.showCopyStatus('No tasks found in the last 7 days.', 'orange');
            return;
        }

        // Copy tasks from the source day
        const sourceDayData = this.data[sourceDateKey];
        const targetDayData = this.copyTasksFromSource(sourceDayData, dateKey);

        // Refresh the display
        this.loadTasksForCurrentDate();

        // Show notification about the copy
        this.showAutoCopyNotification(sourceDateKey);
        this.showCopyStatus('Tasks copied successfully!', 'green');
    }

    // Find the most recent non-blank day within the specified number of days
    findRecentNonBlankDay(maxDaysBack = 7) {
        const currentDate = new Date(this.currentDate);

        // Check each day going backwards
        for (let daysBack = 1; daysBack <= maxDaysBack; daysBack++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() - daysBack);
            const checkDateKey = this.getDateKey(checkDate);

            if (this.data[checkDateKey] && !this.isDayEmpty(this.data[checkDateKey])) {
                return checkDateKey;
            }
        }

        return null; // No non-blank day found
    }

    // Copy tasks from source day to target date
    copyTasksFromSource(sourceDayData, targetDateKey) {
        const targetDayData = {
            'do-now': [...(sourceDayData['do-now'] || [])],
            'schedule': [...(sourceDayData['schedule'] || [])],
            'delegate': [...(sourceDayData['delegate'] || [])],
            'eliminate': [...(sourceDayData['eliminate'] || [])]
        };

        // Save the copied data
        this.data[targetDateKey] = targetDayData;
        this.saveData();

        return targetDayData;
    }

    // Show notification about auto-copy
    showAutoCopyNotification(sourceDateKey) {
        // Parse the source date for display
        const sourceDate = new Date(sourceDateKey + 'T00:00:00');
        const dayName = sourceDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = sourceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Show notification
        const notification = document.createElement('div');
        notification.className = 'auto-copy-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📋</span>
                <span>Tasks auto-copied from ${dayName}, ${dateStr}</span>
                <button class="notification-close">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Show copy status message
    showCopyStatus(message, color = 'green') {
        this.copyStatus.textContent = message;
        this.copyStatus.style.color = color;

        // Clear the message after 3 seconds
        setTimeout(() => {
            this.copyStatus.textContent = '';
        }, 3000);
    }

    // Add completed task to this month's list
    addToCompletedThisMonth(task) {
        // Initialize completedThisMonth array if it doesn't exist
        if (!this.data.completedThisMonth) {
            this.data.completedThisMonth = [];
        }

        // Create completed task entry with timestamp
        const completedEntry = {
            task: task,
            completedDate: new Date().toISOString()
        };

        // Add to the beginning of the array (most recent first)
        this.data.completedThisMonth.unshift(completedEntry);

        // Filter to only keep tasks from this month
        this.cleanupCompletedThisMonth();

        // Save the data
        this.saveData();
    }

    // Remove tasks older than the first of the current month
    cleanupCompletedThisMonth() {
        if (!this.data.completedThisMonth) {
            return;
        }

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter to keep only tasks completed this month
        this.data.completedThisMonth = this.data.completedThisMonth.filter(entry => {
            const completedDate = new Date(entry.completedDate);
            return completedDate >= firstOfMonth;
        });
    }

    // Load and display completed tasks for this month
    loadCompletedThisMonth() {
        // Cleanup old tasks first
        this.cleanupCompletedThisMonth();

        const completedTasks = this.data.completedThisMonth || [];

        // Hide section if no completed tasks
        if (completedTasks.length === 0) {
            this.completedThisMonthSection.classList.add('hidden');
            return;
        }

        // Show section and render tasks
        this.completedThisMonthSection.classList.remove('hidden');
        this.completedThisMonthList.innerHTML = '';

        completedTasks.forEach(entry => {
            const taskElement = this.createCompletedMonthElement(entry);
            this.completedThisMonthList.appendChild(taskElement);
        });
    }

    // Create DOM element for completed month task
    createCompletedMonthElement(entry) {
        const taskItem = document.createElement('div');
        taskItem.className = 'completed-month-item';

        const taskText = document.createElement('div');
        taskText.className = 'completed-month-task';
        taskText.innerHTML = this.convertUrlsToLinks(entry.task);

        const taskDate = document.createElement('div');
        taskDate.className = 'completed-month-date';
        const completedDate = new Date(entry.completedDate);
        taskDate.textContent = completedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        taskItem.appendChild(taskText);
        taskItem.appendChild(taskDate);

        return taskItem;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EisenhowerMatrix();
});
