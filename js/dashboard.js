/**
 * dashboard.js - Dashboard functionality for project management
 * WebCraft Website Creator System
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('webcraft_current_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set username in the header
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser;
    }
    
    // Load user projects
    loadProjects();
    
    // New Project Button
    const newProjectBtn = document.getElementById('btn-new-project');
    const createFirstBtn = document.getElementById('btn-create-first');
    const newProjectModal = document.getElementById('new-project-modal');
    const closeModalBtn = document.getElementById('close-project-modal');
    
    // Open new project modal
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            newProjectModal.style.display = 'flex';
        });
    }
    
    // "Create first project" button (shown when no projects exist)
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', () => {
            newProjectModal.style.display = 'flex';
        });
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            newProjectModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newProjectModal) {
            newProjectModal.style.display = 'none';
        }
    });
    
    // Handle new project form submission
    const newProjectForm = document.getElementById('new-project-form');
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectName = document.getElementById('project-name').value.trim();
            const editorType = document.querySelector('input[name="editor-type"]:checked').value;
            
            // Validate project name
            if (!projectName) {
                alert('Please enter a project name.');
                return;
            }
            
            // Create project ID (sanitized name for URL)
            const projectId = projectName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            // Check if project ID already exists
            const projects = Storage.getProjects();
            if (projects[projectId]) {
                alert('A project with a similar name already exists. Please choose a different name.');
                return;
            }
            
            // Create new project
            const newProject = {
                id: projectId,
                title: projectName,
                owner: currentUser,
                type: editorType,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                html: editorType === 'code' ? '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Website</title>\n</head>\n<body>\n  <h1>Welcome to my website!</h1>\n  <p>This is a new website created with WebCraft.</p>\n</body>\n</html>' : '',
                css: editorType === 'code' ? 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  line-height: 1.6;\n}\n\nh1 {\n  color: #3498db;\n}' : '',
                js: '',
                elements: editorType === 'visual' ? [
                    {
                        type: 'header',
                        content: 'Welcome to my website!',
                        properties: {
                            fontSize: '32',
                            textAlign: 'center',
                            color: '#3498db'
                        }
                    },
                    {
                        type: 'text',
                        content: 'This is a new website created with WebCraft.',
                        properties: {
                            fontSize: '16',
                            textAlign: 'center',
                            color: '#333333'
                        }
                    }
                ] : []
            };
            
            // Save project
            Storage.saveProject(projectId, newProject);
            
            // Close modal
            newProjectModal.style.display = 'none';
            
            // Reload projects
            loadProjects();
            
            // Redirect to the appropriate editor
            setTimeout(() => {
                if (editorType === 'code') {
                    window.location.href = `editor.html?project=${projectId}`;
                } else {
                    window.location.href = `visual-editor.html?project=${projectId}`;
                }
            }, 500);
        });
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('webcraft_current_user');
            window.location.href = 'index.html';
        });
    }
});

/**
 * Load and display user projects
 */
function loadProjects() {
    const currentUser = localStorage.getItem('webcraft_current_user');
    const projectList = document.getElementById('project-list');
    const emptyState = document.getElementById('empty-projects');
    
    if (!projectList) return;
    
    // Get projects for the current user
    const userProjects = Storage.getUserProjects(currentUser);
    
    // Clear existing projects (except empty state)
    const projectCards = projectList.querySelectorAll('.project-card');
    projectCards.forEach(card => card.remove());
    
    // Show/hide empty state
    if (userProjects.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        
        // Get project template
        const projectTemplate = document.getElementById('project-template');
        
        // Add each project
        userProjects.forEach(project => {
            // Clone template
            const projectCard = document.importNode(projectTemplate.content, true).querySelector('.project-card');
            
            // Set project details
            projectCard.querySelector('.project-title').textContent = project.title;
            
            // Format date
            const createdDate = new Date(project.createdAt);
            projectCard.querySelector('.project-date').textContent = `Created: ${createdDate.toLocaleDateString()}`;
            
            // Set project type
            projectCard.querySelector('.project-type').textContent = project.type === 'code' ? 'Code Editor' : 'Visual Editor';
            
            // Set edit button link
            const editBtn = projectCard.querySelector('.btn-edit');
            editBtn.href = project.type === 'code' ? `editor.html?project=${project.id}` : `visual-editor.html?project=${project.id}`;
            
            // Set view button link
            const viewBtn = projectCard.querySelector('.btn-view');
            viewBtn.href = `/websitebuilder/view.html?project=${project.id}`;
            viewBtn.target = '_blank'; // Open in new tab
            
            // Set delete button functionality
            const deleteBtn = projectCard.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
                    Storage.deleteProject(project.id);
                    loadProjects(); // Reload projects
                }
            });
            
            // Add to project list
            projectList.appendChild(projectCard);
        });
    }
}
