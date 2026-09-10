export function reveal(node, options = {}) {
    const {
        threshold = 0.15,
        once = true,
        delay = 0,               // Задержка в мс (например, 200)
        offset = '-100px'        // Срабатывать, когда блок поднялся на 100px выше нижнего края
    } = options;

    node.classList.add('reveal-init');

    let timeoutId = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (delay > 0) {
                    timeoutId = setTimeout(() => {
                        node.classList.add('revealed');
                    }, delay);
                } else {
                    node.classList.add('revealed');
                }

                if (once) {
                    observer.unobserve(node);
                }
            } else if (!once) {
                if (timeoutId) clearTimeout(timeoutId);
                node.classList.remove('revealed');
            }
        });
    }, {
        threshold,
        // Отрицательный нижний margin заставляет анимацию ждать, пока блок зайдет глубже
        rootMargin: `0px 0px ${offset} 0px`
    });

    observer.observe(node);

    return {
        destroy() {
            if (timeoutId) clearTimeout(timeoutId);
            observer.disconnect();
        }
    };
}