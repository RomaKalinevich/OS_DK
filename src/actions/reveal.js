export function reveal(node, options = {}) {
    const { threshold = 0.15, once = true } = options;

    node.classList.add('reveal-init');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                node.classList.add('revealed');
                if (once) {
                    observer.unobserve(node);
                }
            } else if (!once) {
                node.classList.remove('revealed');
            }
        });
    }, { threshold });

    observer.observe(node);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}