<script>
</script>

<header class="header">
    <nav class="top-nav">
        <a href="#about">О нас</a>
        <a href="#works">Наши работы</a>
        <a href="#promotions">Акции</a>
        <a href="#benefits">Преимущества</a>
        <a href="#reviews">Отзывы</a>
        <a href="#catalog">Каталог</a>
        <a href="#contact">Контакты</a>
    </nav>

    <div class="bottom-bar">
        <div class="phone-wrapper">
            <img src="/images/phone.svg" alt="Телефон" class="phone-icon" />

            <div class="phones">
                <a href="tel:+375297216585">+375 29 721 65 85 (МТС)</a>
                <a href="tel:+375293916585">+375 29 391 65 85 (A1)</a>
            </div>
        </div>

        <div class="logo">
            <strong>OS-DK MEBEL</strong>
            <span>Мебель на заказ</span>
        </div>

        <div class="socials">
            <a
                    href="https://www.instagram.com/os.dk.mebel"
                    target="_blank"
                    aria-label="Instagram"
                    class="social-link instagram"
            >
            </a>
        </div>
    </div>
</header>

<style>
    .header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #fff;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .top-nav {
        display: flex;
        justify-content: center;
        gap: 32px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        background: var(--text-color-l-65, #EAEAEA);
    }

    .top-nav a {
        padding: 21.5px 32px 22.5px 0;
        text-decoration: none;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        font-size: 16px;
        line-height: 20px;
        color: #333333;

        transition: color 0.2s ease-in-out;
    }

    .top-nav a:hover {
        color: #eab308;
    }

    .bottom-bar {
        display: grid;
        /* Делим на 3 колонки: левая занимает 1 часть (1fr), центр - по размеру контента (auto), правая - 1 часть (1fr) */
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 16px 40px;
        max-width: 1400px;
        margin: 0 auto;
    }

    .socials {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .social-link {
        display: inline-block;
        width: 28px;               /* Укажите точную ширину из Figma */
        height: 28px;              /* Укажите точную высоту из Figma */
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: opacity 0.2s ease-in-out;
    }

    .social-link:hover {
        opacity: 0.8;
    }

    .social-link.instagram {
        background-image: url('/images/iista.svg'); /* Путь к файлу в папке public */
    }

    .phones {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .phones a {
        text-decoration: none;
        color: #000;
        font-weight: 600;
        font-size: 15px;
    }

    .logo {
        text-align: center;
        text-transform: uppercase;
    }

    .logo strong {
        font-size: 26px;
        letter-spacing: 1px;
        color: #333333;
    }

    .logo span {
        display: block;
        font-size: 16px;
        color: #333333;
        text-transform: none;
        margin-top: 2px;
    }

    /* Общий контейнер */
    .phone-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .phone-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }

    .phones {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .phones a {
        text-decoration: none;
        font-weight: bold;
        line-height: 25px;
    }
</style>