const maxImageSide = 1280;
const webpQuality = 0.8;

export function downloadDrawing(
	board: SVGSVGElement,
	strokes: readonly { color: string; path: string }[],
	penWidth: number
) {
	const width = board.clientWidth;
	const height = board.clientHeight;
	if (!width || !height) throw new Error('Drawing board has no size');

	const scale = Math.min(1, maxImageSide / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(width * scale));
	canvas.height = Math.max(1, Math.round(height * scale));

	const context = canvas.getContext('2d');
	if (!context) throw new Error('Canvas is unavailable');

	context.fillStyle = '#fff';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = penWidth * scale;
	context.lineCap = 'round';
	context.lineJoin = 'round';

	const viewBox = board.viewBox.baseVal;
	const transform = new DOMMatrix().scale(
		canvas.width / viewBox.width,
		canvas.height / viewBox.height
	);
	for (const stroke of strokes) {
		const path = new Path2D();
		path.addPath(new Path2D(stroke.path), transform);
		context.strokeStyle = stroke.color;
		context.stroke(path);
	}

	const image = canvas.toDataURL('image/webp', webpQuality);
	const extension = image.startsWith('data:image/webp;') ? 'webp' : 'png';
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const link = document.createElement('a');
	link.href = image;
	link.download = `おえかき-${timestamp}.${extension}`;
	link.click();
}
