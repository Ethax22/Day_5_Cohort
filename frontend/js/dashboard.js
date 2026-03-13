/* ============================================
   DASHBOARD - Project Management & UI Logic
   ============================================ */

let allProjects = [];
let ownedProjects = [];
let collaboratedProjects = [];

/* ============================================
   DOM Elements
   ============================================ */

const elements = {
    // User elements
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    upgradeBtn: document.querySelector('.btn-upgrade'),

    // Project elements
    ownedProjectsGrid: document.getElementById('ownedProjects'),
    collaboratedProjectsGrid: document.getElementById('collaboratedProjects'),
    createProjectBtn: document.getElementById('createProjectBtn'),

    // Modal elements
    createProjectModal: document.getElementById('createProjectModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    createProjectForm: document.getElementById('createProjectForm'),

    // Form inputs
    projectNameInput: document.getElementById('projectName'),
    projectDescriptionInput: document.getElementById('projectDescription'),

    // Templates
    projectCardTemplate: document.getElementById('projectCardTemplate'),
};

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the dashboard
    initializeEventListeners();
    updateUserUI();
    await loadProjects();
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // User actions
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.upgradeBtn.addEventListener('click', handleUpgrade);

    // Project creation
    elements.createProjectBtn.addEventListener('click', openCreateProjectModal);
    elements.closeModalBtn.addEventListener('click', closeCreateProjectModal);
    elements.cancelBtn.addEventListener('click', closeCreateProjectModal);
    elements.modalOverlay.addEventListener('click', closeCreateProjectModal);
    elements.createProjectForm.addEventListener('submit', handleCreateProject);
}

/* ============================================
   USER UI UPDATES
   ============================================ */

/**
 * Update user interface with current user data
 */
function updateUserUI() {
    const user = auth.getCurrentUser();

    if (user) {
        elements.userName.textContent = user.name || 'User';

        // Set avatar with user initial
        if (user.name) {
            elements.userAvatar.textContent = user.name.charAt(0).toUpperCase();
            elements.userAvatar.style.display = 'none'; // Hide image, use text instead
        }

        // Update upgrade button based on premium status
        if (auth.isPremium()) {
            elements.upgradeBtn.style.display = 'none';
        }
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

/**
 * Handle upgrade to premium
 */
function handleUpgrade() {
    alert('Premium upgrade feature coming soon!');
    // TODO: Implement Razorpay payment integration
}

/* ============================================
   PROJECT OPERATIONS
   ============================================ */

/**
 * Load all projects from API
 */
async function loadProjects() {
    try {
        showLoading();
        const response = await projectAPI.getAll();
        allProjects = response.projects || [];

        // Separate owned and collaborated projects
        const userId = auth.getCurrentUser().id;
        ownedProjects = allProjects.filter((p) => p.owner_id === userId);
        collaboratedProjects = allProjects.filter((p) => p.owner_id !== userId);

        renderProjects();
    } catch (error) {
        console.error('Failed to load projects:', error);
        showError('Failed to load projects. Please try again.');
    }
}

/**
 * Render projects in the DOM
 */
function renderProjects() {
    renderOwnedProjects();
    renderCollaboratedProjects();
}

/**
 * Render owned projects
 */
function renderOwnedProjects() {
    elements.ownedProjectsGrid.innerHTML = '';

    if (ownedProjects.length === 0) {
        elements.ownedProjectsGrid.innerHTML = `
            <div class="project-card-empty">
                <p>No owned projects yet. Create one to get started!</p>
            </div>
        `;
        return;
    }

    ownedProjects.forEach((project) => {
        const projectCard = createProjectCard(project);
        elements.ownedProjectsGrid.appendChild(projectCard);
    });
}

/**
 * Render collaborated projects
 */
function renderCollaboratedProjects() {
    elements.collaboratedProjectsGrid.innerHTML = '';

    if (collaboratedProjects.length === 0) {
        elements.collaboratedProjectsGrid.innerHTML = `
            <div class="project-card-empty">
                <p>You haven't been invited to any projects yet.</p>
            </div>
        `;
        return;
    }

    collaboratedProjects.forEach((project) => {
        const projectCard = createProjectCard(project);
        elements.collaboratedProjectsGrid.appendChild(projectCard);
    });
}

/**
 * Create a project card element from template
 */
function createProjectCard(project) {
    const template = elements.projectCardTemplate.content.cloneNode(true);

    // Set project details
    template.querySelector('.project-name').textContent = project.name;
    template.querySelector('.project-description').textContent =
        project.description || 'No description provided';

    // Set date
    const date = new Date(project.created_at);
    template.querySelector('.project-date').textContent = `Created ${date.toLocaleDateString()}`;
    template.querySelector('.project-date').setAttribute('data-date', project.created_at);

    // Set stats (these would come from actual data)
    template.querySelector('[data-type="openTasks"]').textContent = project.openTasks || 0;
    template.querySelector('[data-type="collaborators"]').textContent =
        project.collaboratorCount || 0;

    // Add collaborator avatars
    const avatarsContainer = template.querySelector('.collaborators-avatars');
    if (project.collaborators && project.collaborators.length > 0) {
        project.collaborators.slice(0, 3).forEach((collab) => {
            const avatar = document.createElement('div');
            avatar.className = 'collaborator-avatar';
            avatar.textContent = collab.name.charAt(0).toUpperCase();
            avatar.title = collab.name;
            avatarsContainer.appendChild(avatar);
        });

        if (project.collaborators.length > 3) {
            const moreAvatar = document.createElement('div');
            moreAvatar.className = 'collaborator-avatar';
            moreAvatar.textContent = `+${project.collaborators.length - 3}`;
            moreAvatar.title = `${project.collaborators.length - 3} more collaborators`;
            avatarsContainer.appendChild(moreAvatar);
        }
    }

    // Add event listeners
    const card = template.querySelector('.project-card');
    card.addEventListener('click', (e) => handleOpenProject(e, project));

    const menuBtn = template.querySelector('.btn-menu');
    const dropdown = template.querySelector('.dropdown-menu');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(dropdown);
    });

    const openOption = template.querySelector('.open-project');
    const editOption = template.querySelector('.edit-project');
    const deleteOption = template.querySelector('.delete-project');

    openOption.addEventListener('click', (e) => {
        e.preventDefault();
        handleOpenProject(e, project);
    });

    editOption.addEventListener('click', (e) => {
        e.preventDefault();
        handleEditProject(e, project);
    });

    deleteOption.addEventListener('click', (e) => {
        e.preventDefault();
        handleDeleteProject(e, project);
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-menu')) {
            dropdown.classList.add('hidden');
        }
    });

    return template;
}

