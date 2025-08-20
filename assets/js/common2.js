document.addEventListener('DOMContentLoaded', function() {

    // Page Load Animation
    window.addEventListener('load', function() {
        document.body.classList.add('is-loaded');
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.global-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('is-active');
            nav.classList.toggle('is-active');
        });
    }

    // Scroll Fade-in Animation
    const targets = document.querySelectorAll('.column-section, .service-section');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach(target => {
        observer.observe(target);
    });

    // Three.js Sparkle Effect - V2
    let scene, camera, renderer, particles, geometry;
    const particleCount = 2000;

    function initThreeJS() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particles
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        const colorPalette = [new THREE.Color(0xffffff), new THREE.Color(0xccffcc), new THREE.Color(0xffffcc)];

        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // Color
            const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            randomColor.toArray(colors, i * 3);

            // Size
            sizes[i] = Math.random() * 2.5 + 0.5; // More size variation

            // Opacity
            opacities[i] = Math.random() * 0.5 + 0.4; // Random opacity
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('customOpacity', new THREE.BufferAttribute(opacities, 1));

        // We need a custom shader to handle random opacity per particle
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                attribute float customOpacity;
                varying vec3 vColor;
                varying float vOpacity;
                void main() {
                    vColor = customColor;
                    vOpacity = customOpacity;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_PointSize = size * ( 300.0 / -mvPosition.z );
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                void main() {
                    float r = 0.0, delta = 0.0, alpha = 1.0;
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    r = dot(cxy, cxy);
                    if (r > 1.0) {
                        discard;
                    }
                    gl_FragColor = vec4( vColor, vOpacity );
                }
            `,
            blending: THREE.NormalBlending, // Changed from AdditiveBlending
            depthTest: false,
            transparent: true,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        // Animate particles
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            // Move particle up
            positions[i * 3 + 1] += 0.1;

            // Reset particle to bottom if it goes off screen
            if (positions[i * 3 + 1] > 100) {
                positions[i * 3 + 1] = -100;
            }
        }
        geometry.attributes.position.needsUpdate = true; // This is important!

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    initThreeJS();

});
