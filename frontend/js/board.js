/* ============================================
   PROJECT WORKSPACE - BOARD LOGIC
   ============================================ */

let currentProject = null;
let tasks = [];
let messages = [];
let collaborators = [];
let activeUsers = [];

/* ============================================
   DOM ELEMENTS
   ============================================ */

const boardElements = {
    // Sidebar
    navItems: document.querySelectorAll('.nav-item'),
    activeUsersContainer: document.getElementById('activeUsers'),

    // Navbar
    projectTitle: document.getElementById('projectTitle'),
    backBtn: document.querySelector('.back-btn'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Board
    kanbanBoard: document.querySelector('.kanban-board'),
    tasksContainers: document.querySelectorAll('.tasks-container'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    filterBtn: document.getElementById('filterBtn'),

    // Chat
    messagesContainer: document.getElementById('messagesContainer'),
    chatForm: document.getElementById('chatForm'),
    messageInput: document.getElementById('messageInput'),
    codeSnippetBtn: document.getElementById('codeSnippetBtn'),
    codeSnippetModal: document.getElementById('codeSnippetModal'),
    codeSnippetForm: document.getElementById('codeSnippetForm'),
    closeSnippetModal: document.getElementById('closeSnippetModal'),
    snippetOverlay: document.getElementById('snippetOverlay'),

    // Settings
    settingsProjectName: document.getElementById('settingsProjectName'),
    settingsDescription: document.getElementById('settingsDescription'),
    collaboratorEmail: document.getElementById('collaboratorEmail'),
    addCollaboratorBtn: document.getElementById('addCollaboratorBtn'),
    collaboratorsList: document.getElementById('collaboratorsList'),
    deleteProjectBtn: document.getElementById('deleteProjectBtn'),

    // Templates
    taskCardTemplate: document.getElementById('taskCardTemplate'),
    messageTemplate: document.getElementById('messageTemplate'),
    collaboratorTemplate: document.getElementById('collaboratorTemplate'),
};

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
    // Get project ID from URL
    const projectId = new URLSearchParams(window.location.search).get('id');

    if (!projectId) {
        alert('No project selected');
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        initializeEventListeners();
        updateUserUI();
        await loadProject(projectId);
        await loadTasks(projectId);
        await loadMessages(projectId);
        await loadCollaborators(projectId);
        connectWebSocket(projectId);
    } catch (error) {
        console.error('Failed to initialize workspace:', error);
        alert('Failed to load project. Redirecting...');
        window.location.href = '/dashboard.html';
    }
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Tab switching
    boardElements.navItems.forEach((item) => {
        item.addEventListener('click', handleTabSwitch);
    });

    // Board actions
    boardElements.addTaskBtn.addEventListener('click', openAddTaskModal);
    boardElements.filterBtn.addEventListener('click', handleFilter);

    // Drag and drop
    boardElements.tasksContainers.forEach((container) => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragleave', handleDragLeave);
    });

    // Chat
    boardElements.chatForm.addEventListener('submit', handleChatSubmit);
    boardElements.codeSnippetBtn.addEventListener('click', openCodeSnippetModal);
    boardElements.closeSnippetModal.addEventListener('click', closeCodeSnippetModal);
    boardElements.snippetOverlay.addEventListener('click', closeCodeSnippetModal);
    boardElements.codeSnippetForm.addEventListener('submit', handleCodeSnippetSubmit);

    // Settings
    boardElements.addCollaboratorBtn.addEventListener('click', handleAddCollaborator);
    boardElements.deleteProjectBtn.addEventListener('click', handleDeleteProject);

    // User
    boardElements.backBtn.addEventListener('click', () => {
        window.location.href = '/dashboard.html';
    });
    boardElements.logoutBtn.addEventListener('click', handleLogout);
}

/**
 * Update user UI
 */
function updateUserUI() {
    const user = auth.getCurrentUser();
    if (user) {
        boardElements.userName.textContent = user.name || 'User';
        if (user.name) {
            boardElements.userAvatar.textContent = user.name.charAt(0).toUpperCase();
            boardElements.userAvatar.style.display = 'none';
        }
    }
}

