<script lang="ts">
	import type { AdditionBackground } from './additionProblem';

	let { background }: { background: AdditionBackground } = $props();
	const decorations = {
		meadow: ['🌷', '🌼', '🌱', '🌻', '🌷'],
		candy: ['🍬', '🍭', '🍓', '🍪', '🍬'],
		ocean: ['🪸', '🐚', '⭐', '🐚', '🪸'],
		night: ['⭐', '☁️', '💫', '☁️', '⭐'],
		forest: ['🍄', '🌿', '🌰', '🌱', '🍄'],
		snow: ['⛄', '❄️', '🌲', '❄️', '⛄'],
		space: ['🚀', '⭐', '🪐', '⭐', '🛸'],
		castle: ['🌹', '🎀', '👑', '🌷', '🌹']
	} satisfies Record<AdditionBackground, readonly string[]>;
	const motes = {
		meadow: '🌼',
		candy: '🍬',
		ocean: '○',
		night: '✦',
		forest: '🍃',
		snow: '❄',
		space: '✦',
		castle: '🌸'
	} satisfies Record<AdditionBackground, string>;
	const SPARKLE_COUNT = 16;
	const sparkleIndexes = [...Array(SPARKLE_COUNT).keys()];
</script>

<div class="scenery {background}" aria-hidden="true">
	<svg class="landscape" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
		{#if background === 'meadow'}
			<circle cx="1030" cy="110" r="68" fill="#ffe16a" stroke="#fff3ac" stroke-width="22" />
			<g fill="none" stroke-width="22" opacity="0.75">
				<path d="M-100 490 A400 400 0 0 1 700 490" stroke="#ff8daf" />
				<path d="M-78 490 A378 378 0 0 1 678 490" stroke="#ffd75d" />
				<path d="M-56 490 A356 356 0 0 1 656 490" stroke="#a1e5b9" />
				<path d="M-34 490 A334 334 0 0 1 634 490" stroke="#9cbaf9" />
			</g>
			<path d="M0 580 Q180 370 440 590 T1200 500 V800 H0Z" fill="#9bd97b" />
			<path d="M0 660 Q300 510 650 670 T1200 590 V800 H0Z" fill="#6bc99a" />
			<path d="M0 750 Q280 630 560 760 T1200 700 V800 H0Z" fill="#46b58d" />
		{:else if background === 'candy'}
			<path d="M0 630 Q200 350 400 610 T800 590 T1200 520 V800 H0Z" fill="#d8b3f6" />
			<path d="M0 710 Q280 490 570 700 T1200 610 V800 H0Z" fill="#ffa3c5" />
			<g stroke="#fff5dd" stroke-width="15" stroke-linecap="round">
				<path d="M110 670 V360 M1080 650 V310" />
			</g>
			<g stroke="#fff" stroke-width="9">
				<circle cx="110" cy="330" r="80" fill="#ff8fb3" />
				<circle cx="1080" cy="280" r="95" fill="#b1a0f2" />
			</g>
			<g fill="none" stroke="#fff4ca" stroke-width="16" stroke-linecap="round">
				<path d="M110 330 C160 270 40 260 65 335 S180 370 155 305" />
				<path d="M1080 280 C1140 210 1000 195 1025 285 S1165 335 1130 245" />
			</g>
			<path d="M0 765 Q300 660 620 760 T1200 710 V800 H0Z" fill="#ffe6a3" />
		{:else if background === 'ocean'}
			<g fill="#e3ffff" opacity="0.25">
				<path d="M150 0 H240 L500 800 H190Z" />
				<path d="M740 0 H800 L1040 800 H620Z" />
			</g>
			<path d="M0 690 Q250 570 600 700 T1200 640 V800 H0Z" fill="#63cbbb" />
			<path d="M0 760 Q240 650 540 750 T1200 710 V800 H0Z" fill="#ffe2aa" />
			<g fill="none" stroke-linecap="round" stroke-width="24">
				<path d="M75 790 Q130 700 65 610 M115 800 Q170 700 155 665" stroke="#43b798" />
				<path d="M1110 795 V650 M1110 730 L1060 690 M1110 705 L1155 665" stroke="#ff92ab" />
			</g>
		{:else if background === 'night'}
			<circle cx="1040" cy="140" r="83" fill="#ffec9b" />
			<circle cx="1007" cy="108" r="72" fill="#514a9d" />
			<g fill="none" stroke="#c3a8ff" opacity="0.55" stroke-width="3">
				<path d="M65 160 L180 90 L270 180 L370 120 M870 330 L970 260 L1130 360" />
			</g>
			<g fill="#fff4be">
				<circle cx="65" cy="160" r="7" /><circle cx="180" cy="90" r="9" />
				<circle cx="270" cy="180" r="7" /><circle cx="370" cy="120" r="8" />
				<circle cx="870" cy="330" r="7" /><circle cx="970" cy="260" r="8" />
				<circle cx="1130" cy="360" r="7" />
			</g>
			<path d="M0 660 Q260 470 570 660 T1200 580 V800 H0Z" fill="#8272c4" />
			<path d="M0 750 Q300 590 650 740 T1200 680 V800 H0Z" fill="#a18cdb" />
		{:else if background === 'forest'}
			<circle cx="950" cy="120" r="70" fill="#fff0a5" />
			<path d="M0 590 Q250 430 600 600 T1200 520 V800 H0Z" fill="#87cda0" />
			<g stroke="#b18a65" stroke-width="30">
				<path d="M90 680 V230 M1110 660 V200 M250 580 V180" />
			</g>
			<g fill="#4eab83" stroke="#75c597" stroke-width="12">
				<circle cx="80" cy="220" r="135" /><circle cx="1120" cy="200" r="150" />
				<circle cx="250" cy="140" r="95" />
			</g>
			<path d="M0 720 Q300 550 650 720 T1200 650 V800 H0Z" fill="#62b38b" />
			<path d="M490 800 Q600 680 580 610 Q670 690 770 800" fill="#f1d6a3" />
		{:else if background === 'snow'}
			<path d="M0 590 L230 230 L500 600 L860 180 L1200 590 V800 H0Z" fill="#a5c9e6" />
			<path
				d="M135 375 L230 230 L340 380 L265 355 L230 390 L195 350Z M735 335 L860 180 L995 345 L905 310 L860 350 L810 300Z"
				fill="#fff"
			/>
			<path d="M0 660 Q290 540 650 660 T1200 600 V800 H0Z" fill="#e4f5ff" />
			<path d="M0 760 Q300 640 700 750 T1200 710 V800 H0Z" fill="#fff" />
			<g fill="#73bcae" stroke="#e4f5ff" stroke-width="10" stroke-linejoin="round">
				<path d="M30 650 L110 390 L190 650Z M1010 630 L1090 350 L1170 630Z" />
			</g>
		{:else if background === 'space'}
			<g transform="rotate(-25 1030 170)">
				<circle cx="1030" cy="170" r="85" fill="#ffcd8c" />
				<ellipse
					cx="1030"
					cy="170"
					rx="155"
					ry="35"
					fill="none"
					stroke="#f4a9d2"
					stroke-width="20"
				/>
			</g>
			<circle cx="130" cy="220" r="65" fill="#8ce0dc" />
			<circle cx="110" cy="200" r="17" fill="#68bfca" />
			<circle cx="150" cy="240" r="12" fill="#68bfca" />
			<path d="M0 760 Q550 510 1200 730 V800 H0Z" fill="#9d92d6" />
			<ellipse cx="220" cy="750" rx="90" ry="22" fill="#7f76bb" />
			<ellipse cx="1000" cy="740" rx="65" ry="17" fill="#7f76bb" />
		{:else if background === 'castle'}
			<path d="M0 640 Q280 440 620 650 T1200 560 V800 H0Z" fill="#b5dba4" />
			<g fill="#ffd8e8" stroke="#fff1f6" stroke-width="8" stroke-linejoin="round">
				<path d="M865 570 V285 H935 V380 H1035 V245 H1110 V570Z" />
			</g>
			<g fill="#bd93dc">
				<path d="M845 285 L900 200 L955 285Z M1015 245 L1072 160 L1130 245Z" />
				<path d="M970 570 V495 A30 30 0 0 1 1030 495 V570Z" />
			</g>
			<g fill="#f790b6">
				<path d="M900 200 V130 L955 150 L900 170Z M1072 160 V90 L1127 110 L1072 130Z" />
			</g>
			<path d="M0 730 Q300 600 650 740 T1200 660 V800 H0Z" fill="#8ac9a7" />
		{/if}
	</svg>

	{#if background === 'meadow' || background === 'candy' || background === 'castle'}
		<div class="cloud cloud-one"></div>
		<div class="cloud cloud-two"></div>
	{/if}
	{#if background === 'night' || background === 'space'}
		<div class="shooting-star"></div>
		<div class="shooting-star second-star"></div>
	{/if}
	<div class="stage-glow"></div>
	{#each sparkleIndexes as index (index)}
		<span
			class="mote"
			style:--x={`${(index * 31 + 3) % 100}%`}
			style:--y={`${(index * 23 + 9) % 94}%`}
			style:--delay={`${-index * 0.7}s`}
			style:--travel-duration={`${8 + (index % 5)}s`}>{motes[background]}</span
		>
	{/each}
	<div class="border-garden">
		{#each decorations[background] as symbol, index (index)}
			<span style:--sway-delay={`${-index * 0.6}s`}>{symbol}</span>
		{/each}
	</div>
</div>

<style lang="scss">
	$drift-duration: 9s;
	$garden-sway-duration: 3s;
	$shooting-star-duration: 6s;

	.scenery {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.landscape {
		width: 100%;
		height: 100%;
	}

	.stage-glow {
		position: absolute;
		inset: 20% 8% 15%;
		border-radius: 50%;
		background: radial-gradient(ellipse, #ffffff85, #ffffff30 45%, transparent 70%);
	}

	.cloud {
		position: absolute;
		top: 14%;
		left: 5%;
		width: clamp(7rem, 18vw, 17rem);
		height: clamp(2rem, 5vw, 4.5rem);
		border-radius: 5rem;
		background: #ffffffd9;
		box-shadow: 0 0.5rem 0 #ffffff30;
		animation: cloud-drift $drift-duration ease-in-out infinite alternate;

		&::before,
		&::after {
			position: absolute;
			bottom: 20%;
			left: 17%;
			width: 40%;
			aspect-ratio: 1;
			border-radius: 50%;
			background: inherit;
			content: '';
		}

		&::after {
			left: 45%;
			width: 30%;
		}
	}

	.cloud-two {
		top: 28%;
		left: 73%;
		scale: 0.7;
		animation-delay: -5s;
	}

	.mote {
		position: absolute;
		top: var(--y);
		left: var(--x);
		color: #fff9c4;
		font-size: clamp(0.8rem, 2vw, 1.7rem);
		text-shadow: 0 0 0.6rem #fff;
		animation: mote-float 4s ease-in-out var(--delay) infinite alternate;
	}

	.meadow .mote,
	.candy .mote,
	.forest .mote,
	.castle .mote {
		opacity: 0.65;
		animation: petal-drift var(--travel-duration) linear var(--delay) infinite;
	}

	.candy .mote {
		animation-name: candy-fall;
	}

	.ocean .mote {
		color: #e0ffff;
		font-size: clamp(1.5rem, 3vw, 3rem);
		animation: bubble-rise var(--travel-duration) linear var(--delay) infinite;
	}

	.snow .mote {
		color: #fff;
		animation: snow-fall $drift-duration linear var(--delay) infinite;
	}

	.shooting-star {
		position: absolute;
		top: 10%;
		left: 75%;
		width: clamp(4rem, 12vw, 9rem);
		height: 3px;
		border-radius: 50%;
		background: linear-gradient(90deg, transparent, #fff6c9);
		box-shadow: 0 0 0.5rem #fff6c9;
		opacity: 0;
		animation: shooting-star $shooting-star-duration linear infinite;
	}

	.second-star {
		top: 25%;
		left: 40%;
		animation-delay: -3s;
	}

	@keyframes shooting-star {
		0% {
			opacity: 0;
			transform: translate(0, 0) rotate(145deg);
		}
		5% {
			opacity: 0.9;
		}
		25%,
		100% {
			opacity: 0;
			transform: translate(-45vw, 30vh) rotate(145deg);
		}
	}

	@keyframes petal-drift {
		0% {
			transform: translate(-3rem, -100vh) rotate(-30deg);
		}
		50% {
			transform: translate(2rem, 0) rotate(40deg);
		}
		100% {
			transform: translate(-1rem, 100vh) rotate(130deg);
		}
	}

	@keyframes candy-fall {
		from {
			transform: translate(-2rem, -100vh) rotate(0deg);
		}
		to {
			transform: translate(4rem, 100vh) rotate(360deg);
		}
	}

	@keyframes bubble-rise {
		0% {
			opacity: 0;
			transform: translate(0, 100vh) scale(0.6);
		}
		20%,
		80% {
			opacity: 0.7;
		}
		100% {
			opacity: 0;
			transform: translate(3rem, -100vh) scale(1.2);
		}
	}

	@keyframes snow-fall {
		from {
			transform: translate(0, -100vh) rotate(0deg);
		}
		to {
			transform: translate(2rem, 100vh) rotate(180deg);
		}
	}

	.border-garden {
		position: absolute;
		right: 0;
		bottom: -0.7rem;
		left: 0;
		display: flex;
		align-items: end;
		justify-content: space-between;
		padding: 0 2%;
		font-size: clamp(2.2rem, 5vw, 4.8rem);

		span {
			transform-origin: bottom center;
			animation: garden-sway $garden-sway-duration ease-in-out var(--sway-delay) infinite alternate;
		}

		span:nth-child(even) {
			font-size: 0.7em;
			transform: rotate(-15deg);
		}
	}

	@keyframes garden-sway {
		from {
			rotate: -8deg;
		}
		to {
			rotate: 8deg;
		}
	}

	@keyframes cloud-drift {
		to {
			transform: translateX(6rem);
		}
	}

	@keyframes mote-float {
		from {
			opacity: 0.35;
			transform: translateY(0) scale(0.7);
		}
		to {
			opacity: 0.9;
			transform: translateY(-1.5rem) scale(1.1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cloud,
		.scenery .mote,
		.shooting-star,
		.border-garden span {
			animation: none;
		}
	}
</style>
