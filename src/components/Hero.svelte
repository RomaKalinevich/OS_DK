<script>
    let name = $state('');
    let phone = $state('');
    let agreed = $state(false);

    function handleSubmit(event) {
        event.preventDefault();
        if (!agreed) {
            alert('Пожалуйста, подтвердите согласие на обработку персональных данных');
            return;
        }
        console.log({name, phone});
    }
</script>

<section class="hero">
    <div class="hero-overlay"></div>

    <div class="container">
        <div class="hero-content">
            <div class="hero-left">
                <span class="subtitle">Заполните заявку чтобы получить скидку 10%</span>
                <h1 class="title">Мебель любой <br />сложности на заказ</h1>

                <div class="features-grid">
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
                <form class="lead-card" onsubmit={handleSubmit}>
                    <h3>Хочу 10% скидку</h3>

                    <div class="form-group">
                        <label for="name"><span>*</span> Имя</label>
                        <input
                                id="name"
                                type="text"
                                bind:value={name}
                                required
                        />
                    </div>

                    <div class="form-group">
                        <label for="phone"><span>*</span> Телефон</label>
                        <input
                                id="phone"
                                type="tel"
                                placeholder="+375 (__) ___-__-__"
                                bind:value={phone}
                                required
                        />
                    </div>

                    <div class="checkbox-group">
                        <input
                                type="checkbox"
                                id="agree"
                                bind:checked={agreed}
                                required
                        />
                        <label for="agree">
                            <span>*</span> Я согласен на обработку моих
                            <a href="#privacy">персональных данных</a>
                        </label>
                    </div>

                    <button type="submit" class="submit-btn">Отправить заявку</button>
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
        background: rgba(26, 26, 26, 0.72);
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
        line-height: 28.8px;
        color: rgba(255, 255, 255, 0.7); /* то же самое, что #FFFFFFB2 */
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
        gap: 28px 13px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .feature-item p {
        margin: 0;
        font-size: 20px;
        line-height: 1.4;
        color: #FFFFFF99;
    }

    .feature-icon {
        width: 96px;
        height: 96px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .hero-right {
        display: flex;
        justify-content: flex-end;
    }

    .lead-card {
        background: #ffffff;
        color: #1a1a1a;
        border-radius: 8px;
        padding: 40px 36px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
    }

    .lead-card h3 {
        font-size: 32px;
        font-weight: 600;
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
        font-size: 17px;
        font-weight: 400;
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
        .hero-content {
            grid-template-columns: 1fr;
        }

        .hero-right {
            justify-content: center;
        }
    }

    @media (max-width: 576px) {
        .features-grid {
            grid-template-columns: 1fr;
        }

        .title {
            font-size: 30px;
        }
    }
</style>