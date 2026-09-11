<script>
    import { reveal } from '../actions/reveal.js';

    let name = $state('');
    let phone = $state('');
    let agreed = $state(false);

    let isSubmitting = $state(false);
    let isSuccess = $state(false);
    let errorMessage = $state('');

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBeyLGu0wxJgVbQn407XXsxyYaZkdYud3kGn0iv0aUHXK5hTvjwdxvqyurJPBaP5fQDA/exec';

    // Жесткая маска +375 (XX) XXX-XX-XX
    function formatPhone(val) {
        let digits = val.replace(/\D/g, '');

        if (digits.startsWith('80')) {
            digits = '375' + digits.slice(2);
        } else if (digits.startsWith('7')) {
            digits = '375' + digits.slice(1);
        } else if (!digits.startsWith('375')) {
            digits = '375' + digits;
        }

        digits = digits.slice(0, 12);
        const local = digits.slice(3);
        let res = '+375';

        if (local.length > 0) {
            res += ' (' + local.slice(0, 2);
        }
        if (local.length >= 2) {
            res += ') ' + local.slice(2, 5);
        }
        if (local.length >= 5) {
            res += '-' + local.slice(5, 7);
        }
        if (local.length >= 7) {
            res += '-' + local.slice(7, 9);
        }

        return res;
    }

    function handlePhoneInput(event) {
        const input = event.target;
        const formatted = formatPhone(input.value);
        phone = formatted;
        input.value = formatted;
        if (errorMessage) errorMessage = '';
    }

    function handlePhoneFocus(event) {
        if (!phone) {
            phone = '+375 (';
            event.target.value = phone;
        }
    }

    function handlePhoneBlur() {
        if (phone === '+375 (' || phone === '+375') {
            phone = '';
        }
    }

    function handlePhoneKeyDown(event) {
        if (event.key === 'Backspace') {
            const val = event.target.value;
            if (val.endsWith('-') || val.endsWith(') ') || val.endsWith('(')) {
                event.preventDefault();
                const cleaned = val.replace(/[-()\s]+$/, '');
                phone = formatPhone(cleaned.slice(0, -1));
                event.target.value = phone;
            }
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        errorMessage = '';

        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 12) {
            errorMessage = 'Пожалуйста, введите полный номер телефона: +375 (XX) XXX-XX-XX';
            return;
        }

        if (!agreed) {
            errorMessage = 'Пожалуйста, подтвердите согласие на обработку персональных данных';
            return;
        }

        isSubmitting = true;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: 'Заявка на скидку 10% (Hero)'
                })
            });

            isSuccess = true;
            name = '';
            phone = '';
            agreed = false;
        } catch (err) {
            console.error(err);
            errorMessage = 'Ошибка отправки. Попробуйте еще раз или позвоните нам.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<section class="hero">
    <div class="hero-overlay"></div>

    <div class="container">
        <div class="hero-content">
            <div class="hero-left">
                <span class="subtitle">Заполните заявку чтобы получить скидку 10%</span>
                <h1 class="title">Мебель любой <br/>сложности на заказ</h1>

                <div
                        class="features-grid hero-features-anim"
                        use:reveal={{ offset: '0px', delay: 80 }}
                >
                    <div class="feature-item">
                        <img class="feature-icon" src="/images/fill-application.png" alt="Шаг 1"/>
                        <p>Заполните заявку на сайте или позвоните нам</p>
                    </div>

                    <div class="feature-item">
                        <img class="feature-icon" src="/images/recall.png" alt="Шаг 2"/>
                        <p>Перезваниваем вам и обговариваем детали заказа</p>
                    </div>

                    <div class="feature-item">
                        <img class="feature-icon" src="/images/delivery.png" alt="Шаг 3"/>
                        <p>Осуществляем доставку по указанному вами адресу</p>
                    </div>

                    <div class="feature-item">
                        <img class="feature-icon" src="/images/pay.svg" alt="Шаг 4"/>
                        <p>Вы производите оплату любым удобным способом</p>
                    </div>
                </div>
            </div>

            <div class="hero-right">
                <form
                        class="lead-card hero-form-anim"
                        onsubmit={handleSubmit}
                        use:reveal={{ offset: '0px', delay: 150 }}
                >
                    {#if isSuccess}
                        <div class="success-box">
                            <div class="success-icon">✓</div>
                            <h3>Заявка принята!</h3>
                            <p class="success-text">Скидка 10% зафиксирована за вашим номером. Мы перезвоним вам в ближайшее время!</p>
                            <button type="button" class="submit-btn" onclick={() => (isSuccess = false)}>
                                Отправить еще
                            </button>
                        </div>
                    {:else}
                        <h3>Хочу 10% скидку</h3>

                        {#if errorMessage}
                            <div class="error-msg">{errorMessage}</div>
                        {/if}

                        <div class="form-group">
                            <label for="name"><span>*</span> Имя</label>
                            <input
                                    id="name"
                                    type="text"
                                    placeholder="Ваше имя"
                                    bind:value={name}
                                    disabled={isSubmitting}
                                    required
                            />
                        </div>

                        <div class="form-group">
                            <label for="phone"><span>*</span> Телефон</label>
                            <input
                                    id="phone"
                                    type="tel"
                                    placeholder="+375 (__) ___-__-__"
                                    value={phone}
                                    oninput={handlePhoneInput}
                                    onfocus={handlePhoneFocus}
                                    onblur={handlePhoneBlur}
                                    onkeydown={handlePhoneKeyDown}
                                    maxlength="19"
                                    disabled={isSubmitting}
                                    required
                            />
                        </div>

                        <div class="checkbox-group">
                            <input
                                    type="checkbox"
                                    id="agree"
                                    bind:checked={agreed}
                                    disabled={isSubmitting}
                                    required
                            />
                            <label for="agree">
                                <span>*</span> Я согласен на обработку моих
                                <a
                                        href="/privacy-policy.docx"
                                        download="Политика_конфиденциальности.docx"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                >
                                    персональных данных
                                </a>
                            </label>
                        </div>

                        <button type="submit" class="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                        </button>
                    {/if}
                </form>
            </div>
        </div>
    </div>
</section>

<style>
    .hero {
        position: relative;
        background-image: url('/images/hero-bg.png');
        background-size: cover;
        background-position: center;
        min-height: 720px;
        display: flex;
        align-items: center;
        color: #ffffff;
    }

    .hero-overlay {
        position: absolute;
        inset: 0;
        background: rgba(26, 26, 26, 0.78);
    }

    .container {
        position: relative;
        z-index: 1;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
        padding: 60px 40px;
        box-sizing: border-box;
    }

    .hero-content {
        display: grid;
        grid-template-columns: 1.3fr 0.9fr;
        gap: 60px;
        align-items: center;
    }

    .subtitle {
        display: block;
        font-size: 24px;
        font-weight: 400;
        line-height: 29px;
        color: rgba(255, 255, 255, 0.75);
        margin-bottom: 12px;
    }

    .title {
        font-size: 42px;
        font-weight: 700;
        line-height: 1.25;
        margin: 0 0 48px 0;
        padding-left: 20px;
        border-left: 4px solid #f5b300;
        color: #ffffff;
    }

    .features-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px 20px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .feature-icon {
        width: 96px;
        height: 96px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .feature-item p {
        margin: 0;
        font-size: 18px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.85);
    }

    .hero-right {
        display: flex;
        justify-content: flex-end;
    }

    .lead-card {
        background: #ffffff;
        color: #1a1a1a;
        border-radius: 8px;
        padding: 40px 32px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
    }

    .lead-card h3 {
        font-size: 28px;
        font-weight: 700;
        text-align: center;
        margin: 0 0 24px 0;
        color: #000000;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 18px;
    }

    .form-group label {
        font-size: 13px;
        color: #4f4f4f;
        margin-bottom: 6px;
    }

    .form-group label span,
    .checkbox-group label span {
        font-size: 16px;
        font-weight: 600;
        color: #eb5757;
    }

    .form-group input {
        height: 44px;
        padding: 0 14px;
        background-color: #f4f4f4;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-family: inherit;
        font-size: 15px;
        outline: none;
        transition: border-color 0.2s;
    }

    .form-group input:focus {
        border-color: #f5b300;
        background-color: #ffffff;
    }

    .form-group input:disabled {
        background-color: #e9e9e9;
        cursor: not-allowed;
    }

    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 20px 0 24px;
    }

    .checkbox-group input {
        margin-top: 3px;
        accent-color: #f5b300;
        cursor: pointer;
    }

    .checkbox-group label {
        font-size: 12px;
        line-height: 1.4;
        color: #666666;
        cursor: pointer;
    }

    .checkbox-group a {
        color: #f5b300;
        text-decoration: underline;
    }

    .submit-btn {
        width: 100%;
        height: 48px;
        background-color: #FFC700;
        color: #111111;
        border: none;
        border-radius: 4px;
        font-family: inherit;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: #e0a300;
    }

    .submit-btn:active:not(:disabled) {
        transform: translateY(1px);
    }

    .submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .success-box {
        text-align: center;
        padding: 8px 0;
    }

    .success-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background-color: #f5b300;
        color: #111111;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: bold;
        margin: 0 auto 16px;
    }

    .success-text {
        font-size: 15px;
        color: #666666;
        margin: 0 0 24px 0;
        line-height: 1.4;
    }

    .error-msg {
        background-color: #ffebee;
        color: #c62828;
        padding: 10px;
        border-radius: 4px;
        font-size: 13px;
        margin-bottom: 16px;
        text-align: center;
        line-height: 1.4;
    }

    /* ---------------- Анимации (Десктоп) ---------------- */
    :global(.hero-form-anim.reveal-init) {
        opacity: 0;
        transform: translateX(24px) scale(0.97);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.75s ease-out;
        will-change: opacity, transform;
    }

    :global(.hero-form-anim.revealed) {
        opacity: 1;
        transform: translateX(0) scale(1);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    }

    :global(.hero-features-anim.reveal-init) .feature-item {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.65s ease-out,
        transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    :global(.hero-features-anim.revealed) .feature-item:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
    :global(.hero-features-anim.revealed) .feature-item:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }
    :global(.hero-features-anim.revealed) .feature-item:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
    :global(.hero-features-anim.revealed) .feature-item:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }

    /* ---------------- Адаптив под мобилку (390px) ---------------- */
    @media (max-width: 992px) {
        .hero {
            min-height: auto;
            padding: 40px 0 60px;
        }

        .container {
            padding: 0 20px;
        }

        .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
        }

        .subtitle {
            font-size: 20px;
            line-height: 24px;
            font-weight: 400;
            margin-bottom: 12px;
        }

        .title {
            font-size: 28px;
            line-height: 1.25;
            padding-left: 14px;
            border-left-width: 3.5px;
            margin-bottom: 32px;
        }

        /* 1 колонка шагов строго по макету */
        .features-grid {
            grid-template-columns: 1fr;
            gap: 18px;
        }

        .feature-item {
            gap: 14px;
        }

        .feature-icon {
            width: 52px;
            height: 52px;
        }

        .feature-item p {
            font-size: 14px;
            line-height: 1.35;
            color: rgba(255, 255, 255, 0.9);
        }

        /* Форма по центру внизу */
        .hero-right {
            justify-content: center;
            width: 100%;
        }

        .lead-card {
            max-width: 100%;
            padding: 32px 20px;
            border-radius: 6px;
        }

        .lead-card h3 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        /* Максимально мягкое скрытое состояние формы */
        :global(.hero-form-anim.reveal-init) {
            opacity: 0 !important;
            transform: translateY(6px) !important;
            box-shadow: 0 0 0 rgba(0, 0, 0, 0) !important;
            transition:
                    opacity 0.95s cubic-bezier(0.25, 0.1, 0.25, 1),
                    transform 1.05s cubic-bezier(0.12, 0.98, 0.24, 1),
                    box-shadow 1.1s ease !important;
            will-change: opacity, transform, box-shadow;
        }

        /* Шелковистый набор плотности и глубины с задержкой */
        :global(.hero-form-anim.revealed) {
            opacity: 1 !important;
            transform: translateY(0) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22) !important;
            transition-delay: 0.15s !important;
        }

        /* Шаги преимуществ */
        :global(.hero-features-anim.reveal-init) .feature-item {
            transform: translateY(10px) !important;
            transition: opacity 0.45s ease-out,
            transform 0.52s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        :global(.hero-features-anim.revealed) .feature-item:nth-child(1) { transition-delay: 0.05s !important; }
        :global(.hero-features-anim.revealed) .feature-item:nth-child(2) { transition-delay: 0.10s !important; }
        :global(.hero-features-anim.revealed) .feature-item:nth-child(3) { transition-delay: 0.15s !important; }
        :global(.hero-features-anim.revealed) .feature-item:nth-child(4) { transition-delay: 0.20s !important; }
    }
</style>