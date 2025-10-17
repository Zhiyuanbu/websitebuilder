/**
 * auth.js - Authentication handling
 * WebCraft Website Creator System
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    
    if (loginForm && registerForm) {
        // Handle login form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            
            // Basic validation
            if (!username || !password) {
                showMessage('Please enter both username and password.', 'error');
                return;
            }
            
            const user = Storage.getUser(username);
            
            // Check if user exists and password matches
            if (!user) {
                showMessage('Username not found.', 'error');
                return;
            }
            
            if (user.password !== password) {
                showMessage('Incorrect password.', 'error');
                return;
            }
            
            // Login successful
            localStorage.setItem('webcraft_current_user', username);
            showMessage('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
        
        // Handle registration form submission
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            // Basic validation
            if (!username || !email || !password) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }
            
            // Check if username already exists
            const existingUser = Storage.getUser(username);
            if (existingUser) {
                showMessage('Username already taken.', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                username: username,
                email: email,
                password: password, // In a real app, this should be hashed
                createdAt: new Date().toISOString()
            };
            
            Storage.saveUser(username, newUser);
            
            // Auto login after registration
            localStorage.setItem('webcraft_current_user', username);
            showMessage('Registration successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
        
        // Switch between login and registration forms
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const loginFormContainer = document.getElementById('login-form');
        const registerFormContainer = document.getElementById('register-form');
        
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginFormContainer.classList.add('hidden');
            registerFormContainer.classList.remove('hidden');
        });
        
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerFormContainer.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');
        });
        
        // Close message box
        const messageCloseBtn = document.getElementById('message-close');
        if (messageCloseBtn) {
            messageCloseBtn.addEventListener('click', () => {
                document.getElementById('auth-message').classList.add('hidden');
            });
        }
        
        // Check URL parameters for signup tab
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('signup') && urlParams.get('signup') === 'true') {
            showRegisterBtn.click();
        }
    } else {
        // We're on another page, check if user is logged in
        checkAuth();
    }
});

/**
 * Check if user is authenticated
 * Redirect to login page if not on public pages
 */
function checkAuth() {
    const currentUser = localStorage.getItem('webcraft_current_user');
    const publicPages = ['index.html', 'login.html', ''];
    
    // Get current page filename
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    // If not logged in and not on a public page, redirect to login
    if (!currentUser && !publicPages.includes(page)) {
        window.location.href = 'login.html';
    }
    
    // If logged in, update any username displays
    if (currentUser) {
        const usernameDisplays = document.querySelectorAll('#username-display');
        usernameDisplays.forEach(el => {
            el.textContent = currentUser;
        });
        
        // Setup logout button functionality
        const logoutButtons = document.querySelectorAll('#btn-logout');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('webcraft_current_user');
                window.location.href = 'index.html';
            });
        });
    }
}

/**
 * Display a message to the user
 * @param {string} message - The message to display
 * @param {string} type - The message type ('error' or 'success')
 */
function showMessage(message, type) {
    const messageBox = document.getElementById('auth-message');
    const messageText = document.getElementById('message-text');
    
    if (messageBox && messageText) {
        messageText.textContent = message;
        messageBox.className = 'message-box';
        messageBox.classList.add(type);
        messageBox.classList.remove('hidden');
    } else {
        // Fallback to alert if we're not on the login page
        alert(message);
    }
}