document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INICIALIZAR LUCIDE
    // ─────────────────────────────────────────────────────────────────────────
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CACHÉ DE REFERENCIAS DOM (se consultan una sola vez)
    // ─────────────────────────────────────────────────────────────────────────
    const nav             = document.querySelector('nav.glass');
    const navToggle       = document.getElementById('navToggle');
    const navLinks        = document.getElementById('navLinks');
    const formSection     = document.getElementById('formulario');
    const formContainer   = formSection?.querySelector('.contact-form-container');
    const formTitle       = formSection?.querySelector('.section-header h2');
    const firstInput      = document.getElementById('nombreCompleto');
    const formOrigen      = document.getElementById('formOrigen');
    const ORIGINAL_TITLE  = formTitle?.textContent ?? 'Cotiza tus paneles solares';

    // ─────────────────────────────────────────────────────────────────────────
    // 3. EFECTO SCROLL EN NAV
    // ─────────────────────────────────────────────────────────────────────────
    if (nav) {
        const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. HELPER: CERRAR MENÚ MOBILE
    // ─────────────────────────────────────────────────────────────────────────
    const closeMenu = () => {
        if (!navLinks?.classList.contains('active')) return;
        navLinks.classList.remove('active');
        const icon = navToggle?.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 5. NAVEGACIÓN MOBILE
    // ─────────────────────────────────────────────────────────────────────────
    if (navToggle && navLinks) {
        const toggleMenu = (show) => {
            const isShowing = show !== undefined ? show : !navLinks.classList.contains('active');
            navLinks.classList.toggle('active', isShowing);
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isShowing ? 'x' : 'menu');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Cerrar al hacer clic fuera del menú
        document.addEventListener('click', (e) => {
            if (
                navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !navToggle.contains(e.target)
            ) closeMenu();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. PRESELECCIÓN Y PERSONALIZACIÓN DEL FORMULARIO POR ORIGEN
    //    Cada botón puede tener data-origin="casa|empresa|financiamiento"
    //    para adaptar el título del formulario y registrar el origen del lead.
    // ─────────────────────────────────────────────────────────────────────────
    const FORM_ORIGIN_TITLES = {
        casa:           'Cotiza tu sistema residencial',
        empresa:        'Cotiza tu sistema empresarial',
        financiamiento: 'Conoce tus opciones de financiamiento',
    };

    const applyFormOrigin = (origin) => {
        if (formTitle) {
            formTitle.textContent = FORM_ORIGIN_TITLES[origin] ?? ORIGINAL_TITLE;
        }
        if (formOrigen) {
            formOrigen.value = origin ?? 'general';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 7. EVENT DELEGATION: SMOOTH SCROLL (un único listener en el documento)
    //    Reemplaza los N listeners individuales por uno solo eficiente.
    // ─────────────────────────────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.getElementById(href.slice(1));
        if (!target) return;

        e.preventDefault();
        
        // Actualizamos la URL sin causar el salto nativo abrupto
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, href);
        }

        closeMenu();

        // Personalizar formulario según el botón que originó el clic
        if (href === '#formulario') {
            applyFormOrigin(anchor.dataset.origin);
        }

        // ── SCROLL "A PRUEBA DE BALAS" (MISSILE TRACKING) ──
        // 1. Inicia el viaje hacia el objetivo.
        target.scrollIntoView({ behavior: 'smooth' });

        // 2. Correcciones en vuelo (Double-Check):
        // Si la barra de Android se oculta o alguna fuente estira la página 
        // mientras bajamos, esto recalcula y corrige el destino casi invisiblemente.
        setTimeout(() => { target.scrollIntoView({ behavior: 'smooth' }); }, 500);
        setTimeout(() => { target.scrollIntoView({ behavior: 'smooth' }); }, 1200);

        // ── UX extras al llegar al formulario ──────────────────────────────
        if (href === '#formulario') {
            // Highlight: pulso de brillo en el contenedor del formulario
            if (formContainer) {
                formContainer.classList.remove('form-highlight');
                void formContainer.offsetWidth; // forzar reflow para reiniciar animación
                formContainer.classList.add('form-highlight');
            }
            // Auto-focus solo en desktop (en móvil abre el teclado de forma brusca)
            if (window.innerWidth >= 768 && firstInput) {
                setTimeout(() => firstInput.focus(), 700);
            }
        }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 8. FORMULARIO DE CONTACTO: VALIDACIÓN Y ENVÍO
    // ─────────────────────────────────────────────────────────────────────────
    const solarData = {
        'menos-1000': { panels: '2 a 4',   investment: '$20,000 – $40,000 MXN',   roi: '1.8 – 2.8 años', co2: '1886',  trees: '94'   },
        '1000-2500':  { panels: '4 a 8',   investment: '$40,000 – $80,000 MXN',   roi: '1.5 – 2.5 años', co2: '3772',  trees: '188'  },
        '2500-5000':  { panels: '8 a 16',  investment: '$80,000 – $160,000 MXN',  roi: '1.3 – 2.2 años', co2: '7544',  trees: '377'  },
        '5000-10000': { panels: '16 a 30', investment: '$160,000 – $300,000 MXN', roi: '1.2 – 2.0 años', co2: '14160', trees: '708'  },
        'mas-10000':  { panels: '30+',     investment: '$300,000+ MXN',           roi: '1.0 – 1.8 años', co2: '28320', trees: '1416' },
    };

    const form = document.getElementById('solarCalculator');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre   = document.getElementById('nombreCompleto');
            const telefono = document.getElementById('telefono');
            const email    = document.getElementById('correoExp');
            const gastoCFE = document.getElementById('gastoCFE');

            // Validaciones
            if (!nombre.value.trim()) {
                nombre.setCustomValidity('Ingresa tu nombre completo.');
                nombre.reportValidity(); return;
            }
            if (!/^\d{10}$/.test(telefono.value.trim())) {
                telefono.setCustomValidity('Ingresa un número de 10 dígitos.');
                telefono.reportValidity(); return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                email.setCustomValidity('Ingresa un correo válido.');
                email.reportValidity(); return;
            }
            if (!gastoCFE?.value) {
                gastoCFE.setCustomValidity('Selecciona tu rango de gasto.');
                gastoCFE.reportValidity(); return;
            }

            const data   = solarData[gastoCFE.value] ?? solarData['menos-1000'];
            const params = new URLSearchParams({
                panels:      data.panels,
                investment:  data.investment,
                roi:         data.roi,
                co2:         data.co2,
                trees:       data.trees,
                rango_gasto: gastoCFE.value,
            });

            fetch('/', {
                method:  'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body:    new URLSearchParams(new FormData(form)).toString(),
            })
            .then(()  => { window.location.href = `gracias.html?${params}`; })
            .catch(() => { window.location.href = `gracias.html?${params}`; });
        });

        // Limpiar errores de validación en tiempo real
        form.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', () => el.setCustomValidity(''));
            el.addEventListener('input',  () => el.setCustomValidity(''));
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. SOLUTION TABS (Para Casa / Para Negocio)
    // ─────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('.sol-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sol-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.solution-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 10. FAQ ACCORDION (solo un ítem abierto a la vez)
    // ─────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 11. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
    // ─────────────────────────────────────────────────────────────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll(
        '.animate-fade-in, .glass, .metric-item, .process-step, .solution-card, .value-item'
    ).forEach(el => observer.observe(el));

    // ─────────────────────────────────────────────────────────────────────────
    // 12. TESTIMONIALS SLIDER (cardWidth cacheado + debounce en resize)
    // ─────────────────────────────────────────────────────────────────────────
    const slider  = document.getElementById('testimonialSlider');
    const dots    = document.querySelectorAll('.nav-dots .dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    if (slider && dots.length > 0) {
        // Cachear cardWidth para no hacer reflow en cada evento
        let cardWidth = 0;
        const refreshCardWidth = () => {
            const card = slider.querySelector('.testimonial-card');
            cardWidth  = card ? card.offsetWidth + 24 : 0; // ancho + gap
        };
        refreshCardWidth();

        // Recalcular solo cuando cambia el tamaño de ventana (con debounce)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(refreshCardWidth, 150);
        }, { passive: true });

        const updateDots = () => {
            const activeIndex = cardWidth ? Math.round(slider.scrollLeft / cardWidth) : 0;
            dots.forEach((dot, idx) => dot.classList.toggle('active', idx === activeIndex));
        };

        slider.addEventListener('scroll', updateDots, { passive: true });

        prevBtn?.addEventListener('click', () => slider.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
        nextBtn?.addEventListener('click', () => slider.scrollBy({ left:  cardWidth, behavior: 'smooth' }));

        dots.forEach((dot, idx) => {
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', () =>
                slider.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
            );
        });
    }

});
