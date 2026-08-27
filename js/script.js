document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       Preloader
    ========================================= */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 500);
        });
    }

    /* =========================================
       Dark/Light Mode Toggle
    ========================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = 'light';
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            newTheme = 'dark';
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        }
        
        localStorage.setItem('theme', newTheme);
    });

    /* =========================================
       Sticky Navigation & Scroll to Top
    ========================================= */
    const header = document.getElementById('header');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll to Top Button Visibility
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('active');
        } else {
            scrollToTopBtn.classList.remove('active');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* =========================================
       Mobile Menu Toggle
    ========================================= */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('mobile-active')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close mobile menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-active');
            mobileMenuBtn.querySelector('i').classList.replace('ph-x', 'ph-list');
        });
    });

    /* =========================================
       Active Nav Link on Scroll
    ========================================= */
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    /* =========================================
       Animated Counters
    ========================================= */
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;
    
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target + (counter.parentElement.innerText.includes('Clients') ? '+' : '');
                }
            };
            
            updateCounter();
        });
    };
    
    // Intersection Observer for Counters
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                animateCounters();
                hasAnimated = true;
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }

    /* =========================================
       FAQ Accordion
    ========================================= */
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            
            // Close other open faqs
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    otherQuestion.nextElementSibling.style.maxHeight = null;
                }
            });
            
            // Toggle current faq
            question.classList.toggle('active');
            
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    /* =========================================
       Testimonial Slider
    ========================================= */
    const track = document.getElementById('testimonialTrack');
    const slides = Array.from(track.children);
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.getElementById('sliderDots');
    
    let currentIndex = 0;
    let autoPlayInterval;
    
    // Create Dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = Array.from(dotsContainer.children);
    
    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    };
    
    const goToSlide = (index) => {
        currentIndex = index;
        updateSlider();
        resetAutoPlay();
    };
    
    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    };
    
    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    };
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });
    
    // Auto Play
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
    };
    
    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    };
    
    startAutoPlay();

    // Pause on hover
    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    /* =========================================
       Reveal Animations on Scroll
    ========================================= */
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    /* =========================================
       Portfolio Filtering
    ========================================= */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioCards.forEach(card => {
                // If filter is all, show all. Otherwise, match category
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.classList.remove('hide');
                    // Small timeout to allow display:block to apply before animating opacity/transform
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hide');
                    }, 300); // Wait for transition
                }
            });
        });
    });

    /* =========================================
       Contact Form Submission (Formspree)
    ========================================= */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;
            
            // Check if user still hasn't replaced the placeholder ID
            if (contactForm.action.includes('YOUR_FORM_ID')) {
                // Simulate submission to avoid 404 error
                setTimeout(() => {
                    formStatus.innerText = "Message simulated! (Please replace 'YOUR_FORM_ID' in index.html to actually receive emails)";
                    formStatus.style.color = "#F59E0B"; // Warning Orange
                    formStatus.style.display = "block";
                    contactForm.reset();
                    
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    
                    setTimeout(() => {
                        formStatus.style.display = "none";
                    }, 5000);
                }, 1500);
                return;
            }

            const data = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formStatus.innerText = "Thanks for your message! We'll get back to you soon.";
                    formStatus.style.color = "#10B981"; // Success Green
                    formStatus.style.display = "block";
                    contactForm.reset();
                } else {
                    const responseData = await response.json();
                    if (responseData.hasOwnProperty('errors')) {
                        formStatus.innerText = responseData.errors.map(error => error.message).join(", ");
                    } else {
                        formStatus.innerText = "Oops! There was a problem submitting your form.";
                    }
                    formStatus.style.color = "#EF4444"; // Error Red
                    formStatus.style.display = "block";
                }
            } catch (error) {
                formStatus.innerText = "Oops! There was a problem submitting your form.";
                formStatus.style.color = "#EF4444";
                formStatus.style.display = "block";
            } finally {
                btn.innerText = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
                
                // Hide status message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = "none";
                }, 5000);
            }
        });
    }
});
