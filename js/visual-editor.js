/**
 * visual-editor.js - Visual editor functionality
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
    
    // Initialize the visual editor
    const canvas = document.getElementById('visual-canvas');
    const propertiesPanel = document.getElementById('properties-panel');
    let selectedElement = null;
    
    // Load project elements if they exist
    if (project.elements && project.elements.length > 0) {
        // Clear the "drag elements here" message
        canvas.innerHTML = '';
        
        // Create each element
        project.elements.forEach(elementData => {
            const element = createCanvasElement(elementData);
            canvas.appendChild(element);
        });
    }
    
    // Setup drag and drop for elements sidebar
    const elementItems = document.querySelectorAll('.element-item');
    
    elementItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.elementType);
        });
    });
    
    // Handle drops on the canvas
    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        
        // Get the dropped element type
        const elementType = e.dataTransfer.getData('text/plain');
        
        // Create a new element based on the type
        const elementData = {
            type: elementType,
            content: getDefaultContentForType(elementType),
            properties: getDefaultPropertiesForType(elementType)
        };
        
        // Create the element
        const newElement = createCanvasElement(elementData);
        
        // Clear placeholder message if this is the first element
        if (canvas.querySelector('.drop-message')) {
            canvas.innerHTML = '';
        }
        
        // Add to canvas
        canvas.appendChild(newElement);
        
        // Select the new element
        selectElement(newElement);
        
        // Save after adding an element
        saveProject();
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
            // Generate HTML and CSS from the visual elements
            const { html, css } = generateCodeFromElements();
            
            const previewContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${project.title} - Preview</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            line-height: 1.6;
                        }
                        ${css}
                    </style>
                </head>
                <body>
                    ${html}
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
    
    /**
     * Create a canvas element from element data
     * @param {Object} elementData - The element data
     * @returns {HTMLElement} The created element
     */
    function createCanvasElement(elementData) {
        const element = document.createElement('div');
        element.className = 'canvas-element';
        element.dataset.elementType = elementData.type;
        
        // Create element content based on type
        switch (elementData.type) {
            case 'header':
                element.innerHTML = `<h2>${elementData.content || 'Header'}</h2>`;
                break;
            case 'text':
                element.innerHTML = `<p>${elementData.content || 'Text paragraph'}</p>`;
                break;
            case 'image':
                element.innerHTML = `<img src="${elementData.properties?.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${elementData.properties?.imageAlt || 'Image'}" style="max-width:100%;">`;
                break;
            case 'button':
                element.innerHTML = `<button style="padding:10px 20px;">${elementData.content || 'Button'}</button>`;
                break;
            case 'container':
                element.innerHTML = `<div style="border:1px dashed #ccc;padding:20px;min-height:100px;">${elementData.content || 'Container'}</div>`;
                break;
            case 'list':
                element.innerHTML = `<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>`;
                break;
            case 'form':
                element.innerHTML = `
                    <form>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;margin-bottom:5px;">Name</label>
                            <input type="text" style="width:100%;padding:8px;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;margin-bottom:5px;">Email</label>
                            <input type="email" style="width:100%;padding:8px;">
                        </div>
                        <button type="button" style="padding:10px 20px;">Submit</button>
                    </form>
                `;
                break;
            case 'divider':
                element.innerHTML = `<hr style="border:0;border-top:1px solid #eee;margin:20px 0;">`;
                break;
            default:
                element.innerHTML = elementData.content || 'Element';
        }
        
        // Apply properties if they exist
        if (elementData.properties) {
            applyProperties(element, elementData.properties);
        }
        
        // Add element actions
        const actions = document.createElement('div');
        actions.className = 'element-actions';
        actions.innerHTML = `
            <button class="element-action-btn btn-move-up">↑</button>
            <button class="element-action-btn btn-move-down">↓</button>
            <button class="element-action-btn btn-delete">✕</button>
        `;
        element.appendChild(actions);
        
        // Setup element click to select
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.element-actions')) {
                selectElement(element);
                e.stopPropagation();
            }
        });
        
        // Setup action buttons
        const moveUpBtn = actions.querySelector('.btn-move-up');
        const moveDownBtn = actions.querySelector('.btn-move-down');
        const deleteBtn = actions.querySelector('.btn-delete');
        
        moveUpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (element.previousElementSibling) {
                canvas.insertBefore(element, element.previousElementSibling);
                saveProject();
            }
        });
        
        moveDownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (element.nextElementSibling) {
                canvas.insertBefore(element.nextElementSibling, element);
                saveProject();
            }
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this element?')) {
                element.remove();
                if (selectedElement === element) {
                    selectedElement = null;
                    updatePropertiesPanel();
                }
                saveProject();
            }
        });
        
        return element;
    }
    
    /**
     * Select an element and show its properties
     * @param {HTMLElement} element - The element to select
     */
    function selectElement(element) {
        // Deselect previous element
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        
        // Select new element
        selectedElement = element;
        selectedElement.classList.add('selected');
        
        // Update properties panel
        updatePropertiesPanel();
    }
    
    /**
     * Update the properties panel based on the selected element
     */
    function updatePropertiesPanel() {
        if (!propertiesPanel) return;
        
        if (!selectedElement) {
            propertiesPanel.innerHTML = `
                <div class="empty-properties">
                    <p>Select an element to edit its properties</p>
                </div>
            `;
            return;
        }
        
        const elementType = selectedElement.dataset.elementType;
        
        // Create properties form based on element type
        let propertiesHtml = '';
        
        switch (elementType) {
            case 'header':
            case 'text':
            case 'button':
                const textTemplate = document.getElementById('text-properties-template');
                propertiesHtml = textTemplate ? textTemplate.innerHTML : '';
                break;
                
            case 'image':
                const imageTemplate = document.getElementById('image-properties-template');
                propertiesHtml = imageTemplate ? imageTemplate.innerHTML : '';
                break;
                
            default:
                propertiesHtml = `
                    <div class="property-group">
                        <label>Basic Properties</label>
                        <p>More properties coming soon.</p>
                    </div>
                `;
        }
        
        propertiesPanel.innerHTML = propertiesHtml;
        
        // Set initial property values
        setInitialPropertyValues();
        
        // Add event listeners to property inputs
        const propertyInputs = propertiesPanel.querySelectorAll('.property-input');
        propertyInputs.forEach(input => {
            input.addEventListener('change', () => {
                applyPropertyChanges();
                saveProject();
            });
            
            // For text inputs, also listen for keyup events
            if (input.type === 'text' || input.type === 'textarea') {
                input.addEventListener('keyup', () => {
                    applyPropertyChanges();
                    saveProject();
                });
            }
        });
    }
    
    /**
     * Set initial property values in the properties panel
     */
    function setInitialPropertyValues() {
        if (!selectedElement) return;
        
        const elementType = selectedElement.dataset.elementType;
        
        // Get content from the element
        let content = '';
        if (elementType === 'header') {
            content = selectedElement.querySelector('h2').textContent;
            
            // Set text properties
            const textContent = document.getElementById('text-content');
            if (textContent) textContent.value = content;
            
            // Set other properties based on computed style
            const computedStyle = window.getComputedStyle(selectedElement.querySelector('h2'));
            
            const textSize = document.getElementById('text-size');
            if (textSize) textSize.value = parseInt(computedStyle.fontSize) || 24;
            
            const textColor = document.getElementById('text-color');
            if (textColor) textColor.value = computedStyle.color || '#000000';
            
            const textAlign = document.getElementById('text-align');
            if (textAlign) textAlign.value = computedStyle.textAlign || 'left';
        } 
        else if (elementType === 'text') {
            content = selectedElement.querySelector('p').textContent;
            
            // Set text properties
            const textContent = document.getElementById('text-content');
            if (textContent) textContent.value = content;
            
            // Set other properties based on computed style
            const computedStyle = window.getComputedStyle(selectedElement.querySelector('p'));
            
            const textSize = document.getElementById('text-size');
            if (textSize) textSize.value = parseInt(computedStyle.fontSize) || 16;
            
            const textColor = document.getElementById('text-color');
            if (textColor) textColor.value = computedStyle.color || '#000000';
            
            const textAlign = document.getElementById('text-align');
            if (textAlign) textAlign.value = computedStyle.textAlign || 'left';
        }
        else if (elementType === 'image') {
            const img = selectedElement.querySelector('img');
            
            const imageUrl = document.getElementById('image-url');
            if (imageUrl) imageUrl.value = img.src;
            
            const imageAlt = document.getElementById('image-alt');
            if (imageAlt) imageAlt.value = img.alt;
            
            const imageWidth = document.getElementById('image-width');
            if (imageWidth) {
                // Get width as percentage if set
                const width = img.style.width;
                if (width && width.endsWith('%')) {
                    imageWidth.value = parseInt(width);
                } else {
                    imageWidth.value = 100;
                }
            }
        }
    }
    
    /**
     * Apply property changes to the selected element
     */
    function applyPropertyChanges() {
        if (!selectedElement) return;
        
        const elementType = selectedElement.dataset.elementType;
        
        if (elementType === 'header') {
            // Get the header element
            const header = selectedElement.querySelector('h2');
            
            // Update content
            const textContent = document.getElementById('text-content');
            if (textContent) header.textContent = textContent.value;
            
            // Update other properties
            const textSize = document.getElementById('text-size');
            if (textSize) header.style.fontSize = `${textSize.value}px`;
            
            const textColor = document.getElementById('text-color');
            if (textColor) header.style.color = textColor.value;
            
            const textAlign = document.getElementById('text-align');
            if (textAlign) header.style.textAlign = textAlign.value;
        }
        else if (elementType === 'text') {
            // Get the paragraph element
            const paragraph = selectedElement.querySelector('p');
            
            // Update content
            const textContent = document.getElementById('text-content');
            if (textContent) paragraph.textContent = textContent.value;
            
            // Update other properties
            const textSize = document.getElementById('text-size');
            if (textSize) paragraph.style.fontSize = `${textSize.value}px`;
            
            const textColor = document.getElementById('text-color');
            if (textColor) paragraph.style.color = textColor.value;
            
            const textAlign = document.getElementById('text-align');
            if (textAlign) paragraph.style.textAlign = textAlign.value;
        }
        else if (elementType === 'image') {
            // Get the image element
            const img = selectedElement.querySelector('img');
            
            // Update properties
            const imageUrl = document.getElementById('image-url');
            if (imageUrl) img.src = imageUrl.value;
            
            const imageAlt = document.getElementById('image-alt');
            if (imageAlt) img.alt = imageAlt.value;
            
            const imageWidth = document.getElementById('image-width');
            if (imageWidth) img.style.width = `${imageWidth.value}%`;
        }
    }
    
    /**
     * Apply properties to an element from property data
     * @param {HTMLElement} element - The element to apply properties to
     * @param {Object} properties - The properties to apply
     */
    function applyProperties(element, properties) {
        const elementType = element.dataset.elementType;
        
        if (elementType === 'header') {
            const header = element.querySelector('h2');
            if (header && properties) {
                if (properties.fontSize) header.style.fontSize = `${properties.fontSize}px`;
                if (properties.color) header.style.color = properties.color;
                if (properties.textAlign) header.style.textAlign = properties.textAlign;
            }
        }
        else if (elementType === 'text') {
            const paragraph = element.querySelector('p');
            if (paragraph && properties) {
                if (properties.fontSize) paragraph.style.fontSize = `${properties.fontSize}px`;
                if (properties.color) paragraph.style.color = properties.color;
                if (properties.textAlign) paragraph.style.textAlign = properties.textAlign;
            }
        }
        else if (elementType === 'image') {
            const img = element.querySelector('img');
            if (img && properties) {
                if (properties.imageUrl) img.src = properties.imageUrl;
                if (properties.imageAlt) img.alt = properties.imageAlt;
                if (properties.width) img.style.width = `${properties.width}%`;
            }
        }
    }
    
    /**
     * Get default content for a new element based on type
     * @param {string} elementType - The type of element
     * @returns {string} Default content
     */
    function getDefaultContentForType(elementType) {
        switch (elementType) {
            case 'header': return 'New Header';
            case 'text': return 'New paragraph text';
            case 'button': return 'Button';
            case 'container': return '';
            default: return '';
        }
    }
    
    /**
     * Get default properties for a new element based on type
     * @param {string} elementType - The type of element
     * @returns {Object} Default properties
     */
    function getDefaultPropertiesForType(elementType) {
        switch (elementType) {
            case 'header':
                return {
                    fontSize: '32',
                    color: '#333333',
                    textAlign: 'left'
                };
            case 'text':
                return {
                    fontSize: '16',
                    color: '#333333',
                    textAlign: 'left'
                };
            case 'image':
                return {
                    imageUrl: 'https://via.placeholder.com/300x200',
                    imageAlt: 'Image',
                    width: '100'
                };
            case 'button':
                return {
                    fontSize: '16',
                    color: '#ffffff',
                    backgroundColor: '#3498db'
                };
            default:
                return {};
        }
    }
    
    /**
     * Generate HTML and CSS code from the visual elements
     * @returns {Object} Object containing html and css strings
     */
    function generateCodeFromElements() {
        let html = '';
        let css = '';
        
        // Get all canvas elements
        const elements = canvas.querySelectorAll('.canvas-element');
        
        elements.forEach((element, index) => {
            const elementType = element.dataset.elementType;
            const elementId = `element-${index}`;
            
            switch (elementType) {
                case 'header':
                    const headerText = element.querySelector('h2').textContent;
                    const headerStyle = element.querySelector('h2').getAttribute('style');
                    
                    html += `<h2 id="${elementId}">${headerText}</h2>\n`;
                    if (headerStyle) {
                        css += `#${elementId} {\n  ${headerStyle.replace(/; /g, ';\n  ')}\n}\n\n`;
                    }
                    break;
                    
                case 'text':
                    const textContent = element.querySelector('p').textContent;
                    const textStyle = element.querySelector('p').getAttribute('style');
                    
                    html += `<p id="${elementId}">${textContent}</p>\n`;
                    if (textStyle) {
                        css += `#${elementId} {\n  ${textStyle.replace(/; /g, ';\n  ')}\n}\n\n`;
                    }
                    break;
                    
                case 'image':
                    const img = element.querySelector('img');
                    const imgSrc = img.src;
                    const imgAlt = img.alt;
                    const imgStyle = img.getAttribute('style');
                    
                    html += `<img id="${elementId}" src="${imgSrc}" alt="${imgAlt}">\n`;
                    if (imgStyle) {
                        css += `#${elementId} {\n  ${imgStyle.replace(/; /g, ';\n  ')}\n}\n\n`;
                    }
                    break;
                    
                // Add other element types as needed
                
                default:
                    const innerHTML = element.innerHTML;
                    html += `<div id="${elementId}">${innerHTML}</div>\n`;
            }
        });
        
        return { html, css };
    }
    
    /**
     * Save the project
     */
    function saveProject() {
        // Collect all elements data
        const elements = [];
        const canvasElements = canvas.querySelectorAll('.canvas-element');
        
        canvasElements.forEach(element => {
            const elementType = element.dataset.elementType;
            let content = '';
            let properties = {};
            
            // Extract content and properties based on element type
            if (elementType === 'header') {
                const header = element.querySelector('h2');
                content = header.textContent;
                
                // Get computed styles
                const style = window.getComputedStyle(header);
                properties = {
                    fontSize: parseInt(style.fontSize),
                    color: style.color,
                    textAlign: style.textAlign
                };
            }
            else if (elementType === 'text') {
                const paragraph = element.querySelector('p');
                content = paragraph.textContent;
                
                // Get computed styles
                const style = window.getComputedStyle(paragraph);
                properties = {
                    fontSize: parseInt(style.fontSize),
                    color: style.color,
                    textAlign: style.textAlign
                };
            }
            else if (elementType === 'image') {
                const img = element.querySelector('img');
                properties = {
                    imageUrl: img.src,
                    imageAlt: img.alt,
                    width: img.style.width ? parseInt(img.style.width) : 100
                };
            }
            
            elements.push({
                type: elementType,
                content,
                properties
            });
        });
        
        // Generate code from visual elements
        const { html, css } = generateCodeFromElements();
        
        // Update project data
        project.elements = elements;
        project.html = html;
        project.css = css;
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
    
    // Click on canvas should deselect element
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                updatePropertiesPanel();
            }
        }
    });
});