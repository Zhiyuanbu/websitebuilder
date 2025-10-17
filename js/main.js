/**
 * main.js - Main JavaScript file for the landing page
 * WebCraft Website Creator System
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('webcraft_current_user');
    
    if (currentUser) {
        // Update login button to redirect to dashboard
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = 'dashboard.html';
        }
        
        // Update sign up button
        const signupBtn = document.querySelector('a[href="login.html?signup=true"]');
        if (signupBtn) {
            signupBtn.textContent = 'My Projects';
            signupBtn.href = 'dashboard.html';
        }
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle URL parameters for signup tab
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('signup') && urlParams.get('signup') === 'true') {
        // For login page
        const showRegister = document.getElementById('show-register');
        if (showRegister) {
            showRegister.click();
        }
    }
});