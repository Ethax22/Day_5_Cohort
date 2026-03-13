/* ============================================
   LANDING PAGE - INTERACTIVE FEATURES
   ============================================ */

/**
 * Smooth scroll behavior for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') {
            return;
        }

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    });
});

/**
 * Intersection Observer for scroll animations
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards, testimonials, and pricing cards
document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .step').forEach((el) => {
    observer.observe(el);
});

/**
 * Add animation classes for scroll effect
 */
const style = document.createElement('style');
style.textContent = `
    .feature-card,
    .testimonial-card,
    .pricing-card,
    .step {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

/**
 * Navbar background on scroll
 */
const navbar = document.querySelector('.navbar-landing');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(30, 30, 30, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
        }
    });
}

/**
 * Counter animation for stats
 */
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30; // Animate over 30 frames
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 50);
}

/**
 * Animate stats when they come into view
 */
const statsObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                // Extract the number from the text
                const numberText = entry.target.querySelector('.stat-number').textContent;
                const number = parseInt(numberText.replace(/[^0-9]/g, ''));

                if (!isNaN(number)) {
                    animateCounter(entry.target.querySelector('.stat-number'), number);
                }

                entry.target.dataset.animated = 'true';
                statsObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.5,
    }
);

document.querySelectorAll('.stat').forEach((stat) => {
    statsObserver.observe(stat);
});

/**
 * Parallax effect on hero section
 */
const heroSection = document.querySelector('.hero');
if (heroSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const elem = heroSection.querySelector('.hero::before');
        if (elem) {
            elem.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

/**
 * Pricing card toggle (placeholder for future monthly/yearly toggle)
 */
document.addEventListener('DOMContentLoaded', () => {
    // Click outside modal to close
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.parentElement.classList.add('hidden');
        }
    });
});

/**
 * Smooth page load animation
 */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

/**
 * Track user engagement
 */
document.addEventListener('click', (e) => {
    const cta = e.target.closest('a[href*="login"], button[class*="btn-primary"]');
    if (cta) {
        console.log('User clicked CTA:', cta.textContent);
        // Could send analytics event here
    }
});

/**
 * Handle keyboard navigation
 */
document.addEventListener('keydown', (e) => {
    // Skip to main content with keyboard (accessibility)
    if (e.key === 's' && e.ctrlKey) {
        document.querySelector('.features').focus();
    }

    // Scroll to pricing with 'p'
    if (e.key === 'p' && !e.target.matches('input, textarea')) {
        document.querySelector('#pricing').scrollIntoView({ behavior: 'smooth' });
    }
});

/**
 * Add scroll reveal animation to sections
 */
const revealElements = document.querySelectorAll('.section-header, .hero-content, .hero-visual');
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2,
    }
);

const fadeInUpStyle = document.createElement('style');
fadeInUpStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeInUpStyle);

revealElements.forEach((el) => {
    revealObserver.observe(el);
});

/**
 * Mobile menu toggle (if needed in future)
 */
function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar-right');
    if (navbar) {
        navbar.classList.toggle('mobile-open');
    }
}

/**
 * Handle responsive navbar
 */
function handleNavbarResponsive() {
    const navbar = document.querySelector('.navbar');
    const navbarRight = document.querySelector('.navbar-right');

    if (window.innerWidth < 768 && navbar) {
        // Add mobile menu button if it doesn't exist
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '☰';
            menuBtn.addEventListener('click', toggleMobileMenu);
            navbar.appendChild(menuBtn);
        }
    }
}

window.addEventListener('load', handleNavbarResponsive);
window.addEventListener('resize', handleNavbarResponsive);

/**
 * Performance: Lazy load images
 */
document.addEventListener('DOMContentLoaded', () => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach((img) => {
            imageObserver.observe(img);
        });
    }
});

/**
 * Prevent console errors in production
 */
if (typeof console === 'undefined') {
    window.console = {
        log: function () {},
        info: function () {},
        warn: function () {},
        error: function () {},
    };
}

/**
 * Log page performance metrics
 */
window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
        const perf = window.performance.timing;
        const pageLoadTime = perf.loadEventEnd - perf.navigationStart;
        console.log('Page load time:', pageLoadTime, 'ms');
    }
});

/**
 * Prevent memory leaks
 */
window.addEventListener('beforeunload', () => {
    // Cleanup observers
    observer.disconnect();
    statsObserver.disconnect();
    revealObserver.disconnect();
});
