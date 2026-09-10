<section id="about" class="about-section">
    <div class="container">
        <div class="composition-wrapper">
            <!-- Фотография 1: слева вверху -->
            <div class="photo photo-top-left">
                <img src="/images/about-1.png" alt="Интерьер со шкафом" />
            </div>

            <!-- Центральная карточка с текстом -->
            <article class="content-card">
                <h2 class="title">О нас</h2>

                <p class="intro">
                    Наша компания вот уже более 17 лет работает на рынке услуг по производству мебели.
                    Мы работаем по индивидуальным эскизам и предоставляем своим клиентам качественную,
                    эргономичную мебель по выгодным ценам.
                </p>

                <p class="question">
                    Почему вот уже 17 лет количество благодарных клиентов непрестанно растет, как и наша репутация,
                    а положительные отзывы о нас множатся?
                </p>

                <ul class="features-list">
                    <li>
                        <strong>Качество исполнения</strong> — мы работаем только с качественными материалами.
                        Наши мастера — настоящие профессионалы своего дела, обладающие многолетним опытом.
                    </li>
                    <li>
                        <strong>Гарантия</strong> — если же вы сомневаетесь в качестве продукции,
                        знайте, что на каждый заказ мы предоставляем гарантию.
                    </li>
                    <li>
                        <strong>Оперативность</strong> — вся мебель изготавливается в кратчайшие сроки,
                        а при необходимости возможна реализация сверхсрочных заказов.
                    </li>
                </ul>
            </article>

            <!-- Фотография 2: справа внизу -->
            <div class="photo photo-bottom-right">
                <img src="/images/about-2.png" alt="Кабинет и рабочее место" />
            </div>
        </div>
    </div>
</section>

<style>
    .about-section {
        position: relative;
        padding: 100px 40px;
        background-color: #f7f7f7;
        /* Если есть фоновый скетч-чертеж, как на макете: */
        /* background-image: url('/images/sketch-bg.png'); background-repeat: repeat; */
        overflow: hidden;
    }

    .container {
        max-width: 1322px;
        margin: 0 auto;
    }

    .composition-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 720px;
    }

    /* Фото слева вверху */
    .photo-top-left {
        position: absolute;
        top: 0;
        left: 0;
        width: 500px;
        height: 500px;
        z-index: 1;
    }

    /* Фото справа внизу */
    .photo-bottom-right {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 500px;
        height: 500px;
        z-index: 1;
    }

    .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 2px;
    }

    /* Белая карточка поверх картинок */
    .content-card {
        position: relative;
        z-index: 2;
        background-color: #ffffff;
        max-width: 540px;
        padding: 56px 48px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
        border-radius: 2px;
        box-sizing: border-box;
    }

    .title {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 24px 0;
    }

    .intro {
        font-size: 14px;
        line-height: 1.6;
        color: #444444;
        margin: 0 0 18px 0;
    }

    .question {
        font-size: 14px;
        line-height: 1.6;
        color: #444444;
        margin: 0 0 24px 0;
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .features-list li {
        position: relative;
        padding-left: 16px;
        font-size: 13px;
        line-height: 1.6;
        color: #555555;
    }

    .features-list li::before {
        content: '—';
        position: absolute;
        left: 0;
        color: #888888;
    }

    .features-list strong {
        color: #1a1a1a;
    }

    /* Адаптивность для планшетов и мобилок */
    @media (max-width: 1024px) {
        .composition-wrapper {
            flex-direction: column;
            gap: 32px;
        }

        .photo-top-left,
        .photo-bottom-right {
            position: static;
            width: 100%;
            max-width: 540px;
            height: 280px;
        }

        .content-card {
            max-width: 100%;
            padding: 40px 24px;
        }
    }
</style>