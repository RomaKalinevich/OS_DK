<script>
    let isMenuOpen = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }
</script>

<!-- Фиксированная верхняя плашка -->
<header class="header">
    <!-- Десктопная полоса навигации -->
    <nav class="desktop-nav">
        <a href="#about">О нас</a>
        <a href="#works">Наши работы</a>
        <a href="#promotions">Акции</a>
        <a href="#benefits">Преимущества</a>
        <a href="#reviews">Отзывы</a>
        <a href="#catalog">Каталог</a>
        <a href="#contact">Контакты</a>
    </nav>

    <!-- Мобильная серая полоска с бургером -->
    <div class="mobile-top-bar">
        <button
                type="button"
                class="burger-btn"
                onclick={toggleMenu}
                aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>

    <!-- Десктопный нижний бар (на мобилке скрывается) -->
    <div class="desktop-bottom-bar">
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
                    href="https://t.me/+375293916585"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                    class="social-link telegram"
            ></a>

            <a
                    href="viber://chat?number=%2B375293916585"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Viber"
                    class="social-link viber"
            ></a>

            <a
                    href="https://www.instagram.com/os.dk.mebel"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    class="social-link instagram"
            ></a>
        </div>
    </div>
</header>

<!-- Мобильный статичный белый инфо-блок под шапкой -->
<div class="mobile-static-info">
    <div class="logo">
        <strong>OS-DK MEBEL</strong>
        <span>Мебель на заказ</span>
    </div>

    <div class="phones">
        <a href="tel:+375293916585">+375 29 391 65 85 (A1)</a>
        <a href="tel:+375297216585">+375 29 721 65 85 (МТС)</a>
    </div>

    <div class="socials">
        <a
                href="https://t.me/+375293916585"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                class="social-link telegram"
        ></a>

        <a
                href="viber://chat?number=%2B375293916585"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Viber"
                class="social-link viber"
        ></a>

        <a
                href="https://www.instagram.com/os.dk.mebel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                class="social-link instagram"
        ></a>
    </div>
</div>

<!-- Затемнение фона при открытом меню -->
{#if isMenuOpen}
    <div class="menu-backdrop" onclick={closeMenu} role="presentation"></div>
{/if}

<!-- Выезжающая справа шторка мобильного меню -->
<aside class="mobile-drawer" class:open={isMenuOpen}>
    <div class="drawer-header">
        <button type="button" class="close-btn" onclick={closeMenu} aria-label="Закрыть">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>

    <nav class="drawer-nav">
        <a href="#about" onclick={closeMenu}>О нас</a>
        <a href="#works" onclick={closeMenu}>Наши работы</a>
        <a href="#promotions" onclick={closeMenu}>Акции</a>
        <a href="#benefits" onclick={closeMenu}>Преимущества</a>
        <a href="#reviews" onclick={closeMenu}>Отзывы</a>
        <a href="#catalog" onclick={closeMenu}>Каталог</a>
        <a href="#contact" onclick={closeMenu}>Контакты</a>
    </nav>
</aside>

<style>
    .header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #ffffff;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    /* ---------------- Desktop Nav ---------------- */
    .desktop-nav {
        display: flex;
        justify-content: center;
        gap: 32px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        background: #EAEAEA;
    }

    .desktop-nav a {
        padding: 21px 16px;
        text-decoration: none;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        font-size: 16px;
        line-height: 20px;
        color: #333333;
        transition: color 0.2s ease-in-out;
    }

    .desktop-nav a:hover {
        color: #eab308;
    }

    /* ---------------- Desktop Bottom Bar ---------------- */
    .desktop-bottom-bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 16px 40px;
        max-width: 1400px;
        margin: 0 auto;
    }

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
        gap: 2px;
    }

    .phones a {
        text-decoration: none;
        color: #222222;
        font-weight: 700;
        font-size: 15px;
        line-height: 1.35;
        font-family: 'Montserrat', sans-serif;
    }

    .logo {
        text-align: center;
        text-transform: uppercase;
    }

    .logo strong {
        font-size: 24px;
        letter-spacing: 0.5px;
        color: #222222;
        display: block;
        font-weight: 800;
    }

    .logo span {
        display: block;
        font-size: 14px;
        color: #666666;
        text-transform: none;
        margin-top: 2px;
        font-weight: 500;
    }

    .socials {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        align-items: center;
    }

    .social-link {
        display: inline-block;
        width: 28px;
        height: 28px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: opacity 0.2s ease-in-out;
    }

    .social-link.instagram {
        background-image: url('/images/iista.svg');
    }

    .social-link.telegram {
        background-image: url('/images/telegram.svg');
    }

    .social-link.viber {
        background-image: url('/images/viber.svg');
    }

    .social-link.instagram-circle {
        width: 36px;
        height: 36px;
        background-image: url('/images/iista.svg');
    }

    /* Скрыты на десктопе */
    .mobile-top-bar,
    .mobile-static-info,
    .mobile-drawer,
    .menu-backdrop {
        display: none;
    }

    /* ---------------- Mobile ---------------- */
    @media (max-width: 992px) {
        .desktop-nav,
        .desktop-bottom-bar {
            display: none;
        }

        /* Серая полоска меню сверху */
        .mobile-top-bar {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 52px;
            background-color: #E5E5E5;
            position: relative;
        }

        .burger-btn {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            padding: 0;
        }

        .burger-btn span {
            display: block;
            width: 22px;
            height: 2.2px;
            background-color: #333333;
            border-radius: 2px;
        }

        /* Белый блок с контактами под шапкой */
        .mobile-static-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #ffffff;
            padding: 24px 20px 20px;
            text-align: center;
            gap: 14px;
            margin-top: 52px; /* компенсация высоты fixed шапки */
        }

        .mobile-static-info .logo strong {
            font-size: 20px;
        }

        .mobile-static-info .logo span {
            font-size: 13px;
        }

        .mobile-static-info .phones a {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.4;
        }

        .mobile-static-info .socials {
            justify-content: center;
            margin-top: 2px;
        }

        /* Выезжающая шторка справа */
        .mobile-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            right: 0;
            width: 68vw;
            max-width: 280px;
            height: 100vh;
            background-color: #ECECEC;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
        }

        .mobile-drawer.open {
            transform: translateX(0);
        }

        .drawer-header {
            height: 52px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 0 16px;
        }

        .close-btn {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            padding: 0;
        }

        .close-btn span {
            display: block;
            width: 22px;
            height: 2.2px;
            background-color: #333333;
            border-radius: 2px;
        }

        .drawer-nav {
            display: flex;
            flex-direction: column;
            padding: 0 24px;
            gap: 20px;
        }

        .drawer-nav a {
            text-decoration: none;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #333333;
            transition: color 0.2s;
        }

        .drawer-nav a:hover,
        .drawer-nav a:active {
            color: #f5b300;
        }

        .menu-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 1500;
        }
    }
</style>