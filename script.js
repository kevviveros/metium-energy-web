document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Efecto scroll en nav ---
    const nav = document.querySelector('nav.glass');
    if (nav) {
        const onScroll = () => {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // --- Navegación Mobile ---
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.setAttribute('data-lucide', navLinks.classList.contains('active') ? 'x' : 'menu');
            lucide.createIcons();
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const top = target.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Cálculo solar por rango de recibo ---
    const solarData = {
        'menos-1000': {
            panels:     '2 a 4',
            investment: '$20,000 – $40,000 MXN',
            roi:        '1.8 – 2.8 años',
            co2:        '1886',
            trees:      '94'
        },
        '1000-2500': {
            panels:     '4 a 8',
            investment: '$40,000 – $80,000 MXN',
            roi:        '1.5 – 2.5 años',
            co2:        '3772',
            trees:      '188'
        },
        '2500-5000': {
            panels:     '8 a 16',
            investment: '$80,000 – $160,000 MXN',
            roi:        '1.3 – 2.2 años',
            co2:        '7544',
            trees:      '377'
        },
        '5000-10000': {
            panels:     '16 a 30',
            investment: '$160,000 – $300,000 MXN',
            roi:        '1.2 – 2.0 años',
            co2:        '14160',
            trees:      '708'
        },
        'mas-10000': {
            panels:     '30+',
            investment: '$300,000+ MXN',
            roi:        '1.0 – 1.8 años',
            co2:        '28320',
            trees:      '1416'
        }
    };

    // --- Formulario de Contacto ---
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
            if (!gastoCFE || !gastoCFE.value) {
                gastoCFE.setCustomValidity('Selecciona tu rango de gasto.');
                gastoCFE.reportValidity(); return;
            }

            // Calcular
            const data = solarData[gastoCFE.value] || solarData['menos-1000'];
            const params = new URLSearchParams({
                panels:     data.panels,
                investment: data.investment,
                roi:        data.roi,
                co2:        data.co2,
                trees:      data.trees
            });

            window.location.href = `gracias.html?${params.toString()}`;
        });

        // Limpiar errores al escribir
        form.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', () => el.setCustomValidity(''));
            el.addEventListener('input',  () => el.setCustomValidity(''));
        });
    }

    // --- Solution Tabs (Para Casa / Para Negocio) ---
    document.querySelectorAll('.sol-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sol-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.solution-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    // --- FAQ Accordion (solo uno abierto) ---
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });

    // --- Animaciones al hacer Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // --- Testimonials Slider Logic ---
    const slider = document.getElementById('testimonialSlider');
    const dots = document.querySelectorAll('.nav-dots .dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    if (slider && dots.length > 0) {
        const updateDots = () => {
            const scrollLeft = slider.scrollLeft;
            const cardWidth = slider.querySelector('.testimonial-card').offsetWidth + 24; // width + gap
            const activeIndex = Math.round(scrollLeft / cardWidth);
            
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIndex);
            });
        };

        slider.addEventListener('scroll', updateDots);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const cardWidth = slider.querySelector('.testimonial-card').offsetWidth + 24;
                slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const cardWidth = slider.querySelector('.testimonial-card').offsetWidth + 24;
                slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });
        }

        // Dot clicking
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                const cardWidth = slider.querySelector('.testimonial-card').offsetWidth + 24;
                slider.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
            });
            // Make dots look clickable
            dot.style.cursor = 'pointer';
        });
    }

    document.querySelectorAll('.animate-fade-in, .glass, .metric-item, .process-step, .solution-card, .value-item').forEach(el => {
        observer.observe(el);
    });
});
