/**
 * storage.js - JSON data storage handling
 * WebCraft Website Creator System
 */

const Storage = {
    // Base path for the application
    basePath: '/websitebuilder',
    
    /**
     * Initialize storage with empty data structures if they don't exist
     */
    init: function() {
        if (!localStorage.getItem('webcraft_users')) {
            localStorage.setItem('webcraft_users', JSON.stringify({}));
        }
        
        if (!localStorage.getItem('webcraft_projects')) {
            localStorage.setItem('webcraft_projects', JSON.stringify({}));
        }
    },
    
    /**
     * Get all users
     * @returns {Object} Users object with username as keys
     */
    getUsers: function() {
        return JSON.parse(localStorage.getItem('webcraft_users') || '{}');
    },
    
    /**
     * Get user by username
     * @param {string} username - The username to look up
     * @returns {Object|null} User object or null if not found
     */
    getUser: function(username) {
        const users = this.getUsers();
        return users[username] || null;
    },
    
    /**
     * Save user data
     * @param {string} username - The username
     * @param {Object} userData - The user data to save
     */
    saveUser: function(username, userData) {
        const users = this.getUsers();
        users[username] = userData;
        localStorage.setItem('webcraft_users', JSON.stringify(users));
    },
    
    /**
     * Get all projects
     * @returns {Object} Projects object with projectId as keys
     */
    getProjects: function() {
        return JSON.parse(localStorage.getItem('webcraft_projects') || '{}');
    },
    
    /**
     * Get projects for a specific user
     * @param {string} username - The username to filter projects for
     * @returns {Array} Array of project objects
     */
    getUserProjects: function(username) {
        const projects = this.getProjects();
        const userProjects = [];
        
        for (const projectId in projects) {
            if (projects[projectId].owner === username) {
                userProjects.push({
                    id: projectId,
                    ...projects[projectId]
                });
            }
        }
        
        return userProjects;
    },
    
    /**
     * Get a specific project by ID
     * @param {string} projectId - The project ID to look up
     * @returns {Object|null} Project object or null if not found
     */
    getProject: function(projectId) {
        const projects = this.getProjects();
        return projects[projectId] || null;
    },
    
    /**
     * Save a project
     * @param {string} projectId - The project ID
     * @param {Object} projectData - The project data to save
     */
    saveProject: function(projectId, projectData) {
        const projects = this.getProjects();
        projects[projectId] = projectData;
        localStorage.setItem('webcraft_projects', JSON.stringify(projects));
    },
    
    /**
     * Delete a project
     * @param {string} projectId - The project ID to delete
     * @returns {boolean} True if deleted, false if not found
     */
    deleteProject: function(projectId) {
        const projects = this.getProjects();
        
        if (projects[projectId]) {
            delete projects[projectId];
            localStorage.setItem('webcraft_projects', JSON.stringify(projects));
            return true;
        }
        
        return false;
    },
    
    /**
     * Generate a unique ID for projects
     * @returns {string} A unique ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    /**
     * Get the full URL path for a project
     * @param {string} projectId - The project ID
     * @returns {string} The full URL path
     */
    getProjectUrl: function(projectId) {
        return `${this.basePath}/view.html?project=${projectId}`;
    },
    
    /**
     * Clear all data (for testing/debugging)
     */
    clearAll: function() {
        localStorage.removeItem('webcraft_users');
        localStorage.removeItem('webcraft_projects');
        localStorage.removeItem('webcraft_current_user');
        this.init();
    }
};

// Initialize storage
Storage.init();
