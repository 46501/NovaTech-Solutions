// js/auth.js


// Utility functions for UI
function showAlert(message, type) {
    const alertBox = document.getElementById('authAlert');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `auth-alert ${type}`; // 'error' or 'success'
        alertBox.style.display = 'flex';
        // Auto hide after 5 seconds
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
}

function toggleLoading(btn, isLoading) {
    if (!btn) return;
    const btnText = btn.querySelector('.btn-text');
    if (isLoading) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        if (btnText) btnText.style.display = 'none';
        btn.classList.add('loading');
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (btnText) btnText.style.display = 'inline';
        btn.classList.remove('loading');
    }
}

window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling;
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('ph-eye', 'ph-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('ph-eye-slash', 'ph-eye');
    }
}

// Authentication State Management
async function checkAuthState() {
    if (!window.supabaseClient) return;

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    // Determine current page
    const path = window.location.pathname;
    const isDashboard = path.includes('dashboard.html');
    const isAuthPage = path.includes('login.html') || path.includes('signup.html') || path.includes('forgot-password.html') || path.includes('reset-password.html');
    
    // Route Protection
    if (isDashboard && !session) {
        window.location.href = 'auth/login.html';
        return;
    }
    
    if (isAuthPage && session) {
        window.location.href = '../dashboard.html';
        return;
    }

    // Update Navbar dynamically
    updateNavbar(session);
    
    // Setup Logout Listener if button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.href = isDashboard ? 'index.html' : 'index.html'; // Go home
        });
    }
}

function updateNavbar(session) {
    const authNavContainer = document.getElementById('auth-nav-container');
    if (!authNavContainer) return;
    
    const isRoot = !window.location.pathname.includes('/auth/');
    const loginPath = isRoot ? 'auth/login.html' : 'login.html';
    const signupPath = isRoot ? 'auth/signup.html' : 'signup.html';
    const dashboardPath = isRoot ? 'dashboard.html' : '../dashboard.html';

    if (session) {
        authNavContainer.innerHTML = `
            <a href="${dashboardPath}" class="btn" style="background:transparent; border:1px solid var(--primary-color); color:var(--text-color);">Dashboard</a>
            <a href="#" id="logoutBtn" class="btn btn-primary nav-btn" style="margin-left:10px;">Logout</a>
        `;
        // Setup listener for the newly injected logout button
        document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.href = isRoot ? 'index.html' : '../index.html';
        });
    } else {
        authNavContainer.innerHTML = `
            <a href="${loginPath}" class="btn" style="background:transparent; border:none; color:var(--text-color);">Log In</a>
            <a href="${signupPath}" class="btn btn-primary nav-btn">Get Started</a>
        `;
    }
}

// Check auth on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    // Also listen for auth state changes (e.g. login from another tab)
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            checkAuthState();
        });
    }
});

/* Form Handlers */

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        toggleLoading(btn, true);
        
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        toggleLoading(btn, false);
        
        if (error) {
            showAlert(error.message, 'error');
        } else {
            window.location.href = '../dashboard.html';
        }
    });
}

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        const btn = document.getElementById('submitBtn');
        
        if (password !== confirmPassword) {
            showAlert("Passwords do not match.", "error");
            return;
        }
        if (password.length < 8) {
            showAlert("Password must be at least 8 characters.", "error");
            return;
        }
        
        toggleLoading(btn, true);
        
        const redirectUrl = window.location.href.replace('signup.html', 'login.html');
        
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: redirectUrl
            }
        });
        
        toggleLoading(btn, false);
        
        if (error) {
            showAlert(error.message, 'error');
        } else {
            if (data.session) {
                // Auto login successful
                window.location.href = '../dashboard.html';
            } else {
                // Email verification required
                showAlert('Registration successful! Please check your email to verify your account.', 'success');
                signupForm.reset();
            }
        }
    });
}

// Forgot Password
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const btn = document.getElementById('submitBtn');
        
        toggleLoading(btn, true);
        
        const redirectUrl = window.location.href.replace('forgot-password.html', 'reset-password.html');
        
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });
        
        toggleLoading(btn, false);
        
        if (error) {
            showAlert(error.message, 'error');
        } else {
            showAlert('Password reset link sent! Check your email.', 'success');
            forgotPasswordForm.reset();
        }
    });
}

// Reset Password
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const btn = document.getElementById('submitBtn');
        
        if (password !== confirmPassword) {
            showAlert("Passwords do not match.", "error");
            return;
        }
        if (password.length < 8) {
            showAlert("Password must be at least 8 characters.", "error");
            return;
        }
        
        toggleLoading(btn, true);
        
        const { error } = await window.supabaseClient.auth.updateUser({
            password: password
        });
        
        toggleLoading(btn, false);
        
        if (error) {
            showAlert(error.message, 'error');
        } else {
            showAlert('Password updated successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '../dashboard.html';
            }, 2000);
        }
    });
}
