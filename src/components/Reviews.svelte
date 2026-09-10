<script>
    export let reviews = [
        '/images/reviews/review-1.png',
        '/images/reviews/review-2.png',
        '/images/reviews/review-3.png'
    ];

    export let sideImage = '/images/reviews/review-bg.png';
</script>

<section id="reviews" class="reviews-section">
    <!-- Правая картинка со шкафом во всю высоту блока -->
    <div class="side-photo" style="background-image: url('{sideImage}');"></div>

    <!-- Контент, выровненный строго по базовой сетке 1160px -->
    <div class="container">
        <div class="header-block">
            <h2 class="title">Нас рекомендуют</h2>
            <p class="subtitle">что говорят наши клиенты</p>
        </div>

        <div class="reviews-row">
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

    /* Фото шкафа прибито к правому краю экрана и занимает ~38-40% ширины */
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
    }

    /* Общий контейнер строго по сетке предыдущих блоков (Каталог / Форма) */
    .container {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 1345px;
        margin: 0 auto;
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

    /* Ряд из трех крупных карточек */
    .reviews-row {
        display: flex;
        align-items: flex-start;
        gap: 28px;
    }

    .review-card {
        flex: 0 0 345px;
        width: 371px;
        height: 417px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
        background-color: #72b07e;
    }

    .review-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    @media (max-width: 1200px) {
        .container {
            max-width: 960px;
        }

        .review-card {
            flex: 0 0 290px;
            width: 290px;
            height: 290px;
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
            height: 320px;
        }
    }
</style>