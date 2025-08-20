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

    // Three.js Sparkle Effect - V4 (Customizable)
    const scenes = [];

    const sceneConfigurations = [
        {
            id: 'hero-canvas',
            particleCount: 2000,
            colorPalette: [
                new THREE.Color(0xffffff), 
                new THREE.Color(0xccffcc), 
                new THREE.Color(0xffffcc)
            ],
            sizeRange: [0.5, 2.5],
            animationType: 'rising',
            blending: THREE.NormalBlending,
            fragmentShaderType: 'simple'
        },
        {
            id: 'column-canvas',
            particleCount: 50, // Fewer, larger particles
            colorPalette: [
                new THREE.Color(0xffffff), 
                new THREE.Color(0xffff00), // Yellow
                new THREE.Color(0xffa500), // Orange
                new THREE.Color(0xadff2f)  // GreenYellow
            ],
            sizeRange: [10, 40], // Much larger
            animationType: 'expanding',
            blending: THREE.AdditiveBlending,
            fragmentShaderType: 'flare'
        },
        {
            id: 'access-canvas',
            particleCount: 50,
            colorPalette: [
                new THREE.Color(0xffffff), 
                new THREE.Color(0xffff00), // Yellow
                new THREE.Color(0xffa500), // Orange
                new THREE.Color(0xadff2f)  // GreenYellow
            ],
            sizeRange: [10, 40],
            animationType: 'expanding',
            blending: THREE.AdditiveBlending,
            fragmentShaderType: 'flare'
        }
    ];

    const fragmentShaders = {
        simple: `
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
        flare: `
            varying vec3 vColor;
            varying float vOpacity;
            void main() {
                float r = dot(gl_PointCoord - 0.5, gl_PointCoord - 0.5);
                if (r > 0.25) {
                    discard;
                }
                float alpha = (1.0 - r * 4.0) * vOpacity;
                gl_FragColor = vec4(vColor, alpha);
            }
        `
    };

    function createScene(config) {
        const canvas = document.getElementById(config.id);
        if (!canvas) return null;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const geometry = new THREE.BufferGeometry();
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
            fragmentShader: fragmentShaders[config.fragmentShaderType || 'flare'],
            blending: config.blending || THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        const sceneData = { scene, camera, renderer, geometry, canvas, config };
        
        // Initialize attributes based on config
        initializeParticles(sceneData);

        return sceneData;
    }

    function initializeParticles(sceneData) {
        const { geometry, config } = sceneData;
        const { particleCount, colorPalette, sizeRange } = config;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        const animationProps = {
            velocities: new Float32Array(particleCount * 2), // x, y for each
            initialSizes: new Float32Array(particleCount),
            animationStates: [] // 'fading_in' or 'fading_out'
        };

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            randomColor.toArray(colors, i * 3);

            const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
            sizes[i] = size;
            animationProps.initialSizes[i] = size;
            
            animationProps.velocities[i * 2] = (Math.random() - 0.5) * 0.1; // velocityX
            animationProps.velocities[i * 2 + 1] = Math.random() * 0.1 + 0.05; // Y velocity for rising

            // Set opacity and animation state based on type
            if (config.animationType === 'rising') {
                opacities[i] = Math.random() * 0.5 + 0.4; // Random opacity like in common2.js
            } else { // expanding
                if (Math.random() > 0.5) {
                    animationProps.animationStates[i] = 'fading_in';
                    opacities[i] = 0;
                } else {
                    animationProps.animationStates[i] = 'fading_out';
                    opacities[i] = Math.random() * 0.5 + 0.2;
                }
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('customOpacity', new THREE.BufferAttribute(opacities, 1));
        
        sceneData.animationProps = animationProps;
    }


    function initThreeJS() {
        sceneConfigurations.forEach(config => {
            const sceneData = createScene(config);
            if (sceneData) {
                scenes.push(sceneData);
            }
        });

        if (scenes.length > 0) {
            animate();
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        scenes.forEach(sceneData => {
            const { scene, camera, renderer, geometry, config, animationProps } = sceneData;
            const positions = geometry.attributes.position.array;
            const sizes = geometry.attributes.size.array;
            const opacities = geometry.attributes.customOpacity.array;

            for (let i = 0; i < config.particleCount; i++) {

                if (config.animationType === 'rising') {
                    // Y-axis movement only for rising particles
                    positions[i * 3 + 1] += 0.1; // Simplified speed from common2.js
                    if (positions[i * 3 + 1] > 100) {
                        positions[i * 3 + 1] = -100;
                        positions[i * 3] = (Math.random() - 0.5) * 200; // Reset X to avoid lines
                    }
                } else if (config.animationType === 'expanding') {
                    // Apply movement for expanding particles
                    positions[i * 3] += animationProps.velocities[i * 2];
                    positions[i * 3 + 1] += animationProps.velocities[i * 2 + 1];

                    const state = animationProps.animationStates[i];

                    if (state === 'fading_in') {
                        opacities[i] += 0.015; // Faster fade in
                        if (opacities[i] >= 0.7) {
                            opacities[i] = 0.7;
                            animationProps.animationStates[i] = 'fading_out';
                        }
                    } else { // fading_out
                        sizes[i] += 0.1; // Grow size a bit faster
                        opacities[i] -= 0.01; // Faster fade out

                        if (opacities[i] <= 0) {
                            // Reset particle
                            positions[i * 3] = (Math.random() - 0.5) * 200;
                            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
                            sizes[i] = animationProps.initialSizes[i];
                            opacities[i] = 0;
                            animationProps.animationStates[i] = 'fading_in';
                        }
                    }
                }
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
            geometry.attributes.customOpacity.needsUpdate = true;
            renderer.render(scene, camera);
        });
    }

    function onWindowResize() {
        scenes.forEach(sceneData => {
            const { camera, renderer, canvas } = sceneData;
            const parent = canvas.parentElement;
            camera.aspect = parent.clientWidth / parent.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(parent.clientWidth, parent.clientHeight);
        });
    }

    window.addEventListener('resize', onWindowResize, false);

    initThreeJS();

});