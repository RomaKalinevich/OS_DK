<script>
    const wardrobesModules = import.meta.glob(
        '/assets/works/wardrobes/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );
    const dressingModules = import.meta.glob(
        '/assets/works/dressing/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );
    const officeModules = import.meta.glob(
        '/assets/works/office/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );

    const wardrobesImages = Object.values(wardrobesModules);
    const dressingImages = Object.values(dressingModules);
    const officeImages = Object.values(officeModules);

    const works = [
        {
            title: 'Шкафы',
            subtitle: 'Индивидуальный подход к каждому сантиметру',
            description: 'Ищете идеальный шкаф? Мы предлагаем не просто корпус с полками, а систему хранения, встроенную в ваш ритм жизни.',
            points: [
                'Встроенные и корпусные модели: точно встанут в вашу нишу, эркер или вдоль стены.',
                'Любые наполнения: Штанги, выдвижные пантографы, корзины для белья, бережные ящики с доводчиками.',
                'Материалы на выбор: ЛДСП/МДФ Эко-шпон, матовые и глянцевые эмали, фасады из натурального дерева или стекла.',
                'Визуализация 3D: Вы видите точный проект до начала производства.'
            ],
            images: wardrobesImages.length ? wardrobesImages : ['/images/pamela.png'],
            reverse: false
        },
        {
            title: 'Гардеробные',
            subtitle: 'Ваше личное пространство для порядка',
            description: 'Мечта о просторной гардеробной теперь доступна не только в больших особняках. Мы организуем грамотное хранение даже на 4-5 квадратных метрах.',
            points: [
                'Открытые и закрытые системы: Модульные конструкции, которые легко трансформируются при смене сезона.',
                'Продуманная эргономика: Каждая вещь на своем месте — от вечерних одежд до аксессуаров и галстуков.',
                'Освещение: Встроенная подсветка, которая делает сборы утром комфортными.',
                'Зеркала и фурнитура: Европейские механизмы, рассчитанные на ежедневную интенсивную нагрузку.'
            ],
            images: dressingImages.length ? dressingImages : ['/images/lube.png'],
            reverse: true
        },
        {
            title: 'Мебель для офиса',
            subtitle: 'Стиль, статус и продуктивность',
            description: 'Офисная мебель — это лицо вашей компании. Мы создаем рабочую атмосферу, в которой сотрудникам комфортно, а партнерам понятно находиться.',
            points: [
                'Для руководителя: Солидные кабинеты из массива или эко-шпона с надежными ручками и встроенными сейфами.',
                'Для сотрудников: Эргономичные столы, удобные кресла с ортопедической спинкой и функциональные тумбы для хранения документов.',
                'Переговорные комнаты: Трансформируемые столы и стулья для совещаний и мозговых штурмов.',
                'Зоны ресепшн: Стойки регистрации, которые создают первое впечатление о вашем бизнесе.'
            ],
            images: officeImages.length ? officeImages : ['/images/korano.png'],
            reverse: false
        }
    ];

    // Индексы активного слайда для каждой из 3 карточек
    let activeSlides = $state(works.map(() => 0));

    function prevSlide(cardIndex, total) {
        activeSlides[cardIndex] = (activeSlides[cardIndex] - 1 + total) % total;
    }

    function nextSlide(cardIndex, total) {
        activeSlides[cardIndex] = (activeSlides[cardIndex] + 1) % total;
    }

    function setSlide(cardIndex, slideIndex) {
        activeSlides[cardIndex] = slideIndex;
    }
</script>

<section id="gallery" class="works-section">
    <div class="container">
        <div class="header-block">
            <h2 class="title">Наши работы</h2>
            <p class="subtitle">
                Мы готовы выполнить работы по созданию, проектированию и подбору материалов для мебели<br />
                любой сложности и сделать все на наивысшем уровне
            </p>
        </div>

        <div class="cards-list">
            {#each works as item, cardIndex}
                <article class="work-card" class:reverse={item.reverse}>
                    <!-- Слайдер фотографий -->
                    <div class="image-wrapper">
                        <div class="slider-container">
                            {#each item.images as imgUrl, slideIndex}
                                <img
                                        src={imgUrl}
                                        alt="{item.title} фото {slideIndex + 1}"
                                        class="slide-img"
                                        class:active={activeSlides[cardIndex] === slideIndex}
                                        loading="lazy"
                                />
                            {/each}

                            {#if item.images.length > 1}
                                <button
                                        type="button"
                                        class="slider-btn prev"
                                        onclick={() => prevSlide(cardIndex, item.images.length)}
                                        aria-label="Предыдущее фото"
                                >
                                    <svg width="8" height="14" viewBox="0 0 10 16" fill="none">
                                        <path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <button
                                        type="button"
                                        class="slider-btn next"
                                        onclick={() => nextSlide(cardIndex, item.images.length)}
                                        aria-label="Следующее фото"
                                >
                                    <svg width="8" height="14" viewBox="0 0 10 16" fill="none">
                                        <path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>

                                <div class="slider-dots">
                                    {#each item.images as _, dotIndex}
                                        <button
                                                type="button"
                                                class="slider-dot"
                                                class:active={activeSlides[cardIndex] === dotIndex}
                                                onclick={() => setSlide(cardIndex, dotIndex)}
                                                aria-label="Перейти к фото {dotIndex + 1}"
                                        ></button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Текстовое описание -->
                    <div class="content-wrapper">
                        <h3 class="card-title">{item.title}</h3>
                        <span class="card-subtitle">{item.subtitle}</span>
                        <p class="card-desc">{item.description}</p>

                        <ul class="points-list">
                            {#each item.points as point}
                                <li>{point}</li>
                            {/each}
                        </ul>

                        <a href="#order" class="btn-order">Отправить заявку</a>
                    </div>
                </article>
            {/each}
        </div>
    </div>
</section>

<style>
    .works-section {
        position: relative;
        padding: 90px 40px;
        background-image: url('/images/works-bg.png');
        background-repeat: repeat;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
    }

    .header-block {
        text-align: center;
        margin-bottom: 64px;
    }

    .title {
        font-size: 38px;
        font-weight: 800;
        line-height: 47.5px;
        color: #000000;
        margin: 0 0 16px 0;
    }

    .subtitle {
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: #444444;
        margin: 0;
    }

    .cards-list {
        display: flex;
        flex-direction: column;
        gap: 48px;
    }

    .work-card {
        display: flex;
        align-items: stretch;
        background: #ffffff;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    }

    .work-card.reverse {
        flex-direction: row-reverse;
    }

    /* Обертка слайдера */
    .image-wrapper {
        flex: 1 1 50%;
        min-height: 480px;
        position: relative;
    }

    .slider-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 480px;
        overflow: hidden;
        background-color: #f5f5f5;
    }

    /* Плавная смена слайдов */
    .slide-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.35s ease-in-out;
        pointer-events: none;
    }

    .slide-img.active {
        opacity: 1;
        pointer-events: auto;
    }

    /* Кнопки переключения внутри слайдера */
    .slider-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background-color: #FFC700;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s, transform 0.1s;
    }

    .slider-btn:hover {
        background-color: #e0a300;
    }

    .slider-btn:active {
        transform: translateY(-50%) scale(0.92);
    }

    .slider-btn.prev {
        left: 16px;
    }

    .slider-btn.next {
        right: 16px;
    }

    /* Индикаторы страниц */
    .slider-dots {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        z-index: 2;
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 8px;
        border-radius: 12px;
    }

    .slider-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background-color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s, background-color 0.2s;
    }

    .slider-dot.active {
        background-color: #FFC700;
        transform: scale(1.3);
    }

    /* Контент карточки */
    .content-wrapper {
        flex: 1 1 50%;
        gap: 15px;
        padding: 40px 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
    }

    .card-title {
        font-size: 26px;
        font-weight: 700;
        margin: 0;
        color: #444444;
    }

    .card-subtitle {
        display: block;
        line-height: 27px;
        font-size: 18px;
        font-weight: 500;
        color: #444444;
    }

    .card-desc {
        font-size: 16px;
        line-height: 1.5;
        color: #444444;
        margin: 0;
    }

    .points-list {
        list-style: none;
        padding: 0;
        margin: 0 0 32px 0;
        display: flex;
        flex-direction: column;
    }

    .points-list li {
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        color: #444444;
        position: relative;
        padding-left: 14px;
    }

    .points-list li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #888888;
    }

    .btn-order {
        height: 50px;
        width: 221px;
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
        background-color: #FFC700;
        text-decoration: none;
        color: #000000;
        font-size: 16px;
        font-weight: 400;
        border-radius: 4px;
        transition: background-color 0.2s ease-in-out;
    }

    .btn-order:hover {
        background-color: #e0a300;
    }

    @media (max-width: 992px) {
        .work-card,
        .work-card.reverse {
            flex-direction: column;
        }

        .image-wrapper,
        .slider-container {
            min-height: 320px;
        }

        .content-wrapper {
            padding: 36px 24px;
        }
    }
</style>