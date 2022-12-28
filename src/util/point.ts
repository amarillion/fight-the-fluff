export const deg2rad = (x: number) => x * Math.PI / 180;
export const rad2deg = (x: number) => x * 180 /  Math.PI;

export class Point {

	x = 0;
	y = 0;

	static distSq(p1: Point, p2: Point) {
		const delta = Point.sub(p1, p2);
		return delta.x * delta.x + delta.y * delta.y;
	}

	static len(p: Point) {
		return Math.sqrt(p.x * p.x + p.y * p.y);
	}

	static distance(p1: Point, p2: Point) {
		const delta = Point.sub(p1, p2);
		return Point.len(delta);
	}

	static sub(p1: Point, p2: Point): Point {
		return { x: p1.x - p2.x, y: p1.y - p2.y };
	}

	static add(p1: Point, p2: Point): Point {
		return { x: p1.x + p2.x, y: p1.y + p2.y };
	}

	static radial(len: number, angle: number) {
		return { 
			x: Math.cos(deg2rad(angle)) * len, 
			y: Math.sin(deg2rad(angle)) * len
		};
	}
}

export class Rect {
	x = 0;
	y = 0;
	w = 0;
	h = 0;

	static inside(r: Rect, p: Point) {
		return p.x >= r.x && p.y >= r.y && 
			p.x < r.x + r.w && p.y < r.y + r.h;
	}

}

