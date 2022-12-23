export type Point = {
	x: number;
	y: number;
};

export function centerOfMass(points : Point[]) : Point {
	return {
		x : points.reduce((prev, cur) => prev + cur.x, 0) / points.length,
		y : points.reduce((prev, cur) => prev + cur.y, 0) / points.length
	};
}

export const TWO_PI = Math.PI * 2;


export const toDegrees = (n: number) => Math.round(n * 180 / Math.PI);
export const toRadians = (n: number) => n * Math.PI / 180;

export function clamp(value : number, min : number, max : number) {
	const range = max - min;
	let result = value;
	while (result < min) {
		result += range;
	}
	while (result > max) {
		result -= range;
	}
	return result;
}

export function clampRotation(rotation: number) {
	return clamp(rotation, -Math.PI, Math.PI);
}

/* Phaser annoyance!
	Phaser uses the
	following expression to wrap rotation:

	(min + (((value - min) % range)) + range) % range;
	
	which is only correct for values between ~~ -4 pi to +4 pi.
*/
/** 
 * like Phaser wrap function. Subtly different from clamp, so beware... 
 * Implemented here for unit testing.
 **/
export function phaserWrapRotation(value: number) {
	const min = -Math.PI;
	const max = Math.PI;
	const range = max - min;
	return (min + ((((value - min) % range) + range) % range));
}

export function length(point : Point) {
	return Math.sqrt(point.x * point.x * point.y * point.y);
}

export function minus(a : Point, b : Point) {
	return { x : a.x - b.x, y : a.y - b.y };
}

export function plus(a : Point, b : Point) {
	return { x : a.x + b.x, y : a.y + b.y };
}