/* ============================================
   TAB MANAGEMENT
   ============================================ */

/**
 * Handle tab switching
 */
function handleTabSwitch(e) {
    const targetTab = e.currentTarget.getAttribute('data-tab');

    // Update nav items
    boardElements.navItems.forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-tab') === targetTab);
    });

    // Update tab contents
    document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.toggle('active', content.id === targetTab);
    });

    // Scroll chat to bottom if switching to chat
    if (targetTab === 'chat') {
        setTimeout(() => {
            boardElements.messagesContainer.scrollTop = boardElements.messagesContainer.scrollHeight;
        }, 0);
    }
}

/* ============================================
   PROJECT MANAGEMENT
   ============================================ */

/**
 * Load project data
 */
async function loadProject(projectId) {
    try {
        const response = await projectAPI.getById(projectId);
        currentProject = response.project;
        boardElements.projectTitle.textContent = currentProject.name;
        boardElements.settingsProjectName.value = currentProject.name;
        boardElements.settingsDescription.value = currentProject.description || '';
    } catch (error) {
        console.error('Failed to load project:', error);
        throw error;
    }
}

/**
 * Load project tasks
 */
async function loadTasks(projectId) {
    try {
        const response = await taskAPI.getAll(projectId);
        tasks = response.tasks || [];
        renderTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
}

/**
 * Render tasks on the board
 */
function renderTasks() {
    // Clear all containers
    boardElements.tasksContainers.forEach((container) => {
        container.innerHTML = '';
    });

    // Group tasks by status
    const tasksByStatus = {
        todo: [],
        'in-progress': [],
        review: [],
        done: [],
    };

    tasks.forEach((task) => {
        if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
        }
    });

    // Render tasks in each column
    Object.keys(tasksByStatus).forEach((status) => {
        const container = document.querySelector(`.tasks-container[data-status="${status}"]`);
        const statusTasks = tasksByStatus[status];

        // Update task count
        const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
        column.querySelector('.task-count').textContent = statusTasks.length;

        // Render task cards
        statusTasks.forEach((task) => {
            const taskCard = createTaskCard(task);
            container.appendChild(taskCard);
        });

        // Show empty state if no tasks
        if (statusTasks.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-column-state';
            emptyDiv.textContent = 'No tasks';
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.color = 'var(--color-text-muted)';
            emptyDiv.style.padding = 'var(--spacing-md)';
        }
    });
}

/**
 * Create a task card element
 */
function createTaskCard(task) {
    const template = boardElements.taskCardTemplate.content.cloneNode(true);

    template.querySelector('.task-title').textContent = task.title;
    template.querySelector('.task-description').textContent = task.description || 'No description';

    // Set assignee
    if (task.assignee) {
        template.querySelector('.assignee-avatar').style.backgroundColor = task.assignee.color || '#6366F1';
        template.querySelector('.assignee-name').textContent = task.assignee.name.substring(0, 10);
    }

    // Set priority
    const priorityElement = template.querySelector('.task-priority');
    priorityElement.className = `task-priority ${task.priority || 'low'}`;
    priorityElement.textContent = (task.priority || 'low').toUpperCase();

    // Add drag functionality
    const card = template.querySelector('.task-card');
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-task-id', task.id);

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('click', () => openTaskDetails(task));

    return template;
}

/* ============================================
   DRAG AND DROP
   ============================================ */

let draggedTaskId = null;

/**
 * Handle drag start
 */
function handleDragStart(e) {
    draggedTaskId = e.target.getAttribute('data-task-id');
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    boardElements.tasksContainers.forEach((container) => {
        container.classList.remove('drag-over');
    });
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
        e.currentTarget.classList.remove('drag-over');
    }
}

/**
 * Handle drop
 */
async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const newStatus = e.currentTarget.getAttribute('data-status');

    if (draggedTaskId) {
        try {
            await updateTaskStatus(draggedTaskId, newStatus);
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    }

    draggedTaskId = null;
}

