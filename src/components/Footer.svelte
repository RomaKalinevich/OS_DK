<footer id="contacts" class="footer">
    <div class="container">
        <div class="contacts-col">
            <h2>Контакты</h2>

            <div class="phones">
                <a href="tel:+375293916585">+375 29 391 65 85 (A1)</a>
                <a href="tel:+375297216585">+375 29 721 65 85 (МТС)</a>
            </div>

            <div class="schedule">
                <p>Режим работы:</p>
                <p>С 8:00 до 22:00 (без выходных)</p>
            </div>
        </div>

        <div class="legal-col">
            <p>ООО «ОС -ДК ИНВЕСТ»</p>
            <p>УНП 693271542</p>
        </div>
    </div>
</footer>

<style>
    .footer {
        /* Обязательно скопируйте точный цвет фона из Figma, сейчас здесь примерный */
        background-color: #4a4a4a;
        color: #ffffff;
        padding: 60px 40px;
        font-family: 'Montserrat', sans-serif;
    }

    .container {
        max-width: 1400px; /* Ориентируйтесь на ширину контейнера в макете */
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 30px;
    }

    .contacts-col h2 {
        font-size: 38px;
        font-weight: 700;
        margin: 0 0 24px 0;
    }


    .phones {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 24px;
    }

    .phones a {
        color: #ffffff;
        text-decoration: none;
        font-size: 22px;
        font-weight: 700;
        transition: opacity 0.2s;
    }

    .phones a:hover {
        opacity: 0.8;
    }

    /* Стили для серого текста (режим работы и УНП) */
    .schedule p, .legal-col p {
        margin: 0;
        /* Замените на точный цвет из Figma */
        color: #cccccc;
        font-size: 14px;
        line-height: 1.5;
    }

    .legal-col {
        text-align: right;
    }

    @media (max-width: 768px) {
        .container {
            flex-direction: column;
            align-items: flex-start;
        }
        .legal-col {
            text-align: left;
            margin-top: 10px;
        }
    }
</style>