<script>
    import { reveal } from '../actions/reveal.js';

    // Автоматический импорт всех отзывов через Vite
    const reviewModules = import.meta.glob(
        '/assets/reviews/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );

    // Фоновая боковая плашка
    const bgModules = import.meta.glob(
        '/assets/reviews/review-bg.{png,jpg,webp}',
        { eager: true, import: 'default' }
    );
    const sideImage = Object.values(bgModules)[0] || '/assets/reviews/review-bg.png';

    // Оставляем только отзывы без фоновой картинки
    let loadedReviews = Object.entries(reviewModules)
        .filter(([path]) => !path.includes('review-bg'))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, mod]) => mod);

    const fallbackReviews = [
        '/assets/reviews/review-1.jpg',
        '/assets/reviews/review-2.jpg',
        '/assets/reviews/review-3.jpg'
    ];

    const reviews = loadedReviews.length > 0 ? loadedReviews : fallbackReviews;

    // Индекс активного отзыва для мобильного слайдера
    let activeMobileIndex = $state(0);

    function prevReview() {
        if (!reviews.length) return;
        activeMobileIndex = (activeMobileIndex - 1 + reviews.length) % reviews.length;
    }

    function nextReview() {
        if (!reviews.length) return;
        activeMobileIndex = (activeMobileIndex + 1) % reviews.length;
    }
</script>

