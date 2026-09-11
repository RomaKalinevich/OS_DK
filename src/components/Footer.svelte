<footer id="contact" class="footer">
    <div class="container">
        <div class="contacts-col">
            <h2 class="title">Контакты</h2>

            <div class="phones">
                <a href="tel:+375293916585">+375 29 391 65 85 (A1)</a>
                <a href="tel:+375297216585">+375 29 721 65 85 (МТС)</a>
            </div>

            <!-- Соцсети и мессенджеры -->
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

            <div class="schedule">
                <p>Режим работы:</p>
                <p>С 8:00 до 22:00</p>
                <p>без выходных</p>
            </div>
        </div>

        <div class="legal-col">
            <p class="company-name">ООО «ОС -ДК ИНВЕСТ»</p>
            <p class="unp">УНП 693271542</p>
            <p class="disclaimer">
                Данный веб-сайт носит исключительно справочный характер и информация на нем не является публичной офертой
            </p>
        </div>
    </div>
</footer>

<style>
    .footer {
        background-color: #3f3f3f;
        color: #ffffff;
        padding: 60px 40px;
        font-family: 'Montserrat', sans-serif;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 32px;
    }

    .contacts-col {
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 38px;
        font-weight: 700;
        margin: 0 0 24px 0;
        color: #ffffff;
    }

    .phones {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
    }

    .phones a {
        color: #ffffff;
        text-decoration: none;
        font-size: 22px;
        font-weight: 700;
        line-height: 1.35;
        transition: opacity 0.2s ease;
    }

    .phones a:hover {
        opacity: 0.8;
    }

    .socials {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 24px;
    }

    .social-link {
        display: inline-block;
        width: 30px;
        height: 30px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: opacity 0.2s ease, transform 0.15s ease;
    }

    .social-link:hover {
        opacity: 0.8;
        transform: translateY(-2px);
    }

    .social-link.telegram {
        background-image: url('/images/telegram.svg');
    }

    .social-link.viber {
        background-image: url('/images/viber.svg');
    }

    .social-link.instagram {
        background-image: url('/images/iista.svg');
    }

    .schedule p,
    .legal-col p {
        margin: 0;
        color: #d1d1d1;
        font-size: 15px;
        line-height: 1.5;
        font-weight: 400;
    }

    .legal-col {
        text-align: right;
        max-width: 420px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .company-name {
        font-weight: 600;
        color: #ffffff;
    }

    .disclaimer {
        margin-top: 10px !important;
        font-size: 12px !important;
        line-height: 1.45 !important;
        color: #9e9e9e !important;
    }

    /* ---------------- Адаптив под мобилку (<= 768px) ---------------- */
    @media (max-width: 768px) {
        .footer {
            padding: 40px 24px 48px;
        }

        .container {
            flex-direction: column;
            align-items: flex-start;
            gap: 28px;
        }

        .title {
            font-size: 28px;
            margin-bottom: 20px;
        }

        .phones {
            gap: 6px;
            margin-bottom: 16px;
        }

        .phones a {
            font-size: 17px;
            font-weight: 700;
        }

        .socials {
            margin-bottom: 20px;
            gap: 16px;
        }

        .social-link {
            width: 28px;
            height: 28px;
        }

        .schedule p,
        .legal-col p {
            font-size: 14px;
            line-height: 1.45;
            color: #d8d8d8;
        }

        .legal-col {
            text-align: left;
            margin-top: 6px;
            max-width: 100%;
        }

        .disclaimer {
            margin-top: 8px !important;
            font-size: 11.5px !important;
            color: #aaaaaa !important;
        }
    }
</style>