/**
 * Update task status
 */
async function updateTaskStatus(taskId, newStatus) {
    try {
        await taskAPI.updateStatus(currentProject.id, taskId, newStatus);

        // Update local tasks array
        const task = tasks.find((t) => t.id === parseInt(taskId));
        if (task) {
            task.status = newStatus;
            renderTasks();

            // Notify via WebSocket
            if (socket && socket.connected) {
                socket.emit('task:update', {
                    taskId,
                    newStatus,
                    projectId: currentProject.id,
                });
            }
        }
    } catch (error) {
        console.error('Failed to update task status:', error);
        alert('Failed to move task');
    }
}

/* ============================================
   TASK MANAGEMENT
   ============================================ */

/**
 * Open add task modal
 */
function openAddTaskModal() {
    console.log('Add task modal - coming soon');
    alert('Add task feature coming soon');
}

/**
 * Open task details
 */
function openTaskDetails(task) {
    console.log('Task details:', task);
    alert(`Task: ${task.title}\n\nFull details view coming soon`);
}

/**
 * Handle filter
 */
function handleFilter() {
    console.log('Filter - coming soon');
    alert('Filter feature coming soon');
}

/* ============================================
   CHAT/MESSAGES
   ============================================ */

/**
 * Load messages from API
 */
async function loadMessages(projectId) {
    try {
        const response = await messageAPI.getAll(projectId);
        messages = response.messages || [];
        renderMessages();
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

/**
 * Render messages
 */
function renderMessages() {
    boardElements.messagesContainer.innerHTML = '';
    const currentUser = auth.getCurrentUser();

    if (messages.length === 0) {
        boardElements.messagesContainer.innerHTML = `
            <div class="empty-column-state" style="margin: auto; text-align: center; color: var(--color-text-muted);">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    messages.forEach((message) => {
        const messageEl = createMessageElement(message, currentUser.id);
        boardElements.messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
    boardElements.messagesContainer.scrollTop = boardElements.messagesContainer.scrollHeight;
}

/**
 * Create message element
 */
function createMessageElement(message, currentUserId) {
    const template = boardElements.messageTemplate.content.cloneNode(true);

    const messageDiv = template.querySelector('.message');
    if (message.sender_id === currentUserId) {
        messageDiv.classList.add('own');
    }

    template.querySelector('.message-avatar img').src = message.sender?.avatar || 'public/default-avatar.svg';
    template.querySelector('.message-author').textContent = message.sender?.name || 'Unknown';

    const date = new Date(message.created_at);
    template.querySelector('.message-time').textContent = date.toLocaleTimeString();

    // Handle different message types
    if (message.type === 'code') {
        const codeHtml = `
            <div class="message-code">
                <div class="message-code-language">${message.language || 'Code'}</div>
                <pre><code>${escapeHtml(message.content)}</code></pre>
            </div>
        `;
        template.querySelector('.message-body').innerHTML = codeHtml;
    } else {
        template.querySelector('.message-body').textContent = message.content;
    }

    return template;
}

/**
 * Handle chat form submit
 */
async function handleChatSubmit(e) {
    e.preventDefault();

    const content = boardElements.messageInput.value.trim();

    if (!content) {
        return;
    }

    try {
        const response = await messageAPI.create(currentProject.id, content);
        messages.push(response.message);
        renderMessages();
        boardElements.messageInput.value = '';

        // Emit via WebSocket
        if (socket && socket.connected) {
            socket.emit('message:send', {
                projectId: currentProject.id,
                content,
                type: 'text',
            });
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message');
    }
}

/**
 * Open code snippet modal
 */
function openCodeSnippetModal(e) {
    e.preventDefault();
    boardElements.codeSnippetModal.classList.remove('hidden');
    document.getElementById('codeLanguage').focus();
}

/**
 * Close code snippet modal
 */
function closeCodeSnippetModal(e) {
    if (e && e.target !== boardElements.snippetOverlay && e.target !== boardElements.closeSnippetModal) {
        return;
    }
    boardElements.codeSnippetModal.classList.add('hidden');
    boardElements.codeSnippetForm.reset();
}

/**
 * Handle code snippet submit
 */
async function handleCodeSnippetSubmit(e) {
    e.preventDefault();

    const language = document.getElementById('codeLanguage').value;
    const code = document.getElementById('codeContent').value.trim();

    if (!code) {
        return;
    }

    try {
        const response = await messageAPI.create(currentProject.id, code, {
            type: 'code',
            language,
        });

        messages.push(response.message);
        renderMessages();
        closeCodeSnippetModal({ target: boardElements.closeSnippetModal });

        // Emit via WebSocket
        if (socket && socket.connected) {
            socket.emit('message:send', {
                projectId: currentProject.id,
                content: code,
                type: 'code',
                language,
            });
        }
    } catch (error) {
        console.error('Failed to send code snippet:', error);
        alert('Failed to send code snippet');
    }
}

/* ============================================
   COLLABORATORS & SETTINGS
   ============================================ */

/**
 * Load collaborators
 */
async function loadCollaborators(projectId) {
    try {
        const response = await projectAPI.getCollaborators(projectId);
        collaborators = response.collaborators || [];
        renderCollaborators();
    } catch (error) {
        console.error('Failed to load collaborators:', error);
    }
}

/**
 * Render collaborators list
 */
function renderCollaborators() {
    boardElements.collaboratorsList.innerHTML = '';

    collaborators.forEach((collab) => {
        const template = boardElements.collaboratorTemplate.content.cloneNode(true);

        template.querySelector('.collaborator-avatar').style.backgroundColor = collab.color || '#6366F1';
        template.querySelector('.collaborator-name').textContent = collab.name;
        template.querySelector('.collaborator-email').textContent = collab.email;
        template.querySelector('.remove-collaborator-btn').setAttribute('data-user-id', collab.id);
        template.querySelector('.remove-collaborator-btn').addEventListener('click', () => {
            handleRemoveCollaborator(collab.id);
        });

        boardElements.collaboratorsList.appendChild(template);
    });
}

/**
 * Handle add collaborator
 */
async function handleAddCollaborator() {
    const email = boardElements.collaboratorEmail.value.trim();

    if (!email) {
        alert('Please enter an email address');
        return;
    }

    try {
        // TODO: Implement adding collaborator by email
        alert('Add collaborator feature coming soon');
    } catch (error) {
        console.error('Failed to add collaborator:', error);
        alert('Failed to add collaborator');
    }
}

/**
 * Handle remove collaborator
 */
async function handleRemoveCollaborator(userId) {
    if (!confirm('Are you sure you want to remove this collaborator?')) {
        return;
    }

    try {
        await projectAPI.removeCollaborator(currentProject.id, userId);
        await loadCollaborators(currentProject.id);
    } catch (error) {
        console.error('Failed to remove collaborator:', error);
        alert('Failed to remove collaborator');
    }
}

/**
 * Handle delete project
 */
async function handleDeleteProject() {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }

    if (!confirm('This is permanent. Type "DELETE" to confirm.')) {
        return;
    }

    try {
        await projectAPI.delete(currentProject.id);
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}

/* ============================================
   UTILITIES
   ============================================ */

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format time
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString();
}

/**
 * Update active users
 */
function updateActiveUsers(users) {
    activeUsers = users;
    boardElements.activeUsersContainer.innerHTML = '';

    users.slice(0, 5).forEach((user) => {
        const avatar = document.createElement('div');
        avatar.className = 'active-user-avatar';
        avatar.textContent = user.name.charAt(0).toUpperCase();
        avatar.title = user.name;
        boardElements.activeUsersContainer.appendChild(avatar);
    });

    if (users.length > 5) {
        const more = document.createElement('div');
        more.className = 'active-user-avatar';
        more.textContent = `+${users.length - 5}`;
        more.title = `${users.length - 5} more users online`;
        boardElements.activeUsersContainer.appendChild(more);
    }
}
