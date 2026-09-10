<script>
    const benefits = [
        {
            text: '17 лет опыта с самыми разнообразными заказами позволяют обеспечить максимальное качество мебели'
        },
        {
            text: 'Опыт наших сотрудников от 10 лет - мы работаем только с профессиональной командой, готовой к различным вызовам'
        },
        {
            text: 'На всех этапах работы ваш персональный менеджер поможет вам решить все возникающие вопросы'
        }
    ];
</script>

<section class="benefits">
    <div class="container">
        <h2 class="title">Выгодное сотрудничество</h2>

        <div class="benefits-grid">
            {#each benefits as item}
                <div class="benefit-card">
                    <div class="icon-wrap">
                        <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 12L12 21.5L31.5 2" stroke="#111111" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p class="benefit-text">{item.text}</p>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .benefits {
        background-color: #ffffff;
        padding: 80px 40px;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
    }

    .title {
        text-align: center;
        font-size: 36px;
        font-weight: 500;
        line-height: 1.25;
        color: #1a1a1a;
        margin: 0 0 60px 0;
    }

    .benefits-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
    }
    .benefit-card {
        position: relative;
        background-color: #F8F8F8; /* Светло-серый фон плашки */
        border-radius: 2px;
        padding: 56px 36px 40px;   /* Верхний padding увеличен, чтобы текст не наползал на иконку */
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-sizing: border-box;
    }

    .icon-wrap {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%); /* Центрирует и выносит галочку ровно на верхнюю грань */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .benefit-text {
        margin: 0;
        font-weight: 400;
        font-size: 16px;
        line-height: 1.5;
        color: #333333;
        max-width: 342px;
    }

    @media (max-width: 992px) {
        .benefits-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .benefit-card {
            padding: 36px 24px;
        }

        .title {
            font-size: 28px;
            margin-bottom: 40px;
        }
    }
</style>