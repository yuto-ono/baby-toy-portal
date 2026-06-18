const TAP_CIRCLE_COLORS = ['#ff4f7b', '#1fc7a8', '#3d9cff', '#cf63ff'];
const TAP_STAR_COLORS = ['#fff8b8', '#ffd21f', '#ffb02e', '#fff158'];
const TAP_PARTICLE_COUNT = 22;
const REDUCED_MOTION_PARTICLE_COUNT = 8;
const TAP_PARTICLE_BASE_DISTANCE_PX = 216;
const REDUCED_MOTION_PARTICLE_BASE_DISTANCE_PX = 24;

export type TapOrigin = {
	xPercent: number;
	yPercent: number;
};

export type TapParticle = {
	id: string;
	shape: 'circle' | 'star';
	xPercent: number;
	yPercent: number;
	angleDeg: number;
	spinDeg: number;
	distancePx: number;
	sizePx: number;
	color: string;
	delayMs: number;
	durationMs: number;
};

export type TapBurst = TapOrigin & {
	id: string;
	durationMs: number;
};

type TapBounds = Pick<DOMRectReadOnly, 'left' | 'top' | 'width' | 'height'>;

type TapParticleOptions = {
	reducedMotion?: boolean;
};

export function createTapBurst(
	origin: TapOrigin,
	burstId: number,
	{ reducedMotion = false }: TapParticleOptions = {}
): TapBurst {
	return {
		id: `${burstId}`,
		xPercent: origin.xPercent,
		yPercent: origin.yPercent,
		durationMs: reducedMotion ? 360 : 720
	};
}

export function getTapOrigin(clientX: number, clientY: number, bounds: TapBounds): TapOrigin {
	const width = Math.max(1, bounds.width);
	const height = Math.max(1, bounds.height);
	const x = clamp(clientX - bounds.left, 0, width);
	const y = clamp(clientY - bounds.top, 0, height);

	return {
		xPercent: (x / width) * 100,
		yPercent: (y / height) * 100
	};
}

export function createTapParticles(
	origin: TapOrigin,
	burstId: number,
	{ reducedMotion = false }: TapParticleOptions = {}
): TapParticle[] {
	const particleCount = reducedMotion ? REDUCED_MOTION_PARTICLE_COUNT : TAP_PARTICLE_COUNT;
	const baseDistance = reducedMotion
		? REDUCED_MOTION_PARTICLE_BASE_DISTANCE_PX
		: TAP_PARTICLE_BASE_DISTANCE_PX;
	const angleOffset = (burstId % 3) * 8;

	return Array.from({ length: particleCount }, (_, index) => {
		const shape = index % 2 === 0 ? 'star' : 'circle';
		const distanceStep = reducedMotion ? (index % 2) * 5 : (index % 4) * 42;
		const sizePx =
			shape === 'star'
				? reducedMotion
					? 130 + (index % 2) * 20
					: 220 + (index % 3) * 40
				: reducedMotion
					? 16 + (index % 2) * 3
					: 22 + (index % 3) * 5;
		const color =
			shape === 'star'
				? TAP_STAR_COLORS[index % TAP_STAR_COLORS.length]
				: TAP_CIRCLE_COLORS[index % TAP_CIRCLE_COLORS.length];

		return {
			id: `${burstId}-${index}`,
			shape,
			xPercent: origin.xPercent,
			yPercent: origin.yPercent,
			angleDeg: (360 / particleCount) * index + angleOffset,
			spinDeg: index % 2 === 0 ? 18 + (index % 3) * 16 : 0,
			distancePx: baseDistance + distanceStep,
			sizePx,
			color,
			delayMs: reducedMotion ? 0 : (index % 4) * 14,
			durationMs: reducedMotion ? 360 : 760 + (index % 3) * 80
		};
	});
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}
