<script>
    import { onMount } from 'svelte';
    import { reveal } from '../actions/reveal.js';

    let days = $state('00');
    let hours = $state('00');
    let minutes = $state('00');
    let seconds = $state('00');

    const STORAGE_KEY = 'osdk_promo_end_date';
    const DURATION_DAYS = 3;

    onMount(() => {
        let targetTime = localStorage.getItem(STORAGE_KEY);

        if (!targetTime) {
            const now = new Date();
            now.setDate(now.getDate() + DURATION_DAYS);
            targetTime = now.getTime().toString();
            localStorage.setItem(STORAGE_KEY, targetTime);
        }

        const updateTimer = () => {
            const diff = parseInt(targetTime, 10) - Date.now();

            if (diff <= 0) {
                days = '00';
                hours = '00';
                minutes = '00';
                seconds = '00';
                clearInterval(timerInterval);
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            days = String(d).padStart(2, '0');
            hours = String(h).padStart(2, '0');
            minutes = String(m).padStart(2, '0');
            seconds = String(s).padStart(2, '0');
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        return () => clearInterval(timerInterval);
    });
</script>

<section class="promo-banner">
    <div class="banner-overlay"></div>

    <div class="container">
        <div class="banner-content">
            <!-- Левая колонка: плавный вход слева с блюром -->
            <div
                    class="banner-left promo-text-anim"
                    use:reveal={{ offset: '-80px', delay: 100 }}
            >
                <h2 class="title">
                    Дарим<br />
                    выдвижной ящик!
                </h2>
                <p class="desc">
                    Только до конца месяца при заказе шкафа или гардеробной –<br />
                    выдвижной ящик в подарок
                </p>
            </div>

            <!-- Правая колонка с карточкой таймера и кнопкой -->
            <div class="banner-right">
                <!-- Карточка таймера с каскадными цифрами -->
                <div
                        class="timer-card promo-timer-anim"
                        use:reveal={{ offset: '-80px', delay: 200 }}
                >
                    <p class="timer-header">До конца акции осталось</p>

                    <div class="timer-display">
                        <div class="timer-col">
                            <span class="timer-value">{days}</span>
                            <span class="timer-label">Дней</span>
                        </div>
                        <div class="timer-col">
                            <span class="timer-value">{hours}</span>
                            <span class="timer-label">Часов</span>
                        </div>
                        <div class="timer-col">
                            <span class="timer-value">{minutes}</span>
                            <span class="timer-label">Минут</span>
                        </div>
                        <div class="timer-col">
                            <span class="timer-value">{seconds}</span>
                            <span class="timer-label">Секунд</span>
                        </div>
                    </div>
                </div>

                <!-- Блок действия с задержкой 350мс -->
                <div
                        class="action-block promo-action-anim"
                        use:reveal={{ offset: '-80px', delay: 350 }}
                >
                    <p class="action-note">Поторопитесь! Срок акции ограничен</p>
                    <a href="#order" class="btn-order">Заказать сейчас</a>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .promo-banner {
        position: relative;
        background-image: url('/images/promo-back.png');
        background-size: cover;
        background-position: center;
        color: #ffffff;
        padding: 70px 40px;
        box-sizing: border-box;
        overflow: hidden;
    }

    .banner-overlay {
        position: absolute;
        inset: 0;
        background: rgba(24, 24, 24, 0.72);
    }

    .container {
        position: relative;
        z-index: 1;
        max-width: 1400px;
        margin: 0 auto;
    }

    .banner-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
    }

    .banner-left {
        max-width: 660px;
    }

    .title {
        font-size: 48px;
        font-weight: 700;
        line-height: 1.15;
        margin: 0 0 24px 0;
        padding-left: 20px;
        border-left: 4px solid #f5b300;
        color: #ffffff;
    }

    .desc {
        font-size: 20px;
        font-weight: 400;
        line-height: 30px;
        color: #FFFFFF;
        margin: 0;
    }

    .banner-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .timer-card {
        background: #F5F5F5;
        border-radius: 4px;
        padding: 24px 32px 28px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        width: 380px;
        box-sizing: border-box;
        text-align: center;
    }

    .timer-header {
        font-size: 20px;
        color: #000000;
        margin: 0 0 18px 0;
    }

    .timer-display {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .timer-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 54px;
    }

    .timer-value {
        background: #FFFFFF;
        padding: 8px;
        font-size: 38px;
        font-weight: 400;
        line-height: 1;
        color: #f14343;
        font-variant-numeric: tabular-nums;
        margin-bottom: 8px;
        border-radius: 4px;
    }

    .timer-label {
        font-size: 12px;
        color: #8c8c8c;
    }

    .action-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
    }

    .action-note {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
    }

    .btn-order {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 380px;
        height: 48px;
        background-color: #f5b300;
        color: #111111;
        font-size: 20px;
        font-weight: 400;
        border-radius: 4px;
        box-sizing: border-box;
        transition: background-color 0.2s, transform 0.1s;
        text-decoration: none;
    }

    .btn-order:hover {
        background-color: #e0a300;
    }

    .btn-order:active {
        transform: translateY(1px);
    }

    /* -------------------------------------------------------------
       Индивидуальные кинематические анимации
    ------------------------------------------------------------- */

    /* 1. Левый текст: мягкое появление сбоку с расфокусом */
    :global(.promo-text-anim.reveal-init) {
        opacity: 0;
        transform: translateX(-30px);
        filter: blur(6px);
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
        filter 0.8s ease-out;
        will-change: opacity, transform, filter;
    }

    :global(.promo-text-anim.revealed) {
        opacity: 1;
        transform: translateX(0);
        filter: blur(0);
    }

    /* 2. Карточка таймера: уверенный подъем снизу с увеличением глубины тени */
    :global(.promo-timer-anim.reveal-init) {
        opacity: 0;
        transform: translateY(28px) scale(0.97);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.75s ease-out;
        will-change: opacity, transform;
    }

    :global(.promo-timer-anim.revealed) {
        opacity: 1;
        transform: translateY(0) scale(1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    /* Каскадное проявление колонок со счетчиком внутри карточки */
    :global(.promo-timer-anim.reveal-init) .timer-col {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    :global(.promo-timer-anim.revealed) .timer-col:nth-child(1) {
        opacity: 1; transform: translateY(0); transition-delay: 0.1s;
    }
    :global(.promo-timer-anim.revealed) .timer-col:nth-child(2) {
        opacity: 1; transform: translateY(0); transition-delay: 0.18s;
    }
    :global(.promo-timer-anim.revealed) .timer-col:nth-child(3) {
        opacity: 1; transform: translateY(0); transition-delay: 0.26s;
    }
    :global(.promo-timer-anim.revealed) .timer-col:nth-child(4) {
        opacity: 1; transform: translateY(0); transition-delay: 0.34s;
    }

    /* 3. Кнопка заказа и подпись */
    :global(.promo-action-anim.reveal-init) {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    :global(.promo-action-anim.revealed) {
        opacity: 1;
        transform: translateY(0);
    }

    @media (max-width: 992px) {
        .banner-content {
            flex-direction: column;
            text-align: center;
        }

        .title {
            font-size: 34px;
            padding-left: 0;
            border-left: none;
        }

        :global(.promo-text-anim.reveal-init) {
            transform: translateY(20px);
        }

        .banner-right,
        .timer-card,
        .btn-order {
            width: 100%;
            max-width: 360px;
        }
    }
</style>