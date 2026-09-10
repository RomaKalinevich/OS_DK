<script>
    let name = '';
    let phone = '';
    let email = '';
    let agreed = false;

    const steps = [
        'Впишите имя и номер телефона в форму',
        'Мы связываемся с вами, чтобы обсудить условия',
        'Специалист выезжает к вам и замеряет все данные, рисует эскиз и составляет смету',
        'Вы подписываете договор - мы реализуем вашу мебель!'
    ];

    function handleSubmit(event) {
        event.preventDefault();
        if (!agreed) {
            alert('Пожалуйста, подтвердите согласие на обработку персональных данных');
            return;
        }
        // Отправка данных формы
        console.log({ name, phone, email });
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
                    <h3 class="card-title">Оставить заявку</h3>

                    <div class="form-group">
                        <label for="step-name"><span>*</span> Имя</label>
                        <input
                                id="step-name"
                                type="text"
                                bind:value={name}
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
                                required
                        />
                    </div>

                    <div class="form-group">
                        <label for="step-email">E-Mail</label>
                        <input
                                id="step-email"
                                type="email"
                                bind:value={email}
                        />
                    </div>

                    <div class="checkbox-group">
                        <input
                                type="checkbox"
                                id="step-agree"
                                bind:checked={agreed}
                                required
                        />
                        <label for="step-agree">
                            <span>*</span> Я согласен на обработку моих
                            <a href="#privacy">персональных данных</a>
                        </label>
                    </div>

                    <button type="submit" class="submit-btn">Оставить</button>
                </form>
            </div>
        </div>
    </div>
</section>

<style>
    .steps-section {
        position: relative;
        background-size: cover;
        background-position: center;
        padding: 80px 40px;
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
        max-width: 1400px;
        margin: 0 auto;
    }

    .steps-content {
        display: grid;
        grid-template-columns: 1.25fr 0.95fr;
        gap: 60px;
        align-items: center;
    }

    .section-title {
        font-size: 38px;
        font-weight: 700;
        color: #333333;
        margin: 0 0 44px 0;
        line-height: 1.25;
    }

    .steps-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 580px;
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
        font-size: 20px;
        font-weight: 400;
        line-height: 30px;
        color: #333333;
    }

    .steps-right {
        display: flex;
        justify-content: flex-end;
    }

    .lead-card {
        background: #ffffff;
        border-radius: 4px;
        padding: 38px 36px 42px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.08);
        box-sizing: border-box;
    }

    .card-title {
        font-size: 26px;
        font-weight: 600;
        text-align: center;
        color: #333333;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
    }

    .form-group label {
        font-size: 14px;
        font-weight: 400;
        color: #333333;
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
        font-size: 20px;
        line-height: 20px;
        font-weight: 400;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
    }

    .submit-btn:hover {
        background-color: #e0a300;
    }

    .submit-btn:active {
        transform: translateY(1px);
    }

    @media (max-width: 992px) {
        .steps-content {
            grid-template-columns: 1fr;
        }

        .steps-right {
            justify-content: center;
        }

        .section-title {
            font-size: 28px;
        }
    }

    @media (max-width: 576px) {
        .steps-section {
            padding: 50px 20px;
        }

        .lead-card {
            padding: 28px 20px;
        }
    }
</style>