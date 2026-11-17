<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Check from '@lucide/svelte/icons/check';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { downloadDrawing } from './downloadDrawing';

	const colors = [
		{ name: 'くろ', value: '#333145' },
		{ name: 'あか', value: '#ed4457' },
		{ name: 'オレンジ', value: '#ff8b38' },
		{ name: 'きいろ', value: '#f4cf3d' },
		{ name: 'みどり', value: '#40a565' },
		{ name: 'あお', value: '#397ee5' },
		{ name: 'むらさき', value: '#8955d4' },
		{ name: 'ピンク', value: '#ed79b2' }
	];

	type Stroke = { color: string; path: string };

	const penWidth = 8;
	// A short segment with round caps makes a tap leave a dot.
	const tapSegment = 0.001;
	let color = $state(colors[0].value);
	let strokes = $state.raw<Stroke[]>([]);
	let currentStroke = $state<Stroke>();
	let activePointer = $state<number>();
	let paper = $state<SVGSVGElement>();
	let saveError = $state(false);

	function drawingPoint(event: PointerEvent, board: SVGSVGElement) {
		const bounds = board.getBoundingClientRect();
		return {
			x: ((event.clientX - bounds.left) / bounds.width) * board.viewBox.baseVal.width,
			y: ((event.clientY - bounds.top) / bounds.height) * board.viewBox.baseVal.height
		};
	}

	function startStroke(event: PointerEvent) {
		if (activePointer !== undefined || event.button !== 0) return;

		const board = event.currentTarget as SVGSVGElement;
		const { x, y } = drawingPoint(event, board);
		board.setPointerCapture(event.pointerId);
		activePointer = event.pointerId;
		currentStroke = { color, path: `M ${x} ${y} h ${tapSegment} M ${x} ${y}` };
	}

	function extendStroke(event: PointerEvent) {
		if (event.pointerId !== activePointer || !currentStroke) return;

		const { x, y } = drawingPoint(event, event.currentTarget as SVGSVGElement);
		currentStroke.path += ` L ${x} ${y}`;
	}

	function finishStroke(event: PointerEvent) {
		if (event.pointerId !== activePointer || !currentStroke) return;

		if (event.type === 'pointerup') extendStroke(event);
		strokes = [...strokes, { color: currentStroke.color, path: currentStroke.path }];
		currentStroke = undefined;
		activePointer = undefined;
	}
</script>

<div class="drawing-board">
	<div class="controls">
		<div class="palette" role="group" aria-label="ペンのいろ">
			{#each colors as swatch (swatch.value)}
				<button
					type="button"
					class="swatch"
					style:--swatch={swatch.value}
					aria-label={swatch.name}
					aria-pressed={color === swatch.value}
					onclick={() => (color = swatch.value)}
				>
					{#if color === swatch.value}
						<span><Check size={18} strokeWidth={3} aria-hidden="true" /></span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="actions">
			<button
				type="button"
				disabled={!strokes.length || currentStroke !== undefined}
				onclick={() => (strokes = strokes.slice(0, -1))}
			>
				<Undo2 size={20} aria-hidden="true" />
				ひとつ もどす
			</button>
			<button
				type="button"
				disabled={!strokes.length || currentStroke !== undefined}
				onclick={() => {
					if (window.confirm('おえかきを ぜんぶ けす？')) strokes = [];
				}}
			>
				<Trash2 size={20} aria-hidden="true" />
				ぜんぶ けす
			</button>
			<button
				type="button"
				disabled={!strokes.length || currentStroke !== undefined}
				onclick={() => {
					if (!paper) return;

					saveError = false;
					try {
						downloadDrawing(paper, strokes, penWidth);
					} catch {
						saveError = true;
					}
				}}
			>
				<Download size={20} aria-hidden="true" />
				ほぞん
			</button>
			{#if saveError}
				<span role="alert">ほぞんできませんでした。もういちど ためしてね。</span>
			{/if}
		</div>
	</div>

	<svg
		bind:this={paper}
		class="paper"
		role="img"
		aria-label="ゆびやマウスで えを かくところ"
		viewBox="0 0 1000 700"
		preserveAspectRatio="none"
		onpointerdown={startStroke}
		onpointermove={extendStroke}
		onpointerup={finishStroke}
		onpointercancel={finishStroke}
		onlostpointercapture={finishStroke}
	>
		<g fill="none" stroke-width={penWidth} stroke-linecap="round" stroke-linejoin="round">
			{#each strokes as stroke (stroke)}
				<path d={stroke.path} stroke={stroke.color} vector-effect="non-scaling-stroke" />
			{/each}
			{#if currentStroke}
				<path
					d={currentStroke.path}
					stroke={currentStroke.color}
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		</g>
	</svg>
</div>

<style lang="scss">
	$ink: #333145;

	.drawing-board {
		display: grid;
		width: min(100%, 75rem);
		min-width: 0;
		grid-template-rows: auto 1fr;
		margin-inline: auto;
		padding: 0.75rem clamp(0.75rem, 3vw, 2rem) max(1rem, env(safe-area-inset-bottom));
		gap: 0.75rem;
	}

	.controls,
	.palette,
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.controls {
		gap: 0.75rem 1.5rem;
	}

	button {
		display: inline-flex;
		min-width: 3rem;
		min-height: 3rem;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 0.75rem;
		border: 2px solid $ink;
		border-radius: 999px;
		background: #fff;
		color: $ink;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
		gap: 0.35rem;

		&:focus-visible {
			outline: 3px solid #397ee5;
			outline-offset: 2px;
		}

		&:disabled {
			opacity: 0.45;
			cursor: default;
		}
	}

	.swatch {
		background: var(--swatch);

		&[aria-pressed='true'] {
			box-shadow: inset 0 0 0 2px #fff;
		}

		span {
			display: grid;
			width: 1.35rem;
			height: 1.35rem;
			place-items: center;
			border-radius: 50%;
			background: #fff;
		}
	}

	.paper {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 16rem;
		border: 2px solid $ink;
		border-radius: 1rem;
		background: #fff;
		cursor: crosshair;
		touch-action: none;
		box-shadow: 0 4px 0 #f1d38b;
	}
</style>
