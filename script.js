// Debug logging
console.log('Script loading started');

// Fallback function to show all elements if animations fail
function showAllElements() {
    console.log('Applying fallback - showing all elements');
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing animations');
    
    // Add js-loaded class to body
    document.body.classList.add('js-loaded');
    
    try {
        // Initialize fade-in animations
        const fadeElements = document.querySelectorAll('.fade-in');
        console.log(`Found ${fadeElements.length} fade-in elements`);
        
        if (fadeElements.length === 0) {
            console.warn('No fade-in elements found. Check your HTML classes.');
            showAllElements();
            return;
        }

        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            showAllElements();
            return;
        }
        
        // Immediately show elements that are already in viewport
        fadeElements.forEach(element => {
            if (isInViewport(element)) {
                console.log('Element in viewport on load, showing immediately:', element);
                element.classList.add('visible');
            }
        });
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                        console.log('Element faded in:', entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            }
        );
        
        // Start observing fade elements that aren't already visible
        fadeElements.forEach(element => {
            if (!element.classList.contains('visible')) {
                observer.observe(element);
                console.log('Now observing:', element);
            }
        });

        // Fallback: If no animations after 3 seconds, show all elements
        setTimeout(() => {
            fadeElements.forEach(el => {
                if (!el.classList.contains('visible')) {
                    console.warn('Element not animated after 3s, forcing visible:', el);
                    el.classList.add('visible');
                }
            });
        }, 3000);

    } catch (error) {
        console.error('Error initializing animations:', error);
        showAllElements();
    }

    // Initialize other animations if reduced motion is not preferred
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        try {
            if (typeof initEirpolAnimation === 'function') {
                requestAnimationFrame(initEirpolAnimation);
            }
            if (document.querySelector('.moon-canvas') && typeof createMoonBackground === 'function') {
                createMoonBackground();
            }
        } catch (error) {
            console.error('Error initializing project animations:', error);
        }
    }
});

// Add smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 3D Icon Animation Setup
class Icon3D {
    constructor(container, shape = 'cube') {
        this.container = container;
        this.shape = shape;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        if (shape === 'graph') {
            this.createGraphSystem();
        } else if (shape === 'moon') {
            this.createMoonSystem();
        } else {
            this.geometry = this.createGeometry();
            this.material = new THREE.MeshPhongMaterial({
                color: 0x1a1a1a,
                wireframe: false,
                transparent: true,
                opacity: 0.7,
                shininess: 50,
                specular: 0x64ffda
            });
            this.wireframeMaterial = new THREE.MeshPhongMaterial({
                color: 0x64ffda,
                wireframe: true,
                transparent: true,
                opacity: 0.15
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.wireframe = new THREE.Mesh(this.geometry, this.wireframeMaterial);
        }

        // Add ambient and directional lights
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.init();
    }

    createGraphSystem() {
        // Create a group for the entire graph
        this.graphGroup = new THREE.Group();

        // Node geometry and materials
        const nodeGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const nodeMaterials = {
            primary: new THREE.MeshPhongMaterial({
                color: 0x00ff9d,
                emissive: 0x00ff9d,
                emissiveIntensity: 0.4,
                shininess: 50
            }),
            secondary: new THREE.MeshPhongMaterial({
                color: 0xff5722,
                emissive: 0xff5722,
                emissiveIntensity: 0.4,
                shininess: 50
            })
        };

        // Create nodes in a more network-like arrangement
        this.nodes = [];
        const positions = [
            // Center nodes
            { x: 0, y: 0.6, z: 0, material: nodeMaterials.primary },
            { x: -0.4, y: 0.3, z: 0.2, material: nodeMaterials.secondary },
            { x: 0.4, y: 0.3, z: -0.2, material: nodeMaterials.primary },
            // Outer nodes
            { x: -0.6, y: -0.2, z: -0.3, material: nodeMaterials.secondary },
            { x: 0.6, y: -0.2, z: 0.3, material: nodeMaterials.primary },
            { x: 0, y: -0.4, z: 0.4, material: nodeMaterials.secondary },
            { x: -0.3, y: -0.3, z: 0.5, material: nodeMaterials.primary },
            { x: 0.3, y: -0.3, z: -0.5, material: nodeMaterials.secondary },
            { x: -0.5, y: 0.4, z: -0.4, material: nodeMaterials.primary }
        ];

        // Create nodes
        positions.forEach(pos => {
            const node = new THREE.Mesh(nodeGeometry, pos.material);
            node.position.set(pos.x, pos.y, pos.z);
            this.nodes.push(node);
            this.graphGroup.add(node);
        });

        // Create connections between nodes with curved lines
        const connections = [
            [0, 1], [0, 2], [0, 3], [0, 4], // Center to others
            [1, 3], [1, 6], [1, 8], // Left side connections
            [2, 4], [2, 7], // Right side connections
            [3, 6], [4, 5], // Bottom connections
            [5, 6], [5, 7], // Cross connections
            [7, 2], [8, 1], // Additional cross links
            [6, 8], [3, 5], [4, 7] // More cross connections
        ];

        // Create curved connections
        connections.forEach(([from, to]) => {
            const start = this.nodes[from].position;
            const end = this.nodes[to].position;
            
            // Create a curve between points
            const midPoint = new THREE.Vector3(
                (start.x + end.x) / 2,
                (start.y + end.y) / 2,
                (start.z + end.z) / 2
            );
            
            // Add slight offset to midpoint for curve
            midPoint.y += 0.1;
            
            const curve = new THREE.QuadraticBezierCurve3(
                start,
                midPoint,
                end
            );

            const points = curve.getPoints(20);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00ff9d,
                transparent: true,
                opacity: 0.4
            });

            const curvedLine = new THREE.Line(geometry, lineMaterial);
            this.graphGroup.add(curvedLine);
        });

        // Add glow effects
        this.nodes.forEach(node => {
            const pointLight = new THREE.PointLight(
                node.material.color.getHex(),
                0.3,
                0.3
            );
            node.add(pointLight);
        });

        // Add pulsing animation data to nodes
        this.nodes.forEach(node => {
            node.userData.pulsePhase = Math.random() * Math.PI * 2;
            node.userData.pulseSpeed = 0.003 + Math.random() * 0.002;
        });
    }

