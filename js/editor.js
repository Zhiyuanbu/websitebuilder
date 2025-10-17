/**
 * editor.js - Code editor functionality
 * WebCraft Website Creator System
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('webcraft_current_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    if (!projectId) {
        alert('No project specified.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Load project data
    const project = Storage.getProject(projectId);
    
    if (!project || project.owner !== currentUser) {
        alert('Project not found or you do not have permission to edit it.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Set project title
    const projectTitle = document.getElementById('project-title');
    if (projectTitle) {
        projectTitle.value = project.title;
    }
    
    // Set username in header
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser;
    }
    
    // Load the code into the editors
    const htmlEditor = document.getElementById('html-code');
    const cssEditor = document.getElementById('css-code');
    const jsEditor = document.getElementById('js-code');
    
    if (htmlEditor) htmlEditor.value = project.html || '';
    if (cssEditor) cssEditor.value = project.css || '';
    if (jsEditor) jsEditor.value = project.js || '';
    
    // Tab switching functionality
    const fileTabs = document.querySelectorAll('.file-tab');
    const codeEditors = document.querySelectorAll('.code-editor');
    
    fileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const fileType = tab.dataset.file;
            
            // Update active tab
            fileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show the corresponding editor
            codeEditors.forEach(editor => {
                if (editor.id === `${fileType}-editor`) {
                    editor.classList.remove('hidden');
                } else {
                    editor.classList.add('hidden');
                }
            });
        });
    });
    
    // Save functionality
    const saveButton = document.getElementById('btn-save');
    if (saveButton) {
        saveButton.addEventListener('click', saveProject);
    }
    
    // Auto-save every 30 seconds
    setInterval(saveProject, 30000);
    
    // Preview functionality
    const previewButton = document.getElementById('btn-preview');
    const previewModal = document.getElementById('preview-modal');
    const previewFrame = document.getElementById('preview-frame');
    const closePreviewButton = document.getElementById('close-preview');
    
    if (previewButton && previewModal && previewFrame) {
        previewButton.addEventListener('click', () => {
            // Generate preview HTML
            const htmlContent = htmlEditor.value;
            const cssContent = cssEditor.value;
            const jsContent = jsEditor.value;
            
            const previewContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${project.title} - Preview</title>
                    <style>${cssContent}</style>
                </head>
                <body>
                    ${htmlContent}
                    <script>${jsContent}</script>
                </body>
                </html>
            `;
            
            // Set preview content
            const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
            previewDocument.open();
            previewDocument.write(previewContent);
            previewDocument.close();
            
            // Show modal
            previewModal.style.display = 'flex';
        });
        
        // Close preview
        closePreviewButton.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });
    }
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
        }
        
        // Ctrl/Cmd + P to preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            if (previewButton) previewButton.click();
        }
    });
    
    /**
     * Save the project
     */
    function saveProject() {
        // Get current code values
        const htmlContent = htmlEditor.value;
        const cssContent = cssEditor.value;
        const jsContent = jsEditor.value;
        
        // Update project data
        project.html = htmlContent;
        project.css = cssContent;
        project.js = jsContent;
        project.lastModified = new Date().toISOString();
        
        // Save to storage
        Storage.saveProject(projectId, project);
        
        // Visual feedback (flash save button)
        if (saveButton) {
            saveButton.textContent = 'Saved!';
            setTimeout(() => {
                saveButton.textContent = 'Save';
            }, 2000);
        }
    }
});