/**
 * Toggle dropdown menu
 */
function toggleDropdown(dropdown) {
    dropdown.classList.toggle('hidden');
}

/**
 * Handle opening a project
 */
function handleOpenProject(event, project) {
    event.stopPropagation();
    // TODO: Navigate to project workspace
    console.log('Opening project:', project);
    window.location.href = `/project.html?id=${project.id}`;
}

/**
 * Handle editing a project
 */
function handleEditProject(event, project) {
    event.stopPropagation();
    console.log('Editing project:', project);
    // TODO: Open edit modal
    alert('Edit project feature coming soon');
}

/**
 * Handle deleting a project
 */
async function handleDeleteProject(event, project) {
    event.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
        return;
    }

    try {
        showLoading();
        await projectAPI.delete(project.id);
        await loadProjects();
        showSuccess('Project deleted successfully');
    } catch (error) {
        console.error('Failed to delete project:', error);
        showError('Failed to delete project. Please try again.');
    }
}

/* ============================================
   CREATE PROJECT MODAL
   ============================================ */

/**
 * Open create project modal
 */
function openCreateProjectModal() {
    elements.createProjectModal.classList.remove('hidden');
    elements.projectNameInput.focus();
}

/**
 * Close create project modal
 */
function closeCreateProjectModal(event) {
    if (event && event.target !== elements.modalOverlay && event.target !== elements.closeModalBtn && event.target !== elements.cancelBtn) {
        return;
    }
    elements.createProjectModal.classList.add('hidden');
    elements.createProjectForm.reset();
}

/**
 * Handle create project form submission
 */
async function handleCreateProject(event) {
    event.preventDefault();

    const name = elements.projectNameInput.value.trim();
    const description = elements.projectDescriptionInput.value.trim();

    if (!name) {
        showError('Project name is required');
        return;
    }

    try {
        showLoading();
        const response = await projectAPI.create(name, description);

        closeCreateProjectModal();
        elements.createProjectForm.reset();

        await loadProjects();
        showSuccess(`Project "${name}" created successfully!`);
    } catch (error) {
        console.error('Failed to create project:', error);
        showError(error.message || 'Failed to create project. Please try again.');
    }
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Show loading state
 */
function showLoading() {
    // TODO: Implement loading indicator
    console.log('Loading...');
}

/**
 * Show success notification
 */
function showSuccess(message) {
    console.log('Success:', message);
    // TODO: Implement toast notification
    alert(message);
}

/**
 * Show error notification
 */
function showError(message) {
    console.error('Error:', message);
    // TODO: Implement toast notification
    alert('Error: ' + message);
}
