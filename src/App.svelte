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
</script>

<div class="layout">
	<Header />

	<main class="content">
		<section id="hero">
			<Hero />
		</section>
		<section id="benefits">
			<Benefits  />
		</section>
		<section id="works">
			<Works  />
		</section>
		<section id="promotions">
			<PromoDrawer  />
		</section>
		<section id="about">
			<About />
		</section>
		<section id="catalog">
			<CatalogSlider />
		</section>
		<section id="order">
			<StepsForm />
		</section>
		<section id="reviews">
			<Reviews />
		</section>
		<section id="contact">
			<Footer />
		</section>
	</main>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.content {
		flex: 1;
		padding-top: 100px;
	}
</style>