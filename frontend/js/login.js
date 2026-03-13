const authElements = {
    authTabs: document.querySelectorAll('.auth-tab'),
    tabContents: document.querySelectorAll('.auth-tab-content'),
    tabSwitches: document.querySelectorAll('.tab-switch'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    rememberMe: document.getElementById('rememberMe'),
    loginError: document.getElementById('loginError'),
    signupForm: document.getElementById('signupForm'),
    signupName: document.getElementById('signupName'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    signupConfirm: document.getElementById('signupConfirm'),
    agreeTerms: document.getElementById('agreeTerms'),
    signupError: document.getElementById('signupError'),

    socialButtons: document.querySelectorAll('.social-btn'),

    forgotPasswordLink: document.querySelector('.forgot-password'),
};

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    authElements.authTabs.forEach((tab) => {
        tab.addEventListener('click', handleTabChange);
    });

    authElements.tabSwitches.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            switchTab(target);
        });
    });

    authElements.loginForm.addEventListener('submit', handleLoginSubmit);
    authElements.signupForm.addEventListener('submit', handleSignupSubmit);

    authElements.socialButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.classList.contains('github') ? 'github' : 'google';
            handleSocialLogin(provider);
        });
    });

    if (authElements.forgotPasswordLink) {
        authElements.forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }

    authElements.loginEmail.addEventListener('input', () => clearError('login'));
    authElements.loginPassword.addEventListener('input', () => clearError('login'));
    authElements.signupEmail.addEventListener('input', () => clearError('signup'));
    authElements.signupPassword.addEventListener('input', () => clearError('signup'));
}

function handleTabChange(e) {
    const tabName = e.target.getAttribute('data-tab');
    switchTab(tabName);
}

function switchTab(tabName) {
    authElements.authTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    authElements.tabContents.forEach((content) => {
        content.classList.toggle('active', content.id === tabName);
    });

    clearError('login');
    clearError('signup');


    authElements.loginForm.reset();
    authElements.signupForm.reset();
}


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePasswordStrength(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function validateLoginForm(email, password) {
    const errors = [];

    if (!email.trim()) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    if (!password.trim()) {
        errors.push('Password is required');
    }

    return errors;
}

function validateSignupForm(name, email, password, confirmPassword, agreeTerms) {
    const errors = [];

    if (!name.trim()) {
        errors.push('Full name is required');
    } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email.trim()) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    if (!password.trim()) {
        errors.push('Password is required');
    } else if (!validatePasswordStrength(password)) {
        errors.push('Password must be at least 8 characters with uppercase, lowercase, and numbers');
    }

    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (!agreeTerms) {
        errors.push('You must agree to the Terms of Service');
    }

    return errors;
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    clearError('login');

    const email = authElements.loginEmail.value.trim();
    const password = authElements.loginPassword.value;
    const rememberMe = authElements.rememberMe.checked;

    const errors = validateLoginForm(email, password);
    if (errors.length > 0) {
        showError('login', errors.join('. '));
        return;
    }

    try {
        setLoading(authElements.loginForm, true);

        const response = await auth.login(email, password);

        if (rememberMe) {
            localStorage.setItem('rememberEmail', email);
        } else {
            localStorage.removeItem('rememberEmail');
        }

        showSuccess('login', 'Login successful! Redirecting...');
        setTimeout(() => {
            auth.checkRedirection();
        }, 1500);
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage =
            error.message || 'Login failed. Please check your credentials and try again.';
        showError('login', errorMessage);
        setLoading(authElements.loginForm, false);
    }
}


async function handleSignupSubmit(e) {
    e.preventDefault();
    clearError('signup');

    const name = authElements.signupName.value.trim();
    const email = authElements.signupEmail.value.trim();
    const password = authElements.signupPassword.value;
    const confirmPassword = authElements.signupConfirm.value;
    const agreeTerms = authElements.agreeTerms.checked;

    const errors = validateSignupForm(name, email, password, confirmPassword, agreeTerms);
    if (errors.length > 0) {
        showError('signup', errors.join('. '));
        return;
    }

    try {
        setLoading(authElements.signupForm, true);

        const response = await auth.register(name, email, password);

        authElements.signupForm.reset();
        showSuccess('signup', 'Account created successfully! Redirecting to dashboard...');

        setTimeout(() => {
            auth.checkRedirection();
        }, 1500);
    } catch (error) {
        console.error('Signup error:', error);

        let errorMessage = 'Registration failed. ';
        if (error.message.includes('email')) {
            errorMessage += 'This email is already registered. Please try logging in.';
        } else {
            errorMessage += error.message || 'Please try again later.';
        }

        showError('signup', errorMessage);
        setLoading(authElements.signupForm, false);
    }
}


function handleSocialLogin(provider) {
    console.log(`Social login with ${provider} coming soon`);
    alert(`${provider} login integration coming soon!`);
}


function handleForgotPassword(e) {
    e.preventDefault();
    console.log('Forgot password feature requested');
    alert('Password reset feature coming soon! Contact support@devcollab.com');
}

function showError(formType, message) {
    const errorElement =
        formType === 'login' ? authElements.loginError : authElements.signupError;
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');

    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function showSuccess(formType, message) {
    const form = formType === 'login' ? authElements.loginForm : authElements.signupForm;
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    form.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}


function clearError(formType) {
    const errorElement =
        formType === 'login' ? authElements.loginError : authElements.signupError;
    errorElement.classList.add('hidden');
    errorElement.textContent = '';
}


function setLoading(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');

    if (isLoading) {
        submitButton.classList.add('btn-loading');
        submitButton.disabled = true;
        submitButton.textContent = 'Please wait...';
    } else {
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
        submitButton.textContent =
            form === authElements.loginForm ? 'Sign In' : 'Create Account';
    }

    const inputs = form.querySelectorAll('input');
    inputs.forEach((input) => {
        input.disabled = isLoading;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
        authElements.loginEmail.value = rememberedEmail;
        authElements.rememberMe.checked = true;
    }
});
