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

    // R&D / Project View Button Click Handler
    const rdTrigger = document.getElementById('rdProjectTabTrigger');
    if (rdTrigger) {
        rdTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            const rdTabItem = document.querySelector('.sub-category-item[href="#rd-project"]');
            if (rdTabItem) {
                rdTabItem.click();
                const subCatBar = document.querySelector('.sub-category-bar');
                if (subCatBar) {
                    window.scrollTo({ top: subCatBar.offsetTop - 90, behavior: 'smooth' });
                }
            }
        });
    }
});

