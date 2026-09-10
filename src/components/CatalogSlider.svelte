<script>
    // Vite автоматически собирает все изображения
    const imageModules = import.meta.glob(
        '/src/assets/catalog/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );
    const images = Object.values(imageModules);

    // Разбиваем массив всех фото на группы по 5 штук под сетку
    const PAGE_SIZE = 5;
    const pages = [];
    for (let i = 0; i < images.length; i += PAGE_SIZE) {
        pages.push(images.slice(i, i + PAGE_SIZE));
    }

    let currentPage = 0;
    let activeImage = null;

    function prevPage() {
        if (pages.length <= 1) return;
        currentPage = (currentPage - 1 + pages.length) % pages.length;
    }

    function nextPage() {
        if (pages.length <= 1) return;
        currentPage = (currentPage + 1) % pages.length;
    }

    function openModal(src) {
        activeImage = src;
    }

    function closeModal() {
        activeImage = null;
    }

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section id="furniture" class="catalog-section">
    <div class="container">
        <h2 class="title">Каталог уже установленной мебели</h2>

        {#if pages.length > 0}
            {@const currentPhotos = pages[currentPage]}
            <div class="collage-wrapper">
                <!-- Кнопка листания назад -->
                {#if pages.length > 1}
                    <button class="nav-btn prev" on:click={prevPage} aria-label="Предыдущая страница">
                        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                            <path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                {/if}

                <!-- Сетка 5 фотографий -->
                <div class="collage-grid">
                    <!-- Левая колонка (2 фото) -->
                    <div class="grid-col side-col">
                        {#if currentPhotos[0]}
                            <button type="button" class="img-box" on:click={() => openModal(currentPhotos[0])}>
                                <img src={currentPhotos[0]} alt="Мебель 1" loading="lazy" />
                            </button>
                        {/if}
                        {#if currentPhotos[1]}
                            <button type="button" class="img-box" on:click={() => openModal(currentPhotos[1])}>
                                <img src={currentPhotos[1]} alt="Мебель 2" loading="lazy" />
                            </button>
                        {/if}
                    </div>

                    <!-- Центральная колонка (1 высокое вертикальное фото) -->
                    <div class="grid-col center-col">
                        {#if currentPhotos[2]}
                            <button type="button" class="img-box tall" on:click={() => openModal(currentPhotos[2])}>
                                <img src={currentPhotos[2]} alt="Мебель 3" loading="lazy" />
                            </button>
                        {/if}
                    </div>

                    <!-- Правая колонка (2 фото) -->
                    <div class="grid-col side-col">
                        {#if currentPhotos[3]}
                            <button type="button" class="img-box" on:click={() => openModal(currentPhotos[3])}>
                                <img src={currentPhotos[3]} alt="Мебель 4" loading="lazy" />
                            </button>
                        {/if}
                        {#if currentPhotos[4]}
                            <button type="button" class="img-box" on:click={() => openModal(currentPhotos[4])}>
                                <img src={currentPhotos[4]} alt="Мебель 5" loading="lazy" />
                            </button>
                        {/if}
                    </div>
                </div>

                <!-- Кнопка листания вперед -->
                {#if pages.length > 1}
                    <button class="nav-btn next" on:click={nextPage} aria-label="Следующая страница">
                        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                            <path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                {/if}
            </div>

            <!-- Индикаторы страниц -->
            {#if pages.length > 1}
                <div class="dots-wrapper">
                    {#each pages as _, index}
                        <button
                                class="dot"
                                class:active={currentPage === index}
                                on:click={() => (currentPage = index)}
                                aria-label="Страница {index + 1}"
                        ></button>
                    {/each}
                </div>
            {/if}
        {:else}
            <p class="empty-msg">В папке <code>src/assets/catalog/</code> пока нет фото.</p>
        {/if}
    </div>
</section>

<!-- Модальное окно просмотра фото -->
{#if activeImage}
    <div class="lightbox" on:click={closeModal} role="dialog" aria-modal="true">
        <div class="lightbox-content" on:click|stopPropagation>
            <button class="close-btn" on:click={closeModal} aria-label="Закрыть">✕</button>
            <img src={activeImage} alt="Увеличенное изображение мебели" />
        </div>
    </div>
{/if}

<style>
    .catalog-section {
        padding: 80px 40px;
        background-color: #ffffff;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
    }

    .title {
        text-align: center;
        font-size: 34px;
        font-weight: 700;
        color: #222222;
        margin: 0 0 54px 0;
    }

    .collage-wrapper {
        position: relative;
        margin: 0 auto;
    }

    /* Сетка коллажа как в Figma */
    .collage-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        height: 628px;
    }

    .side-col {
        display: grid;
        grid-template-rows: 1fr 1fr;
        gap: 16px;
        height: 100%;
    }

    .center-col {
        height: 100%;
    }

    /* Кнопки-обертки для картинок */
    .img-box {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
        background-color: #f0f0f0;
        cursor: pointer;
        overflow: hidden;
        position: relative;
    }

    .img-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
    }

    .img-box:hover img {
        transform: scale(1.03);
    }

    /* Желтые кнопки листания */
    .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: #f5b300;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s, transform 0.1s;
    }

    .nav-btn:hover {
        background-color: #e0a300;
    }

    .nav-btn:active {
        transform: translateY(-50%) scale(0.92);
    }

    .nav-btn.prev {
        left: -22px;
    }

    .nav-btn.next {
        right: -22px;
    }

    /* Точки */
    .dots-wrapper {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: none;
        background-color: #d1d5db;
        cursor: pointer;
        padding: 0;
        transition: all 0.2s;
    }

    .dot.active {
        background-color: #f5b300;
        transform: scale(1.25);
    }

    /* Лайтбокс */
    .lightbox {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.88);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
    }

    .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
    }

    .lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .close-btn {
        position: absolute;
        top: -46px;
        right: 0;
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 32px;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
    }

    .empty-msg {
        text-align: center;
        color: #888888;
    }

    @media (max-width: 900px) {
        .collage-grid {
            grid-template-columns: 1fr;
            height: auto;
            gap: 12px;
        }

        .side-col {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: none;
            height: 220px;
        }

        .center-col {
            height: 380px;
        }

        .nav-btn.prev {
            left: 10px;
        }

        .nav-btn.next {
            right: 10px;
        }
    }
</style>