<section id="reviews" class="reviews-section">
    <!-- Боковое фото шкафа -->
    {#if sideImage}
        <div class="side-photo" style="background-image: url('{sideImage}');"></div>
    {/if}

    <div class="container">
        <!-- Заголовок блока с анимацией -->
        <div
                class="header-block reviews-header-anim"
                use:reveal={{ offset: '-40px', delay: 60 }}
        >
            <h2 class="title">Нас рекомендуют</h2>
            <p class="subtitle">что говорят наши клиенты</p>
        </div>

        <!-- Десктопный вид: 3 карточки в ряд -->
        <div
                class="reviews-row reviews-grid-anim"
                use:reveal={{ offset: '-80px', delay: 150 }}
        >
            {#each reviews as img, i}
                <div class="review-card">
                    <img src={img} alt="Отзыв клиента {i + 1}" loading="lazy" />
                </div>
            {/each}
        </div>

        <!-- Мобильный вид (строго по макету 390px): 1 карточка + стрелки снизу слева -->
        <div
                class="mobile-reviews-block mobile-reviews-anim"
                use:reveal={{ offset: '-40px', delay: 100 }}
        >
            <div class="mobile-slider">
                {#each reviews as img, i}
                    <div
                            class="mobile-review-card"
                            class:active={activeMobileIndex === i}
                    >
                        <img src={img} alt="Отзыв клиента {i + 1}" loading="lazy" />
                    </div>
                {/each}
            </div>

            <div class="mobile-arrows">
                <button
                        type="button"
                        class="arrow-btn"
                        onclick={prevReview}
                        aria-label="Предыдущий отзыв"
                >
                    <svg width="8" height="14" viewBox="0 0 10 16" fill="none">
                        <path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <button
                        type="button"
                        class="arrow-btn"
                        onclick={nextReview}
                        aria-label="Следующий отзыв"
                >
                    <svg width="8" height="14" viewBox="0 0 10 16" fill="none">
                        <path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</section>

<style>
    .reviews-section {
        position: relative;
        width: 100%;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        overflow: hidden;
        box-sizing: border-box;
        padding: 60px 0 70px;
    }

    .side-photo {
        position: absolute;
        top: 0;
        right: 0;
        width: 36vw;
        min-width: 360px;
        height: 100%;
        background-size: cover;
        background-position: left center;
        background-repeat: no-repeat;
        z-index: 1;
        pointer-events: none;
    }

    .container {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 1345px;
        margin: 0 auto;
        padding: 0 40px;
        box-sizing: border-box;
    }

    .header-block {
        margin-bottom: 30px;
    }

    .title {
        font-size: 34px;
        font-weight: 700;
        color: #000000;
        margin: 0 0 6px 0;
    }

    .subtitle {
        font-size: 17px;
        font-weight: 400;
        color: #8B9098;
        margin: 0;
    }

    /* ---------------- Десктопный ряд ---------------- */
    .reviews-row {
        display: flex;
        align-items: flex-start;
        gap: 24px;
    }

    .review-card {
        flex: 0 0 260px;
        width: 260px;
        height: 500px;
        border-radius: 4px;
        overflow: hidden;
        background: transparent;
        transition: transform 0.25s ease;
    }

    .review-card:hover {
        transform: translateY(-4px);
    }

    .review-card img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }

    .mobile-reviews-block {
        display: none;
    }

    /* ---------------- Анимации блока отзывов (Десктоп) ---------------- */
    :global(.reviews-header-anim.reveal-init) {
        opacity: 0;
        transform: translateY(20px);
        filter: blur(5px);
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        filter 0.75s ease;
        will-change: opacity, transform, filter;
    }

    :global(.reviews-header-anim.revealed) {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }

    :global(.reviews-grid-anim.reveal-init) .review-card {
        opacity: 0;
        transform: translateY(24px) scale(0.98);
        transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    :global(.reviews-grid-anim.revealed) .review-card:nth-child(1) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition-delay: 0.1s;
    }
    :global(.reviews-grid-anim.revealed) .review-card:nth-child(2) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition-delay: 0.22s;
    }
    :global(.reviews-grid-anim.revealed) .review-card:nth-child(3) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition-delay: 0.34s;
    }

    @media (max-width: 1200px) {
        .container {
            max-width: 960px;
        }

        .review-card {
            flex: 0 0 230px;
            width: 230px;
            height: 450px;
        }

        .side-photo {
            width: 30vw;
            min-width: 280px;
        }
    }

    /* ---------------- Мобильная адаптация (390px) ---------------- */
    @media (max-width: 992px) {
        .side-photo,
        .reviews-row {
            display: none;
        }

        .reviews-section {
            padding: 40px 0 46px;
        }

        .container {
            padding: 0 20px;
        }

        .header-block {
            margin-bottom: 20px;
        }

        .title {
            font-size: 26px;
            margin-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
        }

        /* Мягкий мобильный вход заголовка без размытия */
        :global(.reviews-header-anim.reveal-init) {
            filter: none !important;
            transform: translateY(10px) !important;
            transition: opacity 0.5s ease-out,
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        .mobile-reviews-block {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
        }

        /* Плавное проявление всего блока слайдера */
        :global(.mobile-reviews-anim.reveal-init) {
            opacity: 0 !important;
            transform: translateY(8px) !important;
            transition: opacity 0.85s cubic-bezier(0.25, 0.1, 0.25, 1),
            transform 0.95s cubic-bezier(0.12, 0.98, 0.24, 1) !important;
            will-change: opacity, transform;
        }

        :global(.mobile-reviews-anim.revealed) {
            opacity: 1 !important;
            transform: translateY(0) !important;
            transition-delay: 0.1s !important;
        }

        /* 1 карточка по центру */
        .mobile-slider {
            position: relative;
            width: 100%;
            max-width: 250px;
            height: 460px;
            margin: 0 auto;
        }

        /* Шелковистый кросс-фейд карточек со сглаживанием */
        .mobile-review-card {
            position: absolute;
            inset: 0;
            opacity: 0;
            visibility: hidden;
            transform: scale(0.985);
            transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            visibility 0.45s ease-in-out;
            will-change: opacity, transform;
        }

        .mobile-review-card.active {
            opacity: 1;
            visibility: visible;
            transform: scale(1);
        }

        .mobile-review-card img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        /* Желтые стрелки внизу слева */
        .mobile-arrows {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 14px;
            padding-left: 2px;
        }

        .arrow-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #FFC700;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(255, 199, 0, 0.35);
            transition: background-color 0.2s, transform 0.15s ease;
        }

        .arrow-btn:active {
            transform: scale(0.92);
        }
    }
</style>