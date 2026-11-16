document.addEventListener("DOMContentLoaded", function() {
    // If sections are already present in DOM (index.html), initialize immediately
    if (document.getElementById('home')) {
        initializePortfolio();
        return;
    }

    // Fallback: If using placeholder injection (modular loading)
    const loadHTML = (filePath, placeholderId) => {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${filePath}`);
                return response.text();
            })
            .then(data => {
                const el = document.getElementById(placeholderId);
                if (el) el.innerHTML = data;
            })
            .catch(error => console.warn('Note loading HTML:', error));
    };

    Promise.all([
        loadHTML('sections/header.html', 'header-placeholder'),
        loadHTML('sections/home.html', 'home-placeholder'),
        loadHTML('sections/about.html', 'about-placeholder'),
        loadHTML('sections/skills.html', 'skills-placeholder'),
        loadHTML('sections/services.html', 'services-placeholder'),
        loadHTML('sections/qualifications.html', 'qualifications-placeholder'),
        loadHTML('sections/projects.html', 'projects-placeholder'),
        loadHTML('sections/contact.html', 'contact-placeholder'),
        loadHTML('sections/footer.html', 'footer-placeholder')
    ]).then(() => {
        initializePortfolio();
    });
});

function initializePortfolio() {
    /*=============== SAFE LUCIDE INITIALIZATION ===============*/
    try {
        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn('Lucide icon note:', e);
    }

    /*=============== THEME SWITCHER ===============*/
    const themeButton = document.getElementById('theme-button');
    const darkTheme = 'dark';

    const updateThemeIcon = () => {
        if (!themeButton) return;
        const isDarkMode = document.documentElement.classList.contains(darkTheme);
        themeButton.innerHTML = `<i data-lucide="${isDarkMode ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
        try {
            if (window.lucide) lucide.createIcons();
        } catch(e) {}
    };

    const applyInitialTheme = () => {
        const savedTheme = localStorage.getItem('selected-theme');
        // Default to clean light theme matching the mockup
        if (savedTheme === darkTheme) {
            document.documentElement.classList.add(darkTheme);
        } else {
            document.documentElement.classList.remove(darkTheme);
        }
        updateThemeIcon();
    };

    applyInitialTheme();

    if (themeButton) {
        themeButton.addEventListener('click', () => {
            document.documentElement.classList.toggle(darkTheme);
            const currentTheme = document.documentElement.classList.contains(darkTheme) ? darkTheme : 'light';
            localStorage.setItem('selected-theme', currentTheme);
            updateThemeIcon();
        });
    }

    /*=============== MOBILE NAVIGATION ===============*/
    const navMenu = document.getElementById('mobile-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navOverlay = document.getElementById('mobile-menu-overlay');

    const openMenu = () => {
        if (!navMenu) return;
        navMenu.classList.remove('-right-full');
        navMenu.classList.add('right-0');
        if (navOverlay) {
            navOverlay.classList.remove('hidden');
            requestAnimationFrame(() => navOverlay.classList.remove('opacity-0'));
        }
        document.body.classList.add('overflow-hidden');
    };

    const closeMenu = () => {
        if (!navMenu) return;
        navMenu.classList.remove('right-0');
        navMenu.classList.add('-right-full');
        if (navOverlay) {
            navOverlay.classList.add('opacity-0');
            setTimeout(() => navOverlay.classList.add('hidden'), 300);
        }
        document.body.classList.remove('overflow-hidden');
    };

    if (navToggle) navToggle.addEventListener('click', openMenu);
    if (navClose) navClose.addEventListener('click', closeMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    const navLinks = document.querySelectorAll('#mobile-menu .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    /*=============== HIGH-PERFORMANCE UNIFIED SCROLL HANDLER ===============*/
    const header = document.getElementById('header');
    const scrollUpBtn = document.getElementById('scroll-up');
    const sections = document.querySelectorAll('section[id]');
    const navPillLinks = document.querySelectorAll('.nav-tab');

    let cachedSectionOffsets = [];
    const updateCachedOffsets = () => {
        cachedSectionOffsets = Array.from(sections).map(sec => ({
            id: sec.getAttribute('id'),
            top: sec.offsetTop - 140,
            bottom: sec.offsetTop + sec.offsetHeight - 140
        }));
    };

    updateCachedOffsets();
    window.addEventListener('resize', updateCachedOffsets, { passive: true });
    window.addEventListener('load', updateCachedOffsets, { passive: true });

    let isHeaderScrolled = false;
    let isScrollUpVisible = false;
    let activeNavId = null;
    let scrollTicking = false;

    const onScrollTick = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const isDark = document.documentElement.classList.contains(darkTheme);

        // 1. Header scroll effect (state-checked to prevent layout thrashing)
        const shouldHeaderScroll = scrollY >= 30;
        if (shouldHeaderScroll !== isHeaderScrolled) {
            isHeaderScrolled = shouldHeaderScroll;
            if (header) {
                if (isHeaderScrolled) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
            }
        }

        // 2. Scroll to top button (state-checked)
        const shouldScrollUp = scrollY >= 400;
        if (shouldScrollUp !== isScrollUpVisible) {
            isScrollUpVisible = shouldScrollUp;
            if (scrollUpBtn) {
                if (isScrollUpVisible) {
                    scrollUpBtn.classList.remove('-bottom-1/4');
                    scrollUpBtn.classList.add('bottom-4', 'sm:bottom-6');
                } else {
                    scrollUpBtn.classList.remove('bottom-4', 'sm:bottom-6');
                    scrollUpBtn.classList.add('-bottom-1/4');
                }
            }
        }

        // 3. Active Nav tab indicator using pre-cached offsets (zero layout recalculations)
        let currentId = null;
        for (let i = 0; i < cachedSectionOffsets.length; i++) {
            const sec = cachedSectionOffsets[i];
            if (scrollY >= sec.top && scrollY < sec.bottom) {
                currentId = sec.id;
                break;
            }
        }

        if (currentId && currentId !== activeNavId) {
            activeNavId = currentId;
            const targetLink = document.querySelector(`.nav-tab[href="#${activeNavId}"]`);
            if (targetLink) {
                navPillLinks.forEach(item => {
                    item.classList.remove('active-link', 'text-black', 'font-semibold');
                    item.classList.add('text-gray-400');
                });
                targetLink.classList.add('active-link', 'text-black', 'font-semibold');
                targetLink.classList.remove('text-gray-400');
            }
        }

        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(onScrollTick);
            scrollTicking = true;
        }
    }, { passive: true });

    /*=============== PROJECT FILTER ===============*/
    const filterButtons = document.querySelectorAll('.project-filter');
    const projectItems = document.querySelectorAll('.project-item');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');
            const filterValue = button.getAttribute('data-filter');
            projectItems.forEach(item => {
                const category = item.getAttribute('data-category');
                item.style.display = (filterValue === 'all' || category === filterValue) ? 'block' : 'none';
            });
        });
    });

    /*=============== MOBILE VIEW ALL PROJECTS TOGGLE ===============*/
    const viewAllBtn = document.getElementById('view-all-projects-btn');
    const viewAllText = document.getElementById('view-all-projects-text');
    const viewAllIcon = document.getElementById('view-all-projects-icon');
    const extraProjects = document.querySelectorAll('.project-item-extra');

    if (viewAllBtn && extraProjects.length) {
        let isExpanded = false;
        viewAllBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            extraProjects.forEach(item => {
                if (isExpanded) {
                    item.classList.remove('hidden');
                    item.classList.add('flex');
                } else {
                    item.classList.remove('flex');
                    item.classList.add('hidden');
                }
            });

            if (viewAllText) {
                viewAllText.textContent = isExpanded ? 'Show Less' : 'View All Projects (6)';
            }
            if (viewAllIcon) {
                viewAllIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            if (!isExpanded) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            if (window.ScrollTrigger) {
                ScrollTrigger.refresh();
            }
        });
    }

    /*=============== CONTACT SECTION INTERACTION ===============*/
    initContactInteractions();

    /*=============== PRELOAD & INITIALIZE ENTRANCE ANIMATIONS ===============*/
    // Start entrance animations behind splash so everything is settled and ready
    initGSAPAnimations();

    /*=============== CINEMATIC MOVIE INTRO — CHAPTER ZERO ===============*/
    initCinematicOpeningIntro();
}

