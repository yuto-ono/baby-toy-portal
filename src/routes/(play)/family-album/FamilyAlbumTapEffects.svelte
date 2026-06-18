<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createFamilyAlbumTapBurst,
		createFamilyAlbumTapParticles,
		getFamilyAlbumTapOrigin,
		type FamilyAlbumTapBurst,
		type FamilyAlbumTapParticle
	} from './familyAlbumViewerEffects';

	const TAP_EFFECT_LIFETIME_MS = 1000;
	const MAX_ACTIVE_BURSTS = 3;
	const MAX_ACTIVE_PARTICLES = 66;

	let { target }: { target?: HTMLElement } = $props();

	let bursts = $state<FamilyAlbumTapBurst[]>([]);
	let particles = $state<FamilyAlbumTapParticle[]>([]);
	let burstId = 0;
	let prefersReducedMotion = $state(false);
	const particleTimeoutIds: ReturnType<typeof setTimeout>[] = [];

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		function updateMotionPreference() {
			prefersReducedMotion = motionQuery.matches;
		}

		updateMotionPreference();
		motionQuery.addEventListener('change', updateMotionPreference);

		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);

			for (const timeoutId of particleTimeoutIds) {
				clearTimeout(timeoutId);
			}
		};
	});

	$effect(() => {
		if (!target) return;

		const currentTarget = target;

		function handlePointerDown(event: PointerEvent): void {
			if (event.pointerType === 'mouse' && event.button !== 0) return;

			const origin = getFamilyAlbumTapOrigin(
				event.clientX,
				event.clientY,
				currentTarget.getBoundingClientRect()
			);
			const nextBurst = createFamilyAlbumTapBurst(origin, burstId, {
				reducedMotion: prefersReducedMotion
			});
			const nextParticles = createFamilyAlbumTapParticles(origin, burstId, {
				reducedMotion: prefersReducedMotion
			});
			const particleIds = new Set(nextParticles.map((particle) => particle.id));
			const currentBurstId = nextBurst.id;

			burstId += 1;
			bursts = [...bursts, nextBurst].slice(-MAX_ACTIVE_BURSTS);
			particles = [...particles, ...nextParticles].slice(-MAX_ACTIVE_PARTICLES);

			const timeoutId = setTimeout(() => {
				bursts = bursts.filter((burst) => burst.id !== currentBurstId);
				particles = particles.filter((particle) => !particleIds.has(particle.id));
				const timeoutIndex = particleTimeoutIds.indexOf(timeoutId);

				if (timeoutIndex >= 0) {
					particleTimeoutIds.splice(timeoutIndex, 1);
				}
			}, TAP_EFFECT_LIFETIME_MS);

			particleTimeoutIds.push(timeoutId);
		}

		currentTarget.addEventListener('pointerdown', handlePointerDown);

		return () => {
			currentTarget.removeEventListener('pointerdown', handlePointerDown);
		};
	});

	function getParticleStyle(particle: FamilyAlbumTapParticle): string {
		return [
			`--particle-x: ${particle.xPercent}%`,
			`--particle-y: ${particle.yPercent}%`,
			`--particle-angle: ${particle.angleDeg}deg`,
			`--particle-spin: ${particle.spinDeg}deg`,
			`--particle-distance: ${particle.distancePx}px`,
			`--particle-size: ${particle.sizePx}px`,
			`--particle-color: ${particle.color}`,
			`--particle-delay: ${particle.delayMs}ms`,
			`--particle-duration: ${particle.durationMs}ms`
		].join('; ');
	}

	function getBurstStyle(burst: FamilyAlbumTapBurst): string {
		return [
			`--burst-x: ${burst.xPercent}%`,
			`--burst-y: ${burst.yPercent}%`,
			`--burst-duration: ${burst.durationMs}ms`
		].join('; ');
	}
</script>

<div class="tap-effects" aria-hidden="true">
	{#each bursts as burst (burst.id)}
		<span class="burst" style={getBurstStyle(burst)}></span>
	{/each}

	{#each particles as particle (particle.id)}
		<span
			class="particle"
			class:star={particle.shape === 'star'}
			class:circle={particle.shape === 'circle'}
			style={getParticleStyle(particle)}
		></span>
	{/each}
</div>

<style lang="scss">
	$ink: #333145;

	.tap-effects {
		position: absolute;
		z-index: 2;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.burst {
		position: absolute;
		top: var(--burst-y);
		left: var(--burst-x);
		width: clamp(5.5rem, 15vw, 8.5rem);
		aspect-ratio: 1;
		border-radius: 999px;
		background:
			radial-gradient(circle, rgba(#fff8b8, 0.62) 0 36%, transparent 37%),
			radial-gradient(circle, transparent 0 56%, rgba(#ffd21f, 0.9) 57% 68%, transparent 69%),
			radial-gradient(circle, transparent 0 72%, rgba(#fff, 0.88) 73% 81%, transparent 82%);
		box-shadow:
			0 0 0 clamp(0.5rem, 1.3vw, 0.8rem) rgba(#ffb02e, 0.38),
			0 0.45rem 0 rgba($ink, 0.16);
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.3);
		animation: tap-burst var(--burst-duration) cubic-bezier(0.16, 0.9, 0.34, 1) forwards;
		will-change: transform, opacity;
	}

	.particle {
		position: absolute;
		top: var(--particle-y);
		left: var(--particle-x);
		width: var(--particle-size);
		height: var(--particle-size);
		border: 3px solid #fff;
		border-radius: 999px;
		background: var(--particle-color);
		box-shadow:
			0 0 0 2px rgba($ink, 0.28),
			0 0.22rem 0 rgba($ink, 0.2);
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.5);
		animation: tap-particle var(--particle-duration) cubic-bezier(0.16, 0.9, 0.34, 1) forwards;
		animation-delay: var(--particle-delay);
		will-change: transform, opacity;
	}

	.star {
		border: 0;
		border-radius: 0;
		background: var(--particle-color);
		clip-path: polygon(
			50% 0%,
			62% 34%,
			98% 35%,
			69% 56%,
			79% 91%,
			50% 70%,
			21% 91%,
			31% 56%,
			2% 35%,
			38% 34%
		);
		filter: drop-shadow(0 0 0.45rem #fff) drop-shadow(0 0.35rem 0 rgba($ink, 0.2));
	}

	.circle {
		border-radius: 999px;
	}

	@keyframes tap-burst {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.3);
		}

		18% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.18);
		}
	}

	@keyframes tap-particle {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.35);
		}

		18% {
			opacity: 0.95;
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(var(--particle-angle))
				translateY(calc(var(--particle-distance) * -1)) rotate(var(--particle-spin)) scale(0.2);
		}
	}

	@keyframes tap-particle-reduced {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.6);
		}

		35% {
			opacity: 0.7;
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(var(--particle-angle))
				translateY(calc(var(--particle-distance) * -1)) rotate(var(--particle-spin)) scale(0.45);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.burst {
			width: clamp(4.5rem, 11vw, 6.25rem);
			animation-name: tap-burst-reduced;
		}

		.particle {
			box-shadow: none;
			animation-name: tap-particle-reduced;
		}
	}

	@keyframes tap-burst-reduced {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.78);
		}

		35% {
			opacity: 0.85;
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.94);
		}
	}
</style>
