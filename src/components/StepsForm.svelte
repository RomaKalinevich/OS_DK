<script>
    import { reveal } from '../actions/reveal.js';

    let name = '';
    let phone = '';
    let email = '';
    let agreed = false;

    let isSubmitting = false;
    let isSuccess = false;
    let errorMessage = '';

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBeyLGu0wxJgVbQn407XXsxyYaZkdYud3kGn0iv0aUHXK5hTvjwdxvqyurJPBaP5fQDA/exec';

    const steps = [
        'Впишите имя и номер телефона в форму',
        'Мы связываемся с вами, чтобы обсудить условия',
        'Специалист выезжает к вам и замеряет все данные, рисует эскиз и составляет смету',
        'Вы подписываете договор - мы реализуем вашу мебель!'
    ];

    // Форматирование телефона строго по маске +375 (XX) XXX-XX-XX
    function formatPhone(val) {
        let digits = val.replace(/\D/g, '');

        if (digits.startsWith('80')) {
            digits = '375' + digits.slice(2);
        } else if (digits.startsWith('7')) {
            digits = '375' + digits.slice(1);
        } else if (!digits.startsWith('375')) {
            digits = '375' + digits;
        }

        // 375 + ровно 9 цифр номера (суммарно 12 цифр)
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
                    email: email.trim() || 'Заявка из блока этапов (StepsForm)'
                })
            });

            isSuccess = true;
            name = '';
            phone = '';
            email = '';
            agreed = false;
        } catch (err) {
            console.error(err);
            errorMessage = 'Ошибка отправки. Попробуйте еще раз или позвоните нам.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<section id="contacts" class="steps-section">
    <div class="steps-overlay"></div>

    <div class="container">
        <div class="steps-content">
            <!-- Левая колонка: этапы -->
            <div class="steps-left">
                <h2 class="section-title">От заявки до готовой мебели</h2>

                <div class="steps-list">
                    {#each steps as text}
                        <div class="step-item">
                            <div class="step-badge">
                                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                                    <path d="M1.5 7L6.5 12L16.5 2" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <p class="step-text">{text}</p>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Правая колонка: форма -->
            <div class="steps-right">
                <form
                        class="lead-card steps-form-anim"
                        on:submit={handleSubmit}
                        use:reveal={{ offset: '-80px', delay: 200 }}>
                    {#if isSuccess}
                        <div class="success-box">
                            <div class="success-icon">✓</div>
                            <h3 class="card-title">Заявка принята!</h3>
                            <p class="success-text">Мы свяжемся с вами в ближайшее время для обсуждения деталей.</p>
                            <button type="button" class="submit-btn" on:click={() => (isSuccess = false)}>
                                Отправить еще одну
                            </button>
                        </div>
                    {:else}
                        <h3 class="card-title">Оставить заявку</h3>

                        {#if errorMessage}
                            <div class="error-msg">{errorMessage}</div>
                        {/if}

                        <div class="form-group">
                            <label for="step-name"><span>*</span> Имя</label>
                            <input
                                    id="step-name"
                                    type="text"
                                    placeholder="Ваше имя"
                                    bind:value={name}
                                    disabled={isSubmitting}
                                    required
                            />
                        </div>

                        <div class="form-group">
                            <label for="step-phone"><span>*</span> Телефон</label>
                            <input
                                    id="step-phone"
                                    type="tel"
                                    placeholder="+375 (__) ___-__-__"
                                    value={phone}
                                    on:input={handlePhoneInput}
                                    on:focus={handlePhoneFocus}
                                    on:blur={handlePhoneBlur}
                                    on:keydown={handlePhoneKeyDown}
                                    maxlength="19"
                                    disabled={isSubmitting}
                                    required
                            />
                        </div>

                        <div class="form-group">
                            <label for="step-email">E-Mail</label>
                            <input
                                    id="step-email"
                                    type="email"
                                    placeholder="example@mail.ru"
                                    bind:value={email}
                                    disabled={isSubmitting}
                            />
                        </div>

                        <div class="checkbox-group">
                            <input
                                    type="checkbox"
                                    id="step-agree"
                                    bind:checked={agreed}
                                    disabled={isSubmitting}
                                    required
                            />
                            <label for="step-agree">
                                <span>*</span> Я согласен на обработку моих
                                <a href="#privacy">персональных данных</a>
                            </label>
                        </div>

                        <button type="submit" class="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Отправка...' : 'Оставить заявку'}
                        </button>
                    {/if}
                </form>
            </div>
        </div>
    </div>
</section>

<style>
    :global(.steps-form-anim.reveal-init) {
        opacity: 0;
        transform: translateY(35px);
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1),
        transform 0.7s cubic-bezier(0.25, 1, 0.5, 1),
        box-shadow 0.7s ease-out;
        will-change: opacity, transform;
    }

    :global(.steps-form-anim.revealed) {
        opacity: 1;
        transform: translateY(0);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }

    .steps-section {
        position: relative;
        background-size: cover;
        background-position: center;
        padding: 80px 20px;
        box-sizing: border-box;
    }

    .steps-overlay {
        position: absolute;
        inset: 0;
        background-image: url('/images/steps-bg.png');
        background-repeat: no-repeat;
    }

    .container {
        position: relative;
        z-index: 1;
        max-width: 1160px;
        margin: 0 auto;
    }

    .steps-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;
    }

    .steps-left {
        flex: 1 1 auto;
    }

    .section-title {
        font-size: 34px;
        font-weight: 700;
        color: #222222;
        margin: 0 0 44px 0;
        line-height: 1.25;
    }

    .steps-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 520px;
    }

    .step-item {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .step-badge {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background-color: #f5b300;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(245, 179, 0, 0.35);
    }

    .step-text {
        margin: 0;
        font-size: 15px;
        line-height: 1.45;
        color: #444444;
    }

    .steps-right {
        flex: 0 0 380px;
    }

    .lead-card {
        background: #ffffff;
        border-radius: 4px;
        padding: 38px 32px 42px;
        width: 100%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        box-sizing: border-box;
    }

    .card-title {
        font-size: 22px;
        font-weight: 700;
        text-align: center;
        margin: 0 0 24px 0;
        color: #1a1a1a;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
    }

    .form-group label {
        font-size: 12px;
        color: #555555;
        margin-bottom: 6px;
    }

    .form-group label span,
    .checkbox-group label span {
        color: #e53935;
    }

    .form-group input {
        height: 42px;
        padding: 0 12px;
        border: 1px solid #d0d0d0;
        border-radius: 3px;
        font-family: inherit;
        font-size: 14px;
        outline: none;
        background-color: #ffffff;
        transition: border-color 0.2s;
    }

    .form-group input:focus {
        border-color: #f5b300;
    }

    .form-group input:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }

    .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 18px 0 24px;
    }

    .checkbox-group input {
        margin-top: 3px;
        accent-color: #f5b300;
        cursor: pointer;
    }

    .checkbox-group label {
        font-size: 11px;
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
        line-height: 20px;
        font-weight: 500;
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
        padding: 10px 0;
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
        font-size: 14px;
        color: #666666;
        margin: 0 0 24px 0;
        line-height: 1.4;
    }

    .error-msg {
        background-color: #ffebee;
        color: #c62828;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 16px;
        text-align: center;
        line-height: 1.4;
    }

    @media (max-width: 992px) {
        .steps-content {
            flex-direction: column;
            align-items: center;
        }

        .steps-right {
            width: 100%;
            max-width: 400px;
        }
    }
</style>