/*=============== CINEMATIC MOVIE INTRO — CHAPTER ZERO ===============*/
function initCinematicOpeningIntro() {
    const introRoot = document.getElementById('cinematic-intro');
    if (!introRoot) return;

    const skipBtn = document.getElementById('skip-intro-btn');
    const dustCanvas = document.getElementById('intro-dust-canvas');
    const chapterTag = document.getElementById('intro-chapter-tag');
    const statementAct = document.getElementById('intro-statement-act');
    const heroAct = document.getElementById('intro-hero-act');
    const taglineAct = document.getElementById('intro-tagline-act');
    const titleShimmer = document.querySelector('.intro-title-shimmer');
    const heroDivider = document.querySelector('.intro-hero-divider');

    // 1. Session Storage Guard: Avoid replaying in the same session unless ?intro= is passed in URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.has('intro');
    const hasSeenIntro = sessionStorage.getItem('deven_intro_seen');

    // 2. Prefers Reduced Motion Guard
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ((hasSeenIntro && !forceIntro) || prefersReducedMotion) {
        introRoot.style.display = 'none';
        introRoot.setAttribute('aria-hidden', 'true');
        return;
    }

    // Preload critical homepage assets silently in parallel
    const criticalAssets = [
        'images/hero-clean.png',
        'images/contact-clouds.jpg',
        'images/about-me.jpg',
        'images/logo.png',
        'images/projects/website-builder.png',
        'images/projects/medlookup.png'
    ];
    criticalAssets.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    let isDismissed = false;
    let dustAnimFrameId = null;
    let masterTimeline = null;
    let safetyTimeoutId = null;

    // ----------------------------------------------------
    // DUST PARTICLES ENGINE (Subtle, Atmospheric Film Dust)
    // ----------------------------------------------------
    function initDustSimulation() {
        if (!dustCanvas) return null;
        const ctx = dustCanvas.getContext('2d');
        if (!ctx) return null;

        let width = (dustCanvas.width = window.innerWidth);
        let height = (dustCanvas.height = window.innerHeight);

        const handleResize = () => {
            if (isDismissed || !dustCanvas) return;
            width = dustCanvas.width = window.innerWidth;
            height = dustCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const particleCount = window.innerWidth < 640 ? 22 : 45;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.6,
                baseAlpha: Math.random() * 0.35 + 0.15,
                alpha: 0.2,
                vx: (Math.random() - 0.5) * 0.25,
                vy: -(Math.random() * 0.35 + 0.12), // gentle upward float
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: Math.random() * 0.02 + 0.01
            });
        }

        function renderDust() {
            if (isDismissed) return;
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.phase += p.phaseSpeed;
                p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.12;
                if (p.alpha < 0.05) p.alpha = 0.05;

                p.x += p.vx + Math.sin(p.phase * 0.5) * 0.15;
                p.y += p.vy;

                // Wrap-around screen bounds
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(235, 220, 190, ${p.alpha})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(197, 160, 89, 0.4)';
                ctx.fill();
            }

            dustAnimFrameId = requestAnimationFrame(renderDust);
        }

        renderDust();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (dustAnimFrameId) cancelAnimationFrame(dustAnimFrameId);
        };
    }

    const cleanupDust = initDustSimulation();

    // ----------------------------------------------------
    // CLEANUP & DISMISS TO PORTFOLIO
    // ----------------------------------------------------
    function dismissIntro(immediate = false) {
        if (isDismissed) return;
        isDismissed = true;

        if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
        if (cleanupDust) cleanupDust();

        sessionStorage.setItem('deven_intro_seen', 'true');

        if (masterTimeline) {
            masterTimeline.kill();
        }

        if (immediate || !window.gsap) {
            introRoot.style.opacity = '0';
            introRoot.style.display = 'none';
            introRoot.setAttribute('aria-hidden', 'true');
            if (window.ScrollTrigger) ScrollTrigger.refresh();
            return;
        }

        // Cinematic exit transition: smooth expanding camera zoom & dissolve into homepage
        gsap.to(introRoot, {
            opacity: 0,
            scale: 1.04,
            filter: 'blur(6px)',
            duration: 0.85,
            ease: 'power2.inOut',
            onComplete: () => {
                introRoot.style.display = 'none';
                introRoot.setAttribute('aria-hidden', 'true');
                if (window.ScrollTrigger) ScrollTrigger.refresh();
            }
        });
    }

    // Skip Intro button listener
    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dismissIntro(false);
        });
    }

    // Fallback safety timeout: guarantee entrance to portfolio after 9.5s
    safetyTimeoutId = setTimeout(() => {
        dismissIntro(false);
    }, 9500);

    // ----------------------------------------------------
    // GSAP 8-SECOND CINEMATIC MASTER TIMELINE
    // ----------------------------------------------------
    if (!window.gsap) {
        // Fallback if GSAP is blocked or unavailable
        setTimeout(() => dismissIntro(false), 3000);
        return;
    }

    masterTimeline = gsap.timeline({
        onComplete: () => {
            dismissIntro(false);
        }
    });

    // Initial setup: ensure all acts are hidden
    gsap.set([statementAct, heroAct, taglineAct], { opacity: 0 });
    gsap.set(skipBtn, { opacity: 0 });
    gsap.set(chapterTag, { opacity: 0, y: -8 });

    // Fade in subtle "SKIP INTRO →" button after 0.8s
    masterTimeline.to(skipBtn, {
        opacity: 0.75,
        duration: 1.0,
        ease: 'power1.out'
    }, 0.8);

    // === ACT 0 (0–2s): Atmospheric movie opening & Chapter Tag ===
    masterTimeline.to(chapterTag, {
        opacity: 0.75,
        y: 0,
        duration: 1.4,
        ease: 'power2.out'
    }, 0.4);

    // === ACT 1 (2–4s): "EVERYTHING STARTS WITH AN IDEA" ===
    const statementText = document.querySelector('.intro-statement-text');
    masterTimeline.set(statementAct, { opacity: 1, pointerEvents: 'auto' }, 2.0);

    masterTimeline.fromTo(statementText, 
        {
            opacity: 0,
            filter: 'blur(12px)',
            letterSpacing: '0.15em',
            scale: 0.96
        },
        {
            opacity: 1,
            filter: 'blur(0px)',
            letterSpacing: '0.30em',
            scale: 1.02,
            duration: 0.85,
            ease: 'power2.out'
        },
        2.0
    );

    // Fade out Act 1 smoothly
    masterTimeline.to(statementText, {
        opacity: 0,
        filter: 'blur(8px)',
        scale: 1.05,
        duration: 0.5,
        ease: 'power2.in'
    }, 3.5);

    masterTimeline.set(statementAct, { opacity: 0, pointerEvents: 'none' }, 4.0);

    // === ACT 2 (4–6s): "DEVEN RAJPUT" — The Hero Moment ===
    const heroWrapper = document.querySelector('.intro-hero-wrapper');
    const heroPretitle = document.querySelector('.intro-hero-pretitle');
    const heroTitle = document.querySelector('.intro-hero-title');

    masterTimeline.set(heroAct, { opacity: 1, pointerEvents: 'auto' }, 4.0);

    // Camera slow push-in zoom on hero title
    masterTimeline.fromTo(heroWrapper,
        { scale: 0.94 },
        { scale: 1.03, duration: 1.9, ease: 'sine.out' },
        4.0
    );

    // Pretitle: A DIGITAL EXPERIENCE BY
    masterTimeline.fromTo(heroPretitle,
        { opacity: 0, y: -6 },
        { opacity: 0.85, y: 0, duration: 0.7, ease: 'power2.out' },
        4.05
    );

    // Hero title blur to focus (fast to crystal sharpness, held in spotlight)
    masterTimeline.fromTo(heroTitle,
        { opacity: 0, filter: 'blur(14px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
        4.1
    );

    // Cinematic light sweep across "DEVEN RAJPUT"
    if (titleShimmer) {
        masterTimeline.fromTo(titleShimmer,
            { backgroundPosition: '130% 0' },
            { backgroundPosition: '-30% 0', duration: 1.7, ease: 'power1.inOut' },
            4.15
        );
    }

    // Gold accent line expands under title
    if (heroDivider) {
        masterTimeline.fromTo(heroDivider,
            { width: '0px' },
            { width: '120px', duration: 0.85, ease: 'power2.out' },
            4.35
        );
    }

    // Fade out Act 2 smoothly
    masterTimeline.to(heroWrapper, {
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.5,
        ease: 'power2.in'
    }, 5.5);

    masterTimeline.set(heroAct, { opacity: 0, pointerEvents: 'none' }, 6.0);

    // === ACT 3 (6–8s): The Taglines ===
    const taglineWrapper = document.querySelector('.intro-tagline-wrapper');
    const taglineHeadline = document.querySelector('.intro-tagline-headline');
    const taglineSubheadline = document.querySelector('.intro-tagline-subheadline');

    masterTimeline.set(taglineAct, { opacity: 1, pointerEvents: 'auto' }, 6.05);

    // Gentle upward motion and blur-to-focus on main tagline
    masterTimeline.fromTo(taglineHeadline,
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, ease: 'power2.out' },
        6.1
    );

    // Subheadline: FULL STACK DEVELOPER • APP DEVELOPER • AI ENTHUSIAST
    masterTimeline.fromTo(taglineSubheadline,
        { opacity: 0, y: 14 },
        { opacity: 0.92, y: 0, duration: 0.8, ease: 'power2.out' },
        6.35
    );

    // Gentle camera drift
    masterTimeline.fromTo(taglineWrapper,
        { scale: 0.98 },
        { scale: 1.015, duration: 1.85, ease: 'sine.out' },
        6.1
    );

    // === AT 8.0s: Reveal Portfolio Homepage ===
    // Timeline finishes at 8.0s and calls onComplete: dismissIntro()
}

