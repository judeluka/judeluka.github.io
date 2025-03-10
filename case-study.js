// Intersection Observer for tech stack icons
document.addEventListener('DOMContentLoaded', () => {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const icons = entry.target.querySelectorAll('.tech-icon');
                icons.forEach((icon, index) => {
                    setTimeout(() => {
                        icon.classList.add('visible');
                    }, index * 100); // Stagger the animation by 100ms per icon
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, options);

    // Start observing the tech stack section
    const techStack = document.querySelector('.tech-stack');
    if (techStack) {
        observer.observe(techStack);
    }

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        const icons = document.querySelectorAll('.tech-icon');
        icons.forEach(icon => {
            icon.classList.add('visible');
        });
    }
}); 