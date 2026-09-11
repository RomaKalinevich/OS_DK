<script>
    import { reveal } from '../actions/reveal.js';

    // Автоматический импорт всех отзывов через Vite (попадает в dist на Render)
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

    // Оставляем только фото отзывов, сортируя по имени (review-1, review-2, review-3)
    const reviews = Object.entries(reviewModules)
        .filter(([path]) => !path.includes('review-bg'))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, mod]) => mod);
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
                use:reveal={{ offset: '-40px', delay: 100 }}
        >
            <h2 class="title">Нас рекомендуют</h2>
            <p class="subtitle">что говорят наши клиенты</p>
        </div>

        <!-- Ряд карточек с каскадным появлением -->
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
    </div>
</section>

<style>
    .reviews-section {
        position: relative;
        width: 100%;
        min-height: 650px;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        overflow: hidden;
        box-sizing: border-box;
        padding: 80px 0;
    }

    .side-photo {
        position: absolute;
        top: 0;
        right: 0;
        width: 40vw;
        min-width: 420px;
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
        padding: 0 20px;
        box-sizing: border-box;
    }

    .header-block {
        margin-bottom: 36px;
    }

    .title {
        font-size: 38px;
        font-weight: 700;
        color: #000000;
        margin: 0 0 8px 0;
    }

    .subtitle {
        font-size: 20px;
        font-weight: 400;
        color: #8B9098;
        margin: 0;
    }

    .reviews-row {
        display: flex;
        align-items: flex-start;
        gap: 28px;
    }

    .review-card {
        flex: 0 0 345px;
        width: 345px;
        height: 650px;
        border-radius: 4px;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .review-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    /* -------------------------------------------------------------
       Анимации блока отзывов
    ------------------------------------------------------------- */
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

    /* Карточки скрыты до срабатывания */
    :global(.reviews-grid-anim.reveal-init) .review-card {
        opacity: 0;
        transform: translateY(28px) scale(0.98);
        transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    /* Каскадное появление отзывов один за другим */
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
            flex: 0 0 290px;
            width: 290px;
            height: 550px;
        }

        .side-photo {
            width: 32vw;
            min-width: 300px;
        }
    }

    @media (max-width: 992px) {
        .side-photo {
            display: none;
        }

        .reviews-row {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }

        .review-card {
            flex: 0 0 320px;
            width: 320px;
            height: 580px;
        }
    }
</style>