function initGSAPAnimations() {
    if (!window.gsap) return;

    try {
        // Respect prefers-reduced-motion
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            gsap.set(".hero-word, .hero-supporting-text, .hero-bio-desc, .hero-cta-group a, .hero-exp-card, .hero-stat-item, .hero-scroll-indicator, .hero-eyebrow-tag", {
                opacity: 1,
                y: 0,
                clearProps: "all"
            });
            animateStatsCounters();
            return;
        }

        // 1. Entrance timeline with clearProps so elements NEVER get stuck hidden
        const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            onComplete: () => {
                // Ensure all elements have cleared inline opacity and transform
                gsap.set(".hero-word, .hero-supporting-text, .hero-bio-desc, .hero-cta-group a, .hero-exp-card, .hero-stat-item, .hero-scroll-indicator, .hero-eyebrow-tag", {
                    clearProps: "opacity,transform"
                });
            }
        });

        // Header drop-in
        tl.fromTo("#header",
            { y: -25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: "all" }
        )
        // Studio portrait gentle zoom and opacity settle
        .fromTo(".hero-portrait-img",
            { scale: 1.06, opacity: 0.2 },
            { scale: 1, opacity: 0.75, duration: 0.9, ease: "power2.out", clearProps: "transform" },
            "-=0.4"
        )
        // Eyebrow tag
        .fromTo(".hero-eyebrow-tag",
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "all" },
            "-=0.6"
        )
        // Supporting role tag
        .fromTo(".hero-supporting-text",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "all" },
            "-=0.4"
        )
        // Word-by-word reveal for: BUILDING IDEAS INTO REALITY.
        .fromTo(".hero-word",
            { y: 45, opacity: 0, rotateZ: 1.5 },
            { y: 0, opacity: 1, rotateZ: 0, duration: 0.65, stagger: 0.06, ease: "power3.out", clearProps: "all" },
            "-=0.4"
        )
        // Bio paragraph
        .fromTo(".hero-bio-desc",
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", clearProps: "all" },
            "-=0.4"
        )
        // CTA buttons
        .fromTo(".hero-cta-group a",
            { scale: 0.94, opacity: 0, y: 10 },
            { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.5)", clearProps: "all" },
            "-=0.35"
        )
        // Floating experience/social card
        .fromTo(".hero-exp-card",
            { y: -15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.4)", clearProps: "all" },
            "-=0.5"
        )
        // Stats row & scroll indicator
        .fromTo(".hero-stat-item, .hero-scroll-indicator",
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, clearProps: "all" },
            "-=0.3"
        );

        // Live stats counting animation
        animateStatsCounters();

        // Idle floating physics for the EXP card
        gsap.to(".hero-exp-card", {
            y: "-=8",
            duration: 2.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // 3D Parallax Mouse Interactivity on Hero Section
        initHeroMouseParallax();

        // ScrollTrigger Parallax on Portrait
        if (window.ScrollTrigger && document.querySelector('.hero-portrait-img')) {
            gsap.to('.hero-portrait-img', {
                yPercent: 12,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#home',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });
        }

        // ScrollTrigger animations for About section
        initAboutAnimations();

        // ScrollTrigger animations for Services section
        initServicesAnimations();

        // ScrollTrigger animations for Projects section
        initProjectsAnimations();

        // ScrollTrigger animations for Contact section
        initContactAnimations();

    } catch (err) {
        console.warn('GSAP animation warning:', err);
    }
}

/*=============== STATS NUMBER COUNT-UP ===============*/
function animateStatsCounters() {
    const statElements = document.querySelectorAll('.stat-number');
    statElements.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        const isK = el.getAttribute('data-format') === 'k';
        const obj = { val: 0 };

        gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: "power2.out",
            delay: 0.4,
            onUpdate: () => {
                if (isDecimal) {
                    el.textContent = `${obj.val.toFixed(1)}${suffix}`;
                } else if (isK) {
                    const formatted = Math.floor(obj.val / 1000);
                    el.textContent = `${formatted}k${suffix}`;
                } else {
                    el.textContent = `${Math.floor(obj.val)}${suffix}`;
                }
            }
        });
    });
}

