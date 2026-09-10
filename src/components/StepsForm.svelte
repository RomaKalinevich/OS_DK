<script>
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

    async function handleSubmit(event) {
        event.preventDefault();
        if (!agreed) {
            alert('Пожалуйста, подтвердите согласие на обработку персональных данных');
            return;
        }

        isSubmitting = true;
        errorMessage = '';

        try {
            /*
               mode: 'no-cors' необходим, так как Google Apps Script делает 302-редирект,
               который браузер без прокси блокирует по политике CORS.
               С 'no-cors' данные успешно доходят и записываются в таблицу.
            */
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim()
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
                <form class="lead-card" on:submit={handleSubmit}>
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
                                    bind:value={phone}
                                    disabled={isSubmitting}
                                    required
                            />
                        </div>

                        <div class="form-group">
                            <label for="step-email">E-Mail</label>
                            <input
                                    id="step-email"
                                    type="email"
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
                            {isSubmitting ? 'Отправка...' : 'Оставить'}
                        </button>
                    {/if}
                </form>
            </div>
        </div>
    </div>
</section>

<style>
    .steps-section {
        position: relative;
        background-color: #ededed;
        background-image: url('/images/steps-bg.png');
        background-size: cover;
        background-position: center;
        padding: 80px 20px;
        box-sizing: border-box;
    }

    .steps-overlay {
        position: absolute;
        inset: 0;
        background: rgba(245, 245, 245, 0.88);
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
        height: 46px;
        background-color: #f5b300;
        color: #111111;
        border: none;
        border-radius: 3px;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s, opacity 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: #e0a300;
    }

    .submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    /* Экран успешной отправки */
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