import { describe, expect, it } from 'vitest';
import { createTapBurst, createTapParticles, getTapOrigin } from './tapEffects';

describe('getTapOrigin', () => {
	it('returns the tap position as percentages within the target bounds', () => {
		expect(getTapOrigin(110, 70, { left: 10, top: 20, width: 200, height: 100 })).toEqual({
			xPercent: 50,
			yPercent: 50
		});
	});

	it('clamps taps that land outside the target bounds', () => {
		expect(getTapOrigin(-20, 200, { left: 10, top: 20, width: 200, height: 100 })).toEqual({
			xPercent: 0,
			yPercent: 100
		});
	});
});

describe('createTapParticles', () => {
	it('creates a balanced burst from the same tap origin', () => {
		const particles = createTapParticles({ xPercent: 35, yPercent: 60 }, 2);

		expect(particles).toHaveLength(22);
		expect(
			particles.every((particle) => particle.xPercent === 35 && particle.yPercent === 60)
		).toBe(true);
		expect(new Set(particles.map((particle) => particle.id))).toHaveLength(particles.length);
		expect(particles.filter((particle) => particle.shape === 'star')).toHaveLength(11);
		expect(particles.filter((particle) => particle.shape === 'circle')).toHaveLength(11);
		expect(Math.min(...particles.map((particle) => particle.distancePx))).toBeGreaterThanOrEqual(
			200
		);
		expect(
			Math.min(
				...particles
					.filter((particle) => particle.shape === 'star')
					.map((particle) => particle.sizePx)
			)
		).toBeGreaterThanOrEqual(200);
		expect(
			particles
				.filter((particle) => particle.shape === 'star')
				.every((particle) => ['#fff8b8', '#ffd21f', '#ffb02e', '#fff158'].includes(particle.color))
		).toBe(true);
		expect(
			Math.max(
				...particles
					.filter((particle) => particle.shape === 'circle')
					.map((particle) => particle.sizePx)
			)
		).toBeLessThan(40);
	});

	it('uses fewer and shorter particles when reduced motion is requested', () => {
		const particles = createTapParticles({ xPercent: 35, yPercent: 60 }, 2, {
			reducedMotion: true
		});

		expect(particles).toHaveLength(8);
		expect(Math.max(...particles.map((particle) => particle.distancePx))).toBeLessThan(40);
		expect(particles.every((particle) => particle.delayMs === 0)).toBe(true);
	});
});

describe('createTapBurst', () => {
	it('keeps a large tap marker anchored to the tap origin', () => {
		expect(createTapBurst({ xPercent: 35, yPercent: 60 }, 4)).toEqual({
			id: '4',
			xPercent: 35,
			yPercent: 60,
			durationMs: 720
		});
	});
});
