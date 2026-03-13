/* ============================================
   SOCKET.IO - REAL-TIME COMMUNICATION
   ============================================ */

let socket = null;

/**
 * Connect to WebSocket server
 */
function connectWebSocket(projectId) {
    // Initialize Socket.io connection
    socket = io('http://localhost:3000', {
        auth: {
            token: auth.getToken(),
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);

        // Join project room
        socket.emit('project:join', {
            projectId,
            userId: auth.getCurrentUser().id,
            userName: auth.getCurrentUser().name,
        });
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus(false);
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        updateConnectionStatus(false);
    });

    socket.on('reconnect_attempt', () => {
        console.log('Attempting to reconnect...');
    });

    // Room events
    socket.on('project:joined', (data) => {
        console.log('Joined project room:', data);
        updateConnectionStatus(true);
    });

    /* ============================================
       TASK EVENTS
       ============================================ */

    /**
     * Real-time task update
     */
    socket.on('task:updated', (data) => {
        console.log('Task updated:', data);

        const taskIndex = tasks.findIndex((t) => t.id === data.taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = data.newStatus;
            renderTasks();
        }
    });

    /**
     * New task created
     */
    socket.on('task:created', (data) => {
        console.log('New task created:', data);
        tasks.push(data.task);
        renderTasks();
    });

    /**
     * Task deleted
     */
    socket.on('task:deleted', (data) => {
        console.log('Task deleted:', data);
        tasks = tasks.filter((t) => t.id !== data.taskId);
        renderTasks();
    });

    /* ============================================
       MESSAGE EVENTS
       ============================================ */

    /**
     * New message received
     */
    socket.on('message:received', (data) => {
        console.log('New message received:', data);
        messages.push(data.message);
        renderMessages();
    });

    /**
     * Message deleted
     */
    socket.on('message:deleted', (data) => {
        console.log('Message deleted:', data);
        messages = messages.filter((m) => m.id !== data.messageId);
        renderMessages();
    });

    /* ============================================
       USER PRESENCE EVENTS
       ============================================ */

    /**
     * User joined project
     */
    socket.on('user:joined', (data) => {
        console.log('User joined:', data);
        const notification = `${data.userName} joined the project`;
        showNotification(notification, 'info');
        updateActiveUsers(data.activeUsers);
    });

    /**
     * User left project
     */
    socket.on('user:left', (data) => {
        console.log('User left:', data);
        const notification = `${data.userName} left the project`;
        showNotification(notification, 'info');
        updateActiveUsers(data.activeUsers);
    });

    /**
     * Active users list
     */
    socket.on('users:active', (data) => {
        console.log('Active users:', data);
        updateActiveUsers(data.users);
    });

    /**
     * User is typing
     */
    socket.on('user:typing', (data) => {
        console.log('User typing:', data);
        showTypingIndicator(data.userName);
    });

    /* ============================================
       COLLABORATOR EVENTS
       ============================================ */

    /**
     * Collaborator added
     */
    socket.on('collaborator:added', (data) => {
        console.log('Collaborator added:', data);
        collaborators.push(data.collaborator);
        renderCollaborators();
        showNotification(`${data.collaborator.name} was added as a collaborator`, 'success');
    });

    /**
     * Collaborator removed
     */
    socket.on('collaborator:removed', (data) => {
        console.log('Collaborator removed:', data);
        collaborators = collaborators.filter((c) => c.id !== data.collaboratorId);
        renderCollaborators();
        showNotification(`${data.collaboratorName} was removed from the project`, 'info');
    });

    /* ============================================
       PROJECT EVENTS
       ============================================ */

    /**
     * Project updated
     */
    socket.on('project:updated', (data) => {
        console.log('Project updated:', data);
        currentProject = { ...currentProject, ...data.project };
        document.getElementById('projectTitle').textContent = currentProject.name;
        showNotification('Project updated', 'success');
    });

    /**
     * Project deleted
     */
    socket.on('project:deleted', (data) => {
        console.log('Project deleted');
        alert('This project was deleted');
        window.location.href = '/dashboard.html';
    });

    /* ============================================
       ERROR EVENTS
       ============================================ */

    /**
     * Error from server
     */
    socket.on('error:occurred', (data) => {
        console.error('Server error:', data);
        showNotification(`Error: ${data.message}`, 'error');
    });
}

/**
 * Emit task update event
 */
function emitTaskUpdate(taskId, newStatus) {
    if (socket && socket.connected) {
        socket.emit('task:update', {
            taskId,
            newStatus,
            projectId: currentProject.id,
        });
    }
}

/**
 * Emit message event
 */
function emitMessage(projectId, content, type = 'text', language = null) {
    if (socket && socket.connected) {
        socket.emit('message:send', {
            projectId,
            content,
            type,
            language,
            timestamp: new Date(),
        });
    }
}

/**
 * Emit user typing event
 */
function emitUserTyping(projectId) {
    if (socket && socket.connected) {
        socket.emit('user:typing', {
            projectId,
            userId: auth.getCurrentUser().id,
        });
    }
}

/**
 * Emit leave project event
 */
function emitLeaveProject(projectId) {
    if (socket && socket.connected) {
        socket.emit('project:leave', {
            projectId,
            userId: auth.getCurrentUser().id,
        });
    }
}

/* ============================================
   CONNECTION STATUS
   ============================================ */

/**
 * Update connection status UI
 */
function updateConnectionStatus(isConnected) {
    const statusIndicator = document.querySelector('.connection-status');

    if (!statusIndicator) {
        return;
    }

    if (isConnected) {
        statusIndicator.className = 'connection-status connected';
        statusIndicator.textContent = 'Connected';
    } else {
        statusIndicator.className = 'connection-status disconnected';
        statusIndicator.textContent = 'Disconnected';
    }
}

/* ============================================
   NOTIFICATIONS
   ============================================ */

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${
            type === 'success'
                ? 'var(--color-accent-secondary)'
                : type === 'error'
                  ? 'var(--color-danger)'
                  : 'var(--color-accent-primary)'
        };
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Show typing indicator
 */
function showTypingIndicator(userName) {
    console.log(`${userName} is typing...`);
    // TODO: Implement typing indicator UI
}

/* ============================================
   CLEANUP
   ============================================ */

/**
 * Disconnect on page leave
 */
window.addEventListener('beforeunload', () => {
    if (currentProject && socket) {
        emitLeaveProject(currentProject.id);
        socket.disconnect();
    }
});

/**
 * Disconnect on tab/window close
 */
window.addEventListener('unload', () => {
    if (socket) {
        socket.disconnect();
    }
});