    createMoonSystem() {
        this.moonGroup = new THREE.Group();

        // Create the moon with a standard sphere and NASA texture
        const moonGeometry = new THREE.SphereGeometry(0.8, 64, 64);
        
        // Create moon material with NASA texture
        const moonTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
        const moonBumpMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
        
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: moonTexture,
            bumpMap: moonBumpMap,
            bumpScale: 0.04,
            shininess: 2
        });

        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moonGroup.add(moon);

        // Add subtle glow
        const glowGeometry = new THREE.SphereGeometry(0.83, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xfffaf0,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        
        const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.moonGroup.add(moonGlow);

        // Position camera to show more of the moon
        this.camera.position.z = 2.2; // Moved camera even closer
        this.camera.position.x = -1.0; // Adjusted x position for closer view
        this.camera.position.y = 0; // Reset y position to center
        this.camera.lookAt(0, 0, 0); // Look at center of scene

        // Initial moon position
        moon.position.x = 0.8; // Moved to the right
        moon.position.y = 0.3; // Moved upward
        moonGlow.position.x = 0.8; // Match moon position
        moonGlow.position.y = 0.3; // Match moon position
        moon.rotation.y = -Math.PI * 0.25;

        // Create stars
        this.stars = new THREE.Group();
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.015,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            depthWrite: false
        });

        const starVertices = [];
        // Increase number of stars and ensure better distribution
        for (let i = 0; i < 2000; i++) {
            // Create a spherical distribution of stars
            const theta = Math.random() * Math.PI * 2; // Horizontal angle
            const phi = Math.acos((Math.random() * 2) - 1); // Vertical angle
            const radius = 3 + Math.random() * 7; // Varying distances
            
            // Convert spherical coordinates to Cartesian
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        
        // Add objects to scene in correct order (background to foreground)
        this.stars.add(stars);
        this.moonGroup.add(this.stars);
        this.moonGroup.add(moonGlow);
        this.moonGroup.add(moon);

        // Initial rotation
        this.moonGroup.rotation.x = -0.2;
        this.moon.rotation.y = Math.PI;
    }

    createGeometry() {
        switch(this.shape) {
            case 'sphere':
                return new THREE.SphereGeometry(1, 32, 32);
            case 'octahedron':
                return new THREE.OctahedronGeometry(1);
            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    init() {
        // Setup renderer
        const containerWidth = this.container.clientWidth || 200; // Default to 200 if container width is 0
        const containerHeight = this.container.clientHeight || 200; // Default to 200 if container height is 0
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Setup scene
        if (this.shape === 'graph') {
            this.scene.add(this.graphGroup);
            this.camera.position.z = 2.5;
            this.camera.position.y = 0.3;
            this.camera.position.x = 0.5;
            this.camera.lookAt(0, 0, 0);
        } else if (this.shape === 'moon') {
            this.scene.add(this.moonGroup);
            this.camera.position.z = 1.8; // Moved camera closer
            this.camera.position.x = -0.5; // Reduced offset
            this.camera.position.y = 0;
            this.camera.lookAt(0, 0, 0);
        } else {
            this.scene.add(this.mesh);
            this.scene.add(this.wireframe);
            this.camera.position.z = 4;
        }

        this.light.position.set(5, 5, 5);
        this.scene.add(this.light);
        this.scene.add(this.ambientLight);

        // Start animation
        this.animate();
        
        // Handle resize for moon
        if (this.shape === 'moon') {
            const onResize = () => {
                const width = this.container.clientWidth;
                const height = this.container.clientHeight;
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            };
            window.addEventListener('resize', onResize);
            // Initial resize
            onResize();
        }
    }

    animate = () => {
        if (!document.hidden) {
            requestAnimationFrame(this.animate);
            
            if (this.shape === 'graph') {
                // Rotate the entire graph horizontally
                this.graphGroup.rotation.y += 0.005;
                
                // Animate node pulsing
                this.nodes.forEach(node => {
                    const scale = 1 + 0.1 * Math.sin(node.userData.pulsePhase);
                    node.scale.set(scale, scale, scale);
                    node.userData.pulsePhase += node.userData.pulseSpeed;
                });
            } else if (this.shape === 'moon') {
                // Rotate moon slowly
                this.moon.rotation.y += 0.005;
                
                // Animate stars twinkling
                this.stars.children.forEach(star => {
                    const scale = 0.8 + 0.4 * Math.sin(star.userData.twinklePhase);
                    star.scale.set(scale, scale, scale);
                    star.userData.twinklePhase += star.userData.twinkleSpeed;
                });
                
                // Subtle moon group movement
                this.moonGroup.rotation.y += 0.001;
                this.moonGroup.rotation.x = -0.2 + Math.sin(Date.now() * 0.001) * 0.05;
            } else {
                this.mesh.rotation.x += 0.005;
                this.mesh.rotation.y += 0.005;
                this.wireframe.rotation.x = this.mesh.rotation.x;
                this.wireframe.rotation.y = this.mesh.rotation.y;
            }
            
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize 3D icons if reduced motion is not preferred
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.icon-3d').forEach(container => {
        const projectTitle = container.closest('.project-card').querySelector('h3').textContent;
        // Skip Eirpol project card
        if (container.closest('.project-card-eirpol')) {
            return;
        }
        
        let shape = 'cube';
        if (projectTitle === 'MoonMapper') {
            shape = 'moon';
        } else {
            shape = container.dataset.shape || 'cube';
        }
        new Icon3D(container, shape);
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once the animation is complete, we can stop observing the element
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Check if elements exist
    console.log('Header:', document.querySelector('.header'));
    console.log('Projects:', document.querySelector('.projects'));
    console.log('Skills:', document.querySelector('.skills'));
    
    // Initialize animations
    const fadeElements = document.querySelectorAll('.fade-in');
    console.log('Fade elements found:', fadeElements.length);
    
    fadeElements.forEach(element => observer.observe(element));
    
    // Initialize Eirpol animations
    console.log('Initializing Eirpol animations');
    requestAnimationFrame(initEirpolAnimation);
    
    // Initialize moon background if canvas exists
    const moonCanvas = document.querySelector('.moon-canvas');
    console.log('Moon canvas found:', !!moonCanvas);
    if (moonCanvas) {
        console.log('Creating moon background');
        createMoonBackground();
    }

    // Smooth scroll for the scroll indicator
    const scrollIndicator = document.querySelector('.scroll-to-skills');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const skillsSection = document.querySelector('.skills');
            if (skillsSection) {
                skillsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Remove custom cursor code
if (!window.matchMedia('(hover: none)').matches) {
    const titles = document.querySelectorAll('.project-card h3');
    const proximityThreshold = 100; // Distance in pixels for illumination effect

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        // Check proximity to titles
        titles.forEach(title => {
            const rect = title.getBoundingClientRect();
            const titleCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            const distance = Math.hypot(
                e.clientX - titleCenter.x,
                e.clientY - titleCenter.y
            );

            if (distance < proximityThreshold) {
                const intensity = 1 - (distance / proximityThreshold);
                title.classList.add('illuminated');
                title.style.setProperty('--illumination', intensity);
            } else {
                title.classList.remove('illuminated');
                title.style.removeProperty('--illumination');
            }
        });
    });
}

// Create a dedicated function for the Eirpol animations that will be called on page load
function initEirpolAnimation() {
    console.log("Initializing Eirpol animation"); // Debug log
    const eirpolCard = document.querySelector('.project-card-eirpol');
    if (!eirpolCard) {
        console.error("Eirpol card not found");
        return;
    }
    
    // Create floating shapes container if it doesn't exist
    let shapesContainer = eirpolCard.querySelector('.eirpol-shapes');
    if (!shapesContainer) {
        console.log("Creating new shapes container");
        shapesContainer = document.createElement('div');
        shapesContainer.className = 'floating-shapes eirpol-shapes';
        eirpolCard.insertBefore(shapesContainer, eirpolCard.firstChild);
    }
    
    // Clear any existing shapes
    shapesContainer.innerHTML = '';
    console.log("Creating new shapes");
    
    // Create shapes with initial positions
    const shapes = [];
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.className = `floating-shape shape-${i % 4 + 1}`;
        
        // Random size between 40px and 80px
        const size = 40 + Math.random() * 40;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Set initial position (start from left, outside the card)
        shape.style.left = `-${size}px`;
        shape.style.top = `${20 + Math.random() * 60}%`;
        
        // Force a reflow before setting opacity to ensure transition works
        shape.getBoundingClientRect();
        shape.style.opacity = '0';
        
        shapes.push(shape);
        shapesContainer.appendChild(shape);
        console.log(`Created shape ${i + 1} with size ${size}px`);
    }
    
    // Start animation after a small delay
    console.log("Scheduling animation start");
    requestAnimationFrame(() => {
        shapes.forEach((shape, index) => {
            const animateShape = () => {
                console.log(`Animating shape ${index + 1}`);
                
                // Force a reflow before animation
                shape.getBoundingClientRect();
                
                // Make visible with initial opacity
                shape.style.opacity = '0.7';
                
                // Calculate final positions
                const finalLeft = 20 + (Math.random() * 60);
                const finalTop = 20 + (Math.random() * 60);
                
                // Move to final position
                shape.style.left = `${finalLeft}%`;
                shape.style.top = `${finalTop}%`;
                
                // Start floating animation
                let y = finalTop;
                let x = finalLeft;
                let phase = index * (Math.PI / 2);
                
                const float = () => {
                    phase += 0.002;
                    x = finalLeft + Math.sin(phase) * 10;
                    y = finalTop + Math.cos(phase) * 5;
                    
                    shape.style.left = `${x}%`;
                    shape.style.top = `${y}%`;
                    
                    // Continue animation
                    requestAnimationFrame(float);
                };
                
                // Start floating animation
                requestAnimationFrame(float);
            };
            
            // Stagger the animations
            setTimeout(animateShape, index * 300);
        });
    });
}

// Initialize floating shapes for Eirpol card and space background for MoonMapper
document.querySelectorAll('.project-card').forEach(card => {
    const title = card.querySelector('h3').textContent;
    
    if (title === 'Eirpol') {
        // Handled by dedicated function instead
    } else if (title === 'MoonMapper') {
        // Create space background
        const spaceBackground = document.createElement('div');
        spaceBackground.className = 'space-background';
        
        // Create stars
        const numStars = 50;
        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = 'space-star';
            
            // Random size between 1px and 3px
            const size = 1 + Math.random() * 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay
            star.style.transitionDelay = `${Math.random() * 0.5}s`;
            
            spaceBackground.appendChild(star);
        }
        
        // Create nebulas
        const colors = ['#4361ee', '#7209b7', '#3a0ca3', '#4cc9f0'];
        const numNebulas = 4;
        for (let i = 0; i < numNebulas; i++) {
            const nebula = document.createElement('div');
            nebula.className = 'space-nebula';
            
            // Random size between 100px and 200px
            const size = 100 + Math.random() * 100;
            nebula.style.width = `${size}px`;
            nebula.style.height = `${size}px`;
            
            // Random position (ensuring some overlap)
            nebula.style.left = `${Math.random() * 80}%`;
            nebula.style.top = `${Math.random() * 80}%`;
            
            // Random color from our space palette
            nebula.style.background = colors[i % colors.length];
            
            // Random animation delay
            nebula.style.transitionDelay = `${0.2 + Math.random() * 0.3}s`;
            
            spaceBackground.appendChild(nebula);
        }
        
        card.appendChild(spaceBackground);
        
        // Add star twinkling animation
        const stars = spaceBackground.querySelectorAll('.space-star');
        let frameCount = 0;
        
        const animateStars = () => {
            frameCount++;
            
            if (card.matches(':hover')) {
                stars.forEach((star, index) => {
                    const twinkle = Math.sin((frameCount + index * 20) * 0.05) * 0.5 + 0.5;
                    star.style.opacity = 0.4 + (twinkle * 0.4);
                });
                
                // Subtle nebula movement
                spaceBackground.querySelectorAll('.space-nebula').forEach((nebula, index) => {
                    const movement = Math.sin((frameCount + index * 50) * 0.02) * 5;
                    nebula.style.transform = `translate(${movement}px, ${movement}px)`;
                });
            }
            
            requestAnimationFrame(animateStars);
        };
        
        animateStars();
    }
});

// Moon Background Setup
function createMoonBackground() {
    const canvas = document.querySelector('.moon-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Add subtle background gradient
    const bgGradient = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x000510) },
                color2: { value: new THREE.Color(0x050a18) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
            `,
            depthWrite: false
        })
    );
    bgGradient.position.z = -10;
    scene.add(bgGradient);

    // Create camera with narrower field of view to zoom in
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create the moon with a standard sphere and NASA texture
    const moonGeometry = new THREE.SphereGeometry(0.8, 64, 64);
    
    // Create moon material with NASA texture
    const moonTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
    const moonBumpMap = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');
    
    const moonMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        bumpMap: moonBumpMap,
        bumpScale: 0.04,
        shininess: 2
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Add subtle glow
    const glowGeometry = new THREE.SphereGeometry(0.83, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfffaf0,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    
    const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(moonGlow);

    // Create starfield
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.015,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        depthWrite: false
    });

    const starVertices = [];
    // Increase number of stars and ensure better distribution
    for (let i = 0; i < 2000; i++) {
        // Create a spherical distribution of stars
        const theta = Math.random() * Math.PI * 2; // Horizontal angle
        const phi = Math.acos((Math.random() * 2) - 1); // Vertical angle
        const radius = 5 + Math.random() * 10; // Varying distances
        
        // Convert spherical coordinates to Cartesian
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    
    // Add objects to scene in correct order (background to foreground)
    scene.add(stars);
    scene.add(moonGlow);
    scene.add(moon);

    // Enhanced lighting for dramatic shadow effect
    const ambientLight = new THREE.AmbientLight(0x222222, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(-3, 1.5, -3);
    scene.add(mainLight);

    // Add rim light for better depth
    const rimLight = new THREE.DirectionalLight(0x404040, 0.8);
    rimLight.position.set(3, -1.5, 3);
    scene.add(rimLight);

    // Position camera to show more of the moon
    camera.position.z = 1.0; // Moved camera even closer
    camera.position.x = 1.2; // Adjusted x position for closer view
    camera.position.y = 0.4; // Reset y position to center
    camera.lookAt(0, 0, 0); // Look at center of scene

    // Initial moon position
    moon.position.x = 0.8; // Moved to the right
    moon.position.y = 0.3; // Moved upward
    moonGlow.position.x = 0.8; // Match moon position
    moonGlow.position.y = 0.3; // Match moon position
    moon.rotation.y = -Math.PI * 0.25;

    // Smooth rotation animation
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Continuous rotation with slight wobble
        moon.rotation.y += 0.0003; // Slower rotation
        moon.rotation.x = Math.sin(time * 0.3) * 0.05; // Subtle wobble
        moonGlow.rotation.y = moon.rotation.y;
        moonGlow.rotation.x = moon.rotation.x;

        // Subtle floating movement
        moon.position.y = -0.5 + Math.sin(time * 0.3) * 0.05;
        moonGlow.position.y = moon.position.y;

        // Twinkle stars
        const positions = starGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const idx = i / 3;
            if (idx % 20 === Math.floor(time * 10) % 20) { // Only update some stars each frame
                starMaterial.size = 0.015 + Math.sin(time * 3 + idx) * 0.005;
            }
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    function onResize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onResize);
    onResize(); // Initial sizing
    animate();
}

// Initialize moon background when DOM is loaded
if (document.querySelector('.moon-canvas')) {
    createMoonBackground();
}

console.log('Animation test');

