 // Application State
        const AppState = {
            currentPage: 'home',
            currentSlide: 0,
            totalSlides: 3,
            formData: {},
            isSubmitting: false
        };

        // DOM Elements
        const elements = {
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            navMenu: document.getElementById('nav-menu'),
            slider: document.getElementById('slider'),
            sliderDots: document.querySelectorAll('.slider-dot'),
            contactForm: document.getElementById('contact-form'),
            submitBtn: document.getElementById('submit-btn')
        };

        // Utility Functions
        const utils = {
            // Debounce function for performance
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            // Validate email format
            validateEmail: (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },

            // Validate phone format
            validatePhone: (phone) => {
                const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{10}$/;
                return phoneRegex.test(phone) || phone === '';
            },

            // Format phone number
            formatPhone: (phone) => {
                const cleaned = phone.replace(/\D/g, '');
                const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
                if (match) {
                    return `(${match[1]}) ${match[2]}-${match[3]}`;
                }
                return phone;
            }
        };

        // Navigation System
        const Navigation = {
            init: () => {
                // Add click listeners to navigation links
                elements.navLinks.forEach(link => {
                    link.addEventListener('click', Navigation.handleNavClick);
                });

                // Add click listeners to footer links and CTA buttons
                document.querySelectorAll('[data-page]').forEach(link => {
                    link.addEventListener('click', Navigation.handleNavClick);
                });

                // Mobile menu toggle
                elements.mobileMenuBtn.addEventListener('click', Navigation.toggleMobileMenu);

                // Close mobile menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('nav')) {
                        elements.navMenu.classList.remove('active');
                    }
                });
            },

            handleNavClick: (e) => {
                e.preventDefault();
                const targetPage = e.target.getAttribute('data-page');
                if (targetPage && targetPage !== AppState.currentPage) {
                    Navigation.showPage(targetPage);
                }
                
                // Close mobile menu
                elements.navMenu.classList.remove('active');
            },

            showPage: (pageId) => {
                // Hide current page
                elements.pages.forEach(page => {
                    page.classList.remove('active');
                });

                // Show target page
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.classList.add('active');
                    AppState.currentPage = pageId;
                }

                // Update navigation active state
                elements.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-page') === pageId) {
                        link.classList.add('active');
                    }
                });

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Trigger animations for visible elements
                setTimeout(() => {
                    Animation.triggerPageAnimations();
                }, 100);
            },

            toggleMobileMenu: () => {
                elements.navMenu.classList.toggle('active');
            }
        };

        // Image Slider
        const Slider = {
            init: () => {
                // Auto-advance slider
                Slider.startAutoAdvance();

                // Add click listeners to dots
                elements.sliderDots.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                        Slider.goToSlide(slideIndex);
                    });
                });

                // Pause auto-advance on hover
                const sliderContainer = document.querySelector('.slider-container');
                if (sliderContainer) {
                    sliderContainer.addEventListener('mouseenter', Slider.stopAutoAdvance);
                    sliderContainer.addEventListener('mouseleave', Slider.startAutoAdvance);
                }
            },

            goToSlide: (slideIndex) => {
                AppState.currentSlide = slideIndex;
                const translateX = -(slideIndex * 100);
                elements.slider.style.transform = `translateX(${translateX}%)`;

                // Update dots
                elements.sliderDots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === slideIndex);
                });
            },

            nextSlide: () => {
                const nextSlide = (AppState.currentSlide + 1) % AppState.totalSlides;
                Slider.goToSlide(nextSlide);
            },

            startAutoAdvance: () => {
                Slider.stopAutoAdvance();
                Slider.autoAdvanceInterval = setInterval(Slider.nextSlide, 4000);
            },

            stopAutoAdvance: () => {
                if (Slider.autoAdvanceInterval) {
                    clearInterval(Slider.autoAdvanceInterval);
                }
            }
        };

        // Form Validation and Submission
        const FormHandler = {
            init: () => {
                if (elements.contactForm) {
                    elements.contactForm.addEventListener('submit', FormHandler.handleSubmit);
                    
                    // Add real-time validation
                    const inputs = elements.contactForm.querySelectorAll('input, textarea');
                    inputs.forEach(input => {
                        input.addEventListener('blur', () => FormHandler.validateField(input));
                        input.addEventListener('input', utils.debounce(() => FormHandler.validateField(input), 300));
                    });

                    // Phone number formatting
                    const phoneInput = document.getElementById('phone');
                    if (phoneInput) {
                        phoneInput.addEventListener('input', (e) => {
                            e.target.value = utils.formatPhone(e.target.value);
                        });
                    }
                }
            },

            validateField: (field) => {
                const formGroup = field.closest('.form-group');
                const value = field.value.trim();
                let isValid = true;
                let errorMessage = '';

                // Remove existing validation classes
                formGroup.classList.remove('error', 'success');

                // Required field validation
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = `${field.labels[0].textContent.replace(' *', '')} is required`;
                }
                // Email validation
                else if (field.type === 'email' && value && !utils.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                // Phone validation
                else if (field.type === 'tel' && value && !utils.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                // Minimum length validation
                else if (field.name === 'message' && value && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                }

                // Apply validation state
                if (!isValid) {
                    formGroup.classList.add('error');
                    const errorElement = formGroup.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                    }
                } else if (value) {
                    formGroup.classList.add('success');
                }

                return isValid;
            },

            validateForm: () => {
                const inputs = elements.contactForm.querySelectorAll('input, textarea');
                let isValid = true;

                inputs.forEach(input => {
                    if (!FormHandler.validateField(input)) {
                        isValid = false;
                    }
                });

                return isValid;
            },

            handleSubmit: async (e) => {
                e.preventDefault();

                if (AppState.isSubmitting) return;

                // Validate form
                if (!FormHandler.validateForm()) {
                    FormHandler.showMessage('Please correct the errors above', 'error');
                    return;
                }

                // Set submitting state
                AppState.isSubmitting = true;
                elements.submitBtn.disabled = true;
                elements.submitBtn.innerHTML = '<span class="loading"></span> Sending...';

                try {
                    // Simulate form submission
                    await FormHandler.simulateSubmission();
                    
                    // Success
                    FormHandler.showMessage('Thank you! Your message has been sent successfully.', 'success');
                    elements.contactForm.reset();
                    
                    // Reset form validation states
                    const formGroups = elements.contactForm.querySelectorAll('.form-group');
                    formGroups.forEach(group => {
                        group.classList.remove('error', 'success');
                    });

                } catch (error) {
                    FormHandler.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
                } finally {
                    // Reset submitting state
                    AppState.isSubmitting = false;
                    elements.submitBtn.disabled = false;
                    elements.submitBtn.innerHTML = 'Send Message';
                }
            },

            simulateSubmission: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                });
            },

            showMessage: (message, type) => {
                // Remove existing message
                const existingMessage = document.querySelector('.form-message');
                if (existingMessage) {
                    existingMessage.remove();
                }

                // Create new message
                const messageEl = document.createElement('div');
                messageEl.className = `form-message ${type}`;
                messageEl.style.cssText = `
                    padding: 1rem;
                    margin: 1rem 0;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    ${type === 'success' ? 
                        'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' : 
                        'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'}
                `;
                messageEl.textContent = message;

                // Insert message
                elements.contactForm.insertBefore(messageEl, elements.submitBtn);

                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 5000);
            }
        };

        // Animation System
        const Animation = {
            init: () => {
                // Initialize intersection observer for scroll animations
                Animation.setupScrollAnimations();
            },

            setupScrollAnimations: () => {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.animationDelay = '0ms';
                            entry.target.classList.add('animate');
                        }
                    });
                }, observerOptions);

                // Observe elements with animation classes
                document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
                    observer.observe(el);
                });
            },

            triggerPageAnimations: () => {
                const currentPageEl = document.querySelector('.page.active');
                if (currentPageEl) {
                    const animatedElements = currentPageEl.querySelectorAll('.fade-in, .slide-up');
                    animatedElements.forEach((el, index) => {
                        el.style.animationDelay = `${index * 100}ms`;
                        el.classList.add('animate');
                    });
                }
            }
        };

        // Performance Optimization
        const Performance = {
            init: () => {
                // Lazy load images (if any were added)
                Performance.setupLazyLoading();
                
                // Optimize scroll events
                Performance.setupScrollOptimization();
            },

            setupLazyLoading: () => {
                const images = document.querySelectorAll('img[data-src]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            },

            setupScrollOptimization: () => {
                let ticking = false;

                const handleScroll = () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            // Add scroll-based effects here if needed
                            ticking = false;
                        });
                        ticking = true;
                    }
                };

                window.addEventListener('scroll', handleScroll, { passive: true });
            }
        };

        // Accessibility Features
        const Accessibility = {
            init: () => {
                // Add focus management
                Accessibility.setupFocusManagement();
                
                // Add keyboard navigation
                Accessibility.setupKeyboardNavigation();
                
                // Add ARIA labels
                Accessibility.setupAriaLabels();
            },

            setupFocusManagement: () => {
                // Skip to content link
                const skipLink = document.createElement('a');
                skipLink.href = '#main';
                skipLink.textContent = 'Skip to main content';
                skipLink.className = 'skip-link';
                skipLink.style.cssText = `
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: var(--primary-color);
                    color: white;
                    padding: 8px;
                    text-decoration: none;
                    border-radius: 4px;
                    z-index: 1001;
                `;
                skipLink.addEventListener('focus', () => {
                    skipLink.style.top = '6px';
                });
                skipLink.addEventListener('blur', () => {
                    skipLink.style.top = '-40px';
                });
                
                document.body.insertBefore(skipLink, document.body.firstChild);

                // Add main id to main element
                document.querySelector('main').id = 'main';
            },

            setupKeyboardNavigation: () => {
                // Escape key to close mobile menu
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        elements.navMenu.classList.remove('active');
                    }
                });

                // Arrow keys for slider navigation
                document.addEventListener('keydown', (e) => {
                    if (AppState.currentPage === 'home') {
                        if (e.key === 'ArrowLeft') {
                            const prevSlide = AppState.currentSlide === 0 ? 
                                AppState.totalSlides - 1 : AppState.currentSlide - 1;
                            Slider.goToSlide(prevSlide);
                        } else if (e.key === 'ArrowRight') {
                            Slider.nextSlide();
                        }
                    }
                });
            },

            setupAriaLabels: () => {
                // Add aria-labels to interactive elements
                elements.mobileMenuBtn.setAttribute('aria-label', 'Toggle mobile menu');
                elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                
                elements.sliderDots.forEach((dot, index) => {
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    dot.setAttribute('role', 'button');
                    dot.setAttribute('tabindex', '0');
                    
                    // Add keyboard support for slider dots
                    dot.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            Slider.goToSlide(index);
                        }
                    });
                });

                // Update mobile menu aria-expanded
                const updateMenuAria = () => {
                    const isOpen = elements.navMenu.classList.contains('active');
                    elements.mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
                };

                const observer = new MutationObserver(updateMenuAria);
                observer.observe(elements.navMenu, { attributes: true, attributeFilter: ['class'] });
            }
        };

        // Application Initialization
        const App = {
            init: () => {
                // Initialize all modules
                Navigation.init();
                Slider.init();
                FormHandler.init();
                Animation.init();
                Performance.init();
                Accessibility.init();

                // Add CSS animations
                App.addAnimationStyles();

                console.log('🚀 TechSolutions website initialized successfully!');
            },

            addAnimationStyles: () => {
                const style = document.createElement('style');
                style.textContent = `
                    .fade-in, .slide-up {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.6s ease, transform 0.6s ease;
                    }

                    .fade-in.animate, .slide-up.animate {
                        opacity: 1;
                        transform: translateY(0);
                    }

                    .skip-link:focus {
                        top: 6px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        };

        // Initialize the application when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', App.init);
        } else {
            App.init();
        }

        // Handle browser back/forward buttons (basic SPA routing)
        window.addEventListener('popstate', (e) => {
            const page = e.state ? e.state.page : 'home';
            Navigation.showPage(page);
        });

        // Update browser history when navigating
        const originalShowPage = Navigation.showPage;
        Navigation.showPage = function(pageId) {
            originalShowPage.call(this, pageId);
            history.pushState({ page: pageId }, '', `#${pageId}`);
        };