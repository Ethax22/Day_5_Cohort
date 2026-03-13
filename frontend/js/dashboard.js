

let allProjects = [];
let ownedProjects = [];
let collaboratedProjects = [];



const elements = {
    
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    upgradeBtn: document.querySelector('.btn-upgrade'),

    
    ownedProjectsGrid: document.getElementById('ownedProjects'),
    collaboratedProjectsGrid: document.getElementById('collaboratedProjects'),
    createProjectBtn: document.getElementById('createProjectBtn'),

    
    createProjectModal: document.getElementById('createProjectModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    createProjectForm: document.getElementById('createProjectForm'),

    
    projectNameInput: document.getElementById('projectName'),
    projectDescriptionInput: document.getElementById('projectDescription'),

    
    projectCardTemplate: document.getElementById('projectCardTemplate'),
};



document.addEventListener('DOMContentLoaded', async () => {
    // Auth check is handled by auth.js constructor
    initializeEventListeners();
    updateUserUI();
    await loadProjects();
});


function initializeEventListeners() {
    
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.upgradeBtn.addEventListener('click', handleUpgrade);

    
    elements.createProjectBtn.addEventListener('click', openCreateProjectModal);
    elements.closeModalBtn.addEventListener('click', closeCreateProjectModal);
    elements.cancelBtn.addEventListener('click', closeCreateProjectModal);
    elements.modalOverlay.addEventListener('click', closeCreateProjectModal);
    elements.createProjectForm.addEventListener('submit', handleCreateProject);
}




function updateUserUI() {
    const user = auth.getCurrentUser();

    if (user) {
        elements.userName.textContent = user.name || 'User';

        
        if (user.name) {
            elements.userAvatar.style.display = 'none'; // Background avatar
            const initialsAvatar = document.createElement('div');
            initialsAvatar.className = 'avatar-initials';
            initialsAvatar.textContent = user.name.charAt(0).toUpperCase();
            elements.userAvatar.parentNode.insertBefore(initialsAvatar, elements.userAvatar);
        }

        
        if (auth.isPremium()) {
            elements.upgradeBtn.style.display = 'none';
        }
    }
}


function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}


async function handleUpgrade() {
    try {
        const order = await paymentAPI.createOrder('premium');
        const user = auth.getCurrentUser();

        const options = {
            key: "rzp_test_SQbXi6hCuzCuDO", 
            amount: order.amount,
            currency: order.currency,
            name: "DevCollab Premium",
            description: "Upgrade to Premium Plan",
            order_id: order.id,
            handler: async function (response) {
                try {
                    showLoading();
                    const verification = await paymentAPI.verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verification.success) {
                        
                        user.plan = 'premium';
                        auth.setUser(user);
                        updateUserUI();
                        showSuccess('Welcome to Premium! Your account has been upgraded.');
                    }
                } catch (error) {
                    console.error('Payment verification failed:', error);
                    showError('Payment verification failed. Please contact support.');
                }
            },
            prefill: {
                name: user.name,
                email: user.email
            },
            theme: {
                color: "#6366f1"
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Failed to initiate upgrade:', error);
        showError('Failed to initiate upgrade. Please try again.');
    }
}




async function loadProjects() {
    try {
        showLoading();
        const response = await projectAPI.getAll();
        
        
        allProjects = Array.isArray(response) ? response : (response.projects || []);

        
        const userId = auth.getCurrentUser()?.id;
        if (!userId) {
            console.warn('No user ID found, auth handles redirection');
            return;
        }

        ownedProjects = allProjects.filter((p) => p.owner_id === userId);
        collaboratedProjects = allProjects.filter((p) => p.owner_id !== userId);

        renderProjects();
    } catch (error) {
        console.error('Failed to load projects:', error);
        
        if (error.message && error.message.includes('authorized')) {
            auth.logout();
        } else {
            showError('Failed to load projects. Please try again.');
        }
    }
}


function renderProjects() {
    renderOwnedProjects();
    renderCollaboratedProjects();
}


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


function createProjectCard(project) {
    const template = elements.projectCardTemplate.content.cloneNode(true);

    
    template.querySelector('.project-name').textContent = project.name;
    template.querySelector('.project-description').textContent =
        project.description || 'No description provided';

    
    const date = new Date(project.created_at);
    template.querySelector('.project-date').textContent = `Created ${date.toLocaleDateString()}`;
    template.querySelector('.project-date').setAttribute('data-date', project.created_at);

    
    template.querySelector('[data-type="openTasks"]').textContent = project.openTasks || 0;
    template.querySelector('[data-type="collaborators"]').textContent =
        project.collaboratorCount || 0;

    
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

    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-menu')) {
            dropdown.classList.add('hidden');
        }
    });

    return template;
}


function toggleDropdown(dropdown) {
    dropdown.classList.toggle('hidden');
}


function handleOpenProject(event, project) {
    event.stopPropagation();
    
    console.log('Opening project:', project);
    window.location.href = `project.html?id=${project.id}`;
}


function handleEditProject(event, project) {
    event.stopPropagation();
    console.log('Editing project:', project);
    
    alert('Edit project feature coming soon');
}


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




function openCreateProjectModal() {
    elements.createProjectModal.classList.remove('hidden');
    elements.projectNameInput.focus();
}


function closeCreateProjectModal(event) {
    if (event && event.target !== elements.modalOverlay && event.target !== elements.closeModalBtn && event.target !== elements.cancelBtn) {
        return;
    }
    elements.createProjectModal.classList.add('hidden');
    elements.createProjectForm.reset();
}


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




function showLoading() {
    
    console.log('Loading...');
}


function showSuccess(message) {
    console.log('Success:', message);
    
    alert(message);
}


function showError(message) {
    console.error('Error:', message);
    
    alert('Error: ' + message);
}