/*=============== 3D MOUSE PARALLAX ===============*/
function initHeroMouseParallax() {
    const heroSection = document.getElementById('home');
    const portrait = document.querySelector('.hero-portrait-img');
    const ambientGlow = document.querySelector('.hero-ambient-glow');
    const expCard = document.querySelector('.hero-exp-card');

    if (!heroSection) return;
    // Don't bind mouse parallax on touch/mobile devices to save battery & CPU
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let heroRect = null;
    let parallaxTicking = false;

    heroSection.addEventListener('mouseenter', () => {
        heroRect = heroSection.getBoundingClientRect();
    }, { passive: true });

    heroSection.addEventListener('mousemove', (e) => {
        if (!parallaxTicking) {
            requestAnimationFrame(() => {
                if (!heroRect) heroRect = heroSection.getBoundingClientRect();
                const x = (e.clientX - heroRect.left) / heroRect.width - 0.5;
                const y = (e.clientY - heroRect.top) / heroRect.height - 0.5;

                if (portrait) {
                    gsap.to(portrait, {
                        x: x * 18,
                        y: y * 12,
                        duration: 0.9,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                }

                if (ambientGlow) {
                    gsap.to(ambientGlow, {
                        x: -x * 35,
                        y: -y * 25,
                        duration: 1.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                }

                if (expCard) {
                    gsap.to(expCard, {
                        x: -x * 15,
                        y: -y * 10,
                        duration: 0.8,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                }
                parallaxTicking = false;
            });
            parallaxTicking = true;
        }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
        heroRect = null;
        if (portrait) gsap.to(portrait, { x: 0, y: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        if (ambientGlow) gsap.to(ambientGlow, { x: 0, y: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        if (expCard) gsap.to(expCard, { x: 0, y: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    }, { passive: true });
}

/*=============== REUSABLE CINEMATIC ANIMATION UTILITIES ===============*/
window.cinematicUtils = {
    revealTextWords: (selector, options = {}) => {
        if (!window.gsap) return;
        const targets = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
        return gsap.fromTo(targets, 
            { y: options.y || 45, opacity: 0 },
            { y: 0, opacity: 1, duration: options.duration || 0.8, stagger: options.stagger || 0.08, ease: "power3.out", clearProps: "all" }
        );
    },
    revealFadeUp: (selector, options = {}) => {
        if (!window.gsap) return;
        const targets = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
        return gsap.fromTo(targets,
            { y: options.y || 30, opacity: 0 },
            { y: 0, opacity: 1, duration: options.duration || 0.7, stagger: options.stagger || 0.1, ease: "power2.out", clearProps: "all" }
        );
    }
};

/*=============== ABOUT SECTION ANIMATIONS ===============*/
function initAboutAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.innerWidth < 768) return; // Immediate visibility on mobile devices

    try {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".about-card", {
            scrollTrigger: {
                trigger: "#about",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all"
        });

        gsap.from(".about-col-left, .about-col-center, .about-col-right", {
            scrollTrigger: {
                trigger: ".about-card",
                start: "top 75%",
                toggleActions: "play none none none"
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            clearProps: "all"
        });

        // 120% counter count-up
        const counter = document.querySelector('.about-counter');
        if (counter) {
            ScrollTrigger.create({
                trigger: counter,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    const target = parseFloat(counter.getAttribute('data-target')) || 120;
                    const suffix = counter.getAttribute('data-suffix') || '%';
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.8,
                        ease: "power2.out",
                        onUpdate: () => {
                            counter.textContent = `${Math.floor(obj.val)}${suffix}`;
                        }
                    });
                }
            });
        }
    } catch (e) {
        console.warn("About GSAP Error:", e);
    }
}

/*=============== SERVICES SECTION ANIMATIONS ===============*/
function initServicesAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.innerWidth < 768) return; // Immediate visibility on mobile devices

    try {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from("#services .service-card", {
            scrollTrigger: {
                trigger: "#services",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 35,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            clearProps: "all"
        });
    } catch (e) {
        console.warn("Services GSAP Error:", e);
    }
}

/*=============== PROJECTS SECTION ANIMATIONS ===============*/
function initProjectsAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.innerWidth < 768) return; // Immediate visibility on mobile devices

    try {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".projects-master-card", {
            scrollTrigger: {
                trigger: "#projects",
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all"
        });

        gsap.from("#projects .project-item", {
            scrollTrigger: {
                trigger: "#projects",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all"
        });
    } catch (e) {
        console.warn("Projects GSAP Error:", e);
    }
}

/*=============== CONTACT SECTION ANIMATIONS ===============*/
function initContactAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.innerWidth < 768) return; // Immediate visibility on mobile devices

    try {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".contact-master-card", {
            scrollTrigger: {
                trigger: "#contact",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            y: 40,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "all"
        });
    } catch (e) {
        console.warn("Contact GSAP Error:", e);
    }
}

/*=============== CONTACT SECTION INTERACTION ===============*/
function initContactInteractions() {
    const ctaView = document.getElementById('contact-cta-view');
    const formView = document.getElementById('contact-form-view');
    const openBtn = document.getElementById('open-contact-form-btn');
    const closeBtn = document.getElementById('close-contact-form-btn');
    const form = document.getElementById('project-contact-form');
    const feedback = document.getElementById('form-feedback');
    const nameInput = document.getElementById('form-name');

    if (!ctaView || !formView) return;

    const showForm = () => {
        ctaView.style.opacity = '0';
        ctaView.style.transform = 'scale(0.96)';
        setTimeout(() => {
            ctaView.classList.add('hidden');
            formView.classList.remove('hidden');
            setTimeout(() => {
                formView.classList.remove('opacity-0', 'scale-95');
                formView.classList.add('opacity-100', 'scale-100');
                if (nameInput) nameInput.focus();
            }, 30);
        }, 250);
    };

    const hideForm = () => {
        formView.classList.remove('opacity-100', 'scale-100');
        formView.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            formView.classList.add('hidden');
            ctaView.classList.remove('hidden');
            setTimeout(() => {
                ctaView.style.opacity = '1';
                ctaView.style.transform = 'scale(1)';
            }, 30);
        }, 250);
    };

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideForm();
        });
    }

    // Connect any "Let's talk" buttons to open the form directly
    const talkButtons = document.querySelectorAll('a[href="#contact"]');
    talkButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(showForm, 400);
        });
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('form-submit-btn');
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const messageInput = document.getElementById('form-message');
            const honeyInput = form.querySelector('input[name="_honey"]');

            // Honeypot bot protection
            if (honeyInput && honeyInput.value) {
                return;
            }

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !email || !message) {
                if (feedback) {
                    feedback.className = 'p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm text-center font-medium';
                    feedback.textContent = 'Please fill out all fields before sending.';
                    feedback.classList.remove('hidden');
                }
                return;
            }

            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Sending message...</span>
                `;
            }

            const openMailtoFallback = () => {
                const mailtoUrl = `mailto:devenrajput30209@gmail.com?subject=${encodeURIComponent('Project Inquiry from ' + name)}&body=${encodeURIComponent('Hi Deven,\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
                window.location.href = mailtoUrl;
            };

            const escapeHTML = (str) => {
                const p = document.createElement('p');
                p.textContent = str;
                return p.innerHTML;
            };

            try {
                const response = await fetch('https://formsubmit.co/ajax/devenrajput30209@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message,
                        _subject: `New Portfolio Inquiry from ${name}`,
                        _captcha: 'false',
                        _template: 'table'
                    })
                });

                const data = await response.json();

                if (response.ok && (data.success === 'true' || data.success === true)) {
                    if (feedback) {
                        feedback.className = 'p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium leading-relaxed';
                        feedback.innerHTML = `✨ <strong>Thank you, ${escapeHTML(name)}!</strong><br>Your message has been delivered directly to <a href="mailto:devenrajput30209@gmail.com" class="underline font-semibold">devenrajput30209@gmail.com</a>. I'll get back to you shortly.`;
                        feedback.classList.remove('hidden');
                    }
                    if (submitBtn) {
                        submitBtn.innerHTML = `<span>Sent Successfully! ✓</span>`;
                    }
                    form.reset();
                } else if (data.message && data.message.includes('Activation')) {
                    if (feedback) {
                        feedback.className = 'p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium leading-relaxed';
                        feedback.innerHTML = `✨ <strong>Message Received!</strong> FormSubmit sent a one-time activation confirmation to <a href="mailto:devenrajput30209@gmail.com" class="underline font-semibold">devenrajput30209@gmail.com</a>. Opening your mail app as immediate backup...`;
                        feedback.classList.remove('hidden');
                    }
                    if (submitBtn) {
                        submitBtn.innerHTML = `<span>Message Sent! ✓</span>`;
                    }
                    setTimeout(openMailtoFallback, 1200);
                    form.reset();
                } else {
                    throw new Error(data.message || 'Submission error');
                }
            } catch (err) {
                console.warn('Form submission fallback:', err);
                if (feedback) {
                    feedback.className = 'p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm text-center font-medium leading-relaxed';
                    feedback.innerHTML = `📬 Opening your mail app to send your message directly to <a href="mailto:devenrajput30209@gmail.com" class="underline font-semibold">devenrajput30209@gmail.com</a>...`;
                    feedback.classList.remove('hidden');
                }
                setTimeout(openMailtoFallback, 800);
            } finally {
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHTML;
                    }
                }, 5000);
            }
        });
    }
}

// Refresh ScrollTrigger when images load
window.addEventListener('load', () => {
    if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
    }
});
