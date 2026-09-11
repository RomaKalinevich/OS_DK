<script>
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import Hero from './components/Hero.svelte';
	import Benefits from './components/Benefits.svelte';
	import Works from './components/Works.svelte';
	import PromoDrawer from './components/PromoDrawer.svelte';
	import About from './components/About.svelte';
	import CatalogSlider from './components/CatalogSlider.svelte';
	import StepsForm from './components/StepsForm.svelte';
	import Reviews from "./components/Reviews.svelte";

	import { reveal } from './actions/reveal.js';
</script>

<div class="layout">
	<Header />

	<main class="content">
		<section id="hero">
			<Hero />
		</section>

		<section id="benefits" class="anim-blur-up" use:reveal>
			<Benefits />
		</section>

		<section id="works" class="anim-curtain">
			<Works />
		</section>

		<section id="promotions" class="anim-zoom-in" use:reveal>
			<PromoDrawer />
		</section>

		<section id="about" class="anim-blur-up" use:reveal>
			<About />
		</section>

		<section id="catalog" class="anim-zoom-in" use:reveal>
			<CatalogSlider />
		</section>

		<section id="order" class="anim-elevate" use:reveal>
			<StepsForm />
		</section>

		<section id="reviews" class="anim-lift" use:reveal>
			<Reviews />
		</section>

		<section id="contact" class="anim-fade">
			<Footer />
		</section>
	</main>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		overflow-x: clip;
		position: relative;
	}

	.content {
		flex: 1;
		padding-top: 100px;
	}

	/* Отступ при переходе по якорным ссылкам, чтобы заголовок не наезжал на шапку */
	section[id] {
		scroll-margin-top: 110px;
	}

	/* -------------------------------------------------------------
       1. Матовый расфокус (anim-blur-up)
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-blur-up) {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(18px);
		transition: opacity 0.75s cubic-bezier(0.2, 0.8, 0.2, 1),
		filter 0.75s cubic-bezier(0.2, 0.8, 0.2, 1),
		transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: opacity, filter, transform;
	}
	:global(.reveal-init.anim-blur-up.revealed) {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0);
	}

	/* -------------------------------------------------------------
       2. Раскрытие шторкой (anim-curtain)
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-curtain) {
		opacity: 0;
		clip-path: inset(5% 0 0 0);
		transform: translateY(14px);
		transition: opacity 0.8s ease,
		clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: opacity, clip-path, transform;
	}
	:global(.reveal-init.anim-curtain.revealed) {
		opacity: 1;
		clip-path: inset(0 0 0 0);
		transform: translateY(0);
	}

	/* -------------------------------------------------------------
       3. Элегантное масштабирование (anim-zoom-in)
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-zoom-in) {
		opacity: 0;
		transform: scale(0.97) translateY(12px);
		transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: opacity, transform;
	}
	:global(.reveal-init.anim-zoom-in.revealed) {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	/* -------------------------------------------------------------
       4. Объемный вход (anim-elevate)
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-elevate) {
		opacity: 0;
		transform: translateY(22px);
		transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1),
		transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: opacity, transform;
	}
	:global(.reveal-init.anim-elevate.revealed) {
		opacity: 1;
		transform: translateY(0);
	}

	/* -------------------------------------------------------------
       5. Мягкий подъем (anim-lift)
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-lift) {
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
		transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: opacity, transform;
	}
	:global(.reveal-init.anim-lift.revealed) {
		opacity: 1;
		transform: translateY(0);
	}

	/* -------------------------------------------------------------
       6. Деликатный Fade-In для подвала
    ------------------------------------------------------------- */
	:global(.reveal-init.anim-fade) {
		opacity: 0;
		transition: opacity 0.8s ease;
		will-change: opacity;
	}
	:global(.reveal-init.anim-fade.revealed) {
		opacity: 1;
	}

	/* =============================================================
       Адаптация для мобильных устройств (экраны <= 992px)
    ============================================================= */
	@media (max-width: 992px) {
		/* Ускоряем все анимации для быстрого мобильного свайпа */
		:global(.reveal-init) {
			transition-duration: 0.38s !important;
		}

		.content {
			padding-top: 0;
		}

		section[id] {
			scroll-margin-top: 60px;
		}

		:global(.reveal-init.anim-blur-up) {
			filter: none; /* на смартфонах лучше вовсе отключить blur для стабильных 60/120 fps */
			transform: translateY(10px);
		}

		:global(.reveal-init.anim-curtain) {
			transform: translateY(8px);
		}

		:global(.reveal-init.anim-zoom-in) {
			transform: scale(0.98) translateY(8px);
		}

		:global(.reveal-init.anim-elevate) {
			transform: translateY(12px);
		}

		:global(.reveal-init.anim-lift) {
			transform: translateY(10px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.reveal-init) {
			transition: none !important;
			transform: none !important;
			filter: none !important;
			opacity: 1 !important;
		}
	}
</style>