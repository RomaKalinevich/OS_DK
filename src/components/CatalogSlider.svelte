<script>
    import { reveal } from '../actions/reveal.js';

    const imageModules = import.meta.glob(
        '/assets/catalog/*.{jpg,jpeg,png,webp}',
        { eager: true, import: 'default' }
    );
    const images = Object.values(imageModules);

    const PAGE_SIZE = 5;
    const pages = [];
    for (let i = 0; i < images.length; i += PAGE_SIZE) {
        pages.push(images.slice(i, i + PAGE_SIZE));
    }

    let currentPage = 0;
    let activeImageIndex = null; // Индекс текущего открытого фото (null, если закрыто)

    function prevPage() {
        if (pages.length <= 1) return;
        currentPage = (currentPage - 1 + pages.length) % pages.length;
    }

    function nextPage() {
        if (pages.length <= 1) return;
        currentPage = (currentPage + 1) % pages.length;
    }

    function openModalByIndex(index) {
        activeImageIndex = index;
    }

    function closeModal() {
        activeImageIndex = null;
    }

    // Навигация внутри модального окна
    function prevModalImage() {
        if (images.length <= 1) return;
        activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
    }

    function nextModalImage() {
        if (images.length <= 1) return;
        activeImageIndex = (activeImageIndex + 1) % images.length;
    }

    function handleKeydown(event) {
        if (activeImageIndex === null) return;

        if (event.key === 'Escape') {
            closeModal();
        } else if (event.key === 'ArrowLeft') {
            prevModalImage();
        } else if (event.key === 'ArrowRight') {
            nextModalImage();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section id="furniture" class="catalog-section">
    <div class="container">
        <h2
                class="title catalog-header-anim"
                use:reveal={{ offset: '-40px', delay: 40 }}
        >
            Каталог уже установленной мебели
        </h2>

        {#if pages.length > 0}
            {@const pageStartIndex = currentPage * PAGE_SIZE}
            <div
                    class="collage-wrapper catalog-grid-anim"
                    use:reveal={{ offset: '-50px', delay: 80 }}
            >
                {#if pages.length > 1}
                    <button class="nav-btn prev" on:click={prevPage} aria-label="Предыдущая страница">
                        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                            <path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                {/if}

                {#key currentPage}
                    <div class="collage-grid page-fade-anim">
                        <!-- Левая колонка -->
                        <div class="grid-col side-col">
                            {#if images[pageStartIndex]}
                                <button type="button" class="img-box" on:click={() => openModalByIndex(pageStartIndex)}>
                                    <img src={images[pageStartIndex]} alt="Мебель 1" loading="lazy" />
                                </button>
                            {/if}
                            {#if images[pageStartIndex + 1]}
                                <button type="button" class="img-box" on:click={() => openModalByIndex(pageStartIndex + 1)}>
                                    <img src={images[pageStartIndex + 1]} alt="Мебель 2" loading="lazy" />
                                </button>
                            {/if}
                        </div>

                        <!-- Центральная колонка -->
                        <div class="grid-col center-col">
                            {#if images[pageStartIndex + 2]}
                                <button type="button" class="img-box" on:click={() => openModalByIndex(pageStartIndex + 2)}>
                                    <img src={images[pageStartIndex + 2]} alt="Мебель 3" loading="lazy" />
                                </button>
                            {/if}
                        </div>

                        <!-- Правая колонка -->
                        <div class="grid-col side-col">
                            {#if images[pageStartIndex + 3]}
                                <button type="button" class="img-box" on:click={() => openModalByIndex(pageStartIndex + 3)}>
                                    <img src={images[pageStartIndex + 3]} alt="Мебель 4" loading="lazy" />
                                </button>
                            {/if}
                            {#if images[pageStartIndex + 4]}
                                <button type="button" class="img-box" on:click={() => openModalByIndex(pageStartIndex + 4)}>
                                    <img src={images[pageStartIndex + 4]} alt="Мебель 5" loading="lazy" />
                                </button>
                            {/if}
                        </div>
                    </div>
                {/key}

                {#if pages.length > 1}
                    <button class="nav-btn next" on:click={nextPage} aria-label="Следующая страница">
                        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                            <path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                {/if}
            </div>

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
            <p class="empty-msg">В каталоге пока нет фото.</p>
        {/if}
    </div>
</section>

<!-- Модальное окно со слайдером -->
{#if activeImageIndex !== null}
    <div
            class="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографии"
            tabindex="-1"
    >
        <button
                type="button"
                class="lightbox-backdrop"
                on:click={closeModal}
                aria-label="Закрыть модальное окно"
        ></button>

        <div class="lightbox-content">
            <button
                    type="button"
                    class="close-btn"
                    on:click={closeModal}
                    aria-label="Закрыть"
            >
                ✕
            </button>

            <!-- Кнопки листания внутри модалки -->
            {#if images.length > 1}
                <button
                        type="button"
                        class="modal-nav-btn prev"
                        on:click={prevModalImage}
                        aria-label="Предыдущее фото"
                >
                    <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
                        <path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            {/if}

            <img src={images[activeImageIndex]} alt="Увеличенное изображение мебели" />

            {#if images.length > 1}
                <button
                        type="button"
                        class="modal-nav-btn next"
                        on:click={nextModalImage}
                        aria-label="Следующее фото"
                >
                    <svg width="12" height="20" viewBox="0 0 10 16" fill="none">
                        <path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            {/if}

            <!-- Индикатор номера фотографии -->
            <div class="modal-counter">
                {activeImageIndex + 1} / {images.length}
            </div>
        </div>
    </div>
{/if}

<style>
    .catalog-section {
        padding: 48px 20px;
        background-color: #ffffff;
    }

    .container {
        max-width: 1040px;
        margin: 0 auto;
        position: relative;
    }

    .title {
        text-align: center;
        font-size: 30px;
        font-weight: 700;
        color: #222222;
        margin: 0 0 32px 0;
    }

    .collage-wrapper {
        position: relative;
        width: 100%;
        margin: 0 auto;
    }

    .collage-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        height: clamp(420px, 58vh, 520px);
        width: 100%;
    }

    /* Мягкая плавная смена страниц без дерганий */
    .page-fade-anim {
        animation: pageFade 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes pageFade {
        from { opacity: 0.3; transform: scale(0.995); }
        to { opacity: 1; transform: scale(1); }
    }

    .grid-col {
        min-width: 0;
        min-height: 0;
        height: 100%;
    }

    .side-col {
        display: grid;
        grid-template-rows: repeat(2, minmax(0, 1fr));
        gap: 14px;
        height: 100%;
    }

    .center-col {
        display: flex;
        height: 100%;
    }

    .img-box {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border: none;
        background-color: #f0f0f0;
        cursor: pointer;
        overflow: hidden;
    }

    .img-box img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
    }

    .img-box:hover img {
        transform: scale(1.03);
    }

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
        z-index: 5;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s, transform 0.1s;
    }

    .nav-btn:hover { background-color: #e0a300; }
    .nav-btn:active { transform: translateY(-50%) scale(0.92); }
    .nav-btn.prev { left: -22px; }
    .nav-btn.next { right: -22px; }

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

    .empty-msg {
        text-align: center;
        color: #888888;
    }

    /* ---------------- Анимации блока (Десктоп) ---------------- */
    :global(.catalog-header-anim.reveal-init) {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    :global(.catalog-header-anim.revealed) {
        opacity: 1;
        transform: translateY(0);
    }

    :global(.catalog-grid-anim.reveal-init) {
        opacity: 0;
        transform: translateY(24px) scale(0.98);
        transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
    }

    :global(.catalog-grid-anim.revealed) {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    /* Модальное окно */
    .lightbox {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 24px;
        outline: none;
        animation: modalFadeIn 0.2s ease-out;
    }

    .lightbox-backdrop {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.9);
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
    }

    .lightbox-content {
        position: relative;
        z-index: 1;
        max-width: 88vw;
        max-height: 88vh;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: modalZoomIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .lightbox-content img {
        max-width: 100%;
        max-height: 84vh;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
        user-select: none;
    }

    @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes modalZoomIn {
        from { opacity: 0; transform: scale(0.94); }
        to { opacity: 1; transform: scale(1); }
    }

    .close-btn {
        position: absolute;
        top: -44px;
        right: 0;
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 30px;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
    }

    /* Стрелки переключения внутри модалки */
    .modal-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #f5b300;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        transition: background-color 0.2s, transform 0.1s;
    }

    .modal-nav-btn:hover { background-color: #e0a300; }
    .modal-nav-btn:active { transform: translateY(-50%) scale(0.92); }
    .modal-nav-btn.prev { left: -64px; }
    .modal-nav-btn.next { right: -64px; }

    .modal-counter {
        position: absolute;
        bottom: -36px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.75);
        font-size: 14px;
        font-weight: 500;
    }

    /* ---------------- Адаптив под мобилку (<= 900px) ---------------- */
    @media (max-width: 900px) {
        .collage-grid {
            grid-template-columns: 1fr;
            height: auto;
            gap: 12px;
        }

        .side-col {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: none;
            height: 200px;
        }

        .center-col {
            height: 320px;
        }

        .modal-nav-btn.prev { left: 8px; }
        .modal-nav-btn.next { right: 8px; }

        /* Плавное, мягкое мобильное появление без рывка */
        :global(.catalog-header-anim.reveal-init) {
            transform: translateY(10px) !important;
            transition: opacity 0.45s ease-out,
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        :global(.catalog-grid-anim.reveal-init) {
            transform: translateY(12px) scale(0.99) !important;
            transition: opacity 0.48s ease-out,
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        :global(.catalog-grid-anim.revealed) {
            transform: translateY(0) scale(1) !important;
        }
    }
</style>