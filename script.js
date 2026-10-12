document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-right, .fade-left');
    animatedElements.forEach(el => {
        observer.observe(el);
    });


    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuBtn.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close on nav link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // Page Transition: Fade out on link click
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            
            // Ignore anchors, blank targets, mailto, tel, or empty links
            if (!target || target.startsWith('#') || this.target === '_blank' || target.startsWith('mailto:') || target.startsWith('tel:')) return;
            
            // Apply only to internal html links
            if (target.endsWith('.html') || !target.includes('://')) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                
                setTimeout(() => {
                    window.location.href = target;
                }, 350);
            }
        });
    });

    // Sub-Category Tab Switching with smooth fade-in
    const subCatItems = document.querySelectorAll('.sub-category-item');
    if (subCatItems.length > 0) {
        subCatItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                
                // Active class update
                subCatItems.forEach(tab => tab.classList.remove('active'));
                this.classList.add('active');

                // Content area toggle
                const allTabAreas = document.querySelectorAll('.tab-content-area');
                allTabAreas.forEach(area => {
                    if (area) {
                        area.classList.remove('tab-active');
                        area.style.display = 'none';
                    }
                });

                const targetArea = document.getElementById(targetId);
                if (targetArea) {
                    targetArea.style.display = 'block';
                    // Trigger reflow to restart CSS opacity transition
                    void targetArea.offsetWidth;
                    targetArea.classList.add('tab-active');

                    // Reset test forms and hide previous results when switching tabs
                    if (typeof resetTestForm === 'function') {
                        resetTestForm(targetArea);
                    }

                    // Reset and re-observe internal animated elements for smooth scroll reveal inside tabs
                    const anims = targetArea.querySelectorAll('.fade-up, .fade-right, .fade-left');
                    anims.forEach(el => {
                        el.classList.remove('visible');
                        if (typeof observer !== 'undefined') {
                            observer.observe(el);
                        }
                    });
                }
            });
        });
    }

    // Bathhouse Image Slider Logic (Multiple Sliders Support)
    const sliderWraps = document.querySelectorAll('.bathhouse-slider-wrap');
    sliderWraps.forEach((sliderWrap) => {
        const track = sliderWrap.querySelector('.slider-track');
        const slides = sliderWrap.querySelectorAll('.slide-item');
        const prevBtn = sliderWrap.querySelector('.prev-btn');
        const nextBtn = sliderWrap.querySelector('.next-btn');
        const dots = sliderWrap.querySelectorAll('.slider-dots .dot');
        let currentIndex = 0;
        let autoSlideInterval;

        if (!track || slides.length === 0) return;

        function updateSlider(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;

            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                updateSlider(currentIndex + 1);
            }, 4000);
        }

        function stopAutoSlide() {
            if (autoSlideInterval) clearInterval(autoSlideInterval);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateSlider(currentIndex - 1);
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateSlider(currentIndex + 1);
                startAutoSlide();
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                updateSlider(idx);
                startAutoSlide();
            });
        });

        sliderWrap.addEventListener('mouseenter', stopAutoSlide);
        sliderWrap.addEventListener('mouseleave', startAutoSlide);

        startAutoSlide();
    });
});

