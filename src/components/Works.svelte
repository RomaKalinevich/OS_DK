<script>
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
            image: '/images/pamela.png',
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
            image: '/images/lube.png',
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
            image: '/images/korano.png',
            reverse: false
        }
    ];
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
            {#each works as item}
                <article class="work-card" class:reverse={item.reverse}>
                    <div class="image-wrapper">
                        <img src={item.image} alt={item.title} />
                    </div>

                    <div class="content-wrapper">
                        <h3 class="card-title">{item.title}</h3>
                        <span class="card-subtitle">{item.subtitle}</span>
                        <p class="card-desc">{item.description}</p>

                        <ul class="points-list">
                            {#each item.points as point}
                                <li>{point}</li>
                            {/each}
                        </ul>

                        <a href="#promotions" class="btn-order">Отправить заявку</a>
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
        background-color: #EAEAEA66;
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

    .image-wrapper {
        flex: 1 1 50%;
        min-height: 480px;
    }

    .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .content-wrapper {
        flex: 1 1 62%;
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

        .image-wrapper {
            min-height: 320px;
        }

        .content-wrapper {
            padding: 36px 24px;
        }
    }
</style>