import { TESSELATIONS } from './tesselate.js';
import { Point } from './util/point.js';

export class Tile {
	resKey: string;
	connectionMask: number;

	/* position that equals 0,0 position of a unit in the grid */
	origin: Point;

	/* center of mass */
	center: Point;

	constructor(connectionMask: number) {
		this.connectionMask = connectionMask;
		this.resKey = null;
		this.origin = null;
		this.center = null;
	}
}

function _initTiles() {
	const result: Record<string, Tile[]> = {};
	for (const tesselation of Object.values(TESSELATIONS)) {
		result[tesselation.name] = [];
		for (let i = 0; i < Math.pow(2, tesselation.sides); ++i) {
			result[tesselation.name][i] = new Tile(i);
		}
	}
	return result;
}

export const TILES : Record<string, Tile[]> = _initTiles();

export function rotateMaskLeft(input: number, shift: number, maskWidth : number) {
	
	const overflow = 1 << maskWidth;
	// assert(input >= 0 && input < overflow);

	let result = input;
	for (let i = 0; i < shift; ++i) {
		// implement a roll
		result <<= 1;
		if ((result & overflow) > 0) {
			result -= (overflow - 1);
		}
	}

	return result;
}

export function rotateMaskRight(input: number, shift: number, maskWidth : number) {
	const overflow = 1 << maskWidth;
	// assert(input >= 0 && input < overflow);

	let result = input;
	for (let i = 0; i < shift; ++i) {
		// implement a roll
		if ((result & 1) > 0) {
			result += (overflow - 1);
		}
		result >>= 1;
	}

	return result;
}

export function getRotationUnits(rotation: number, sides: number) {
	let normalized = rotation;
	const PI_2 = Math.PI * 2;
	const unit = PI_2 / sides;
	while(normalized < 0) { normalized += PI_2; }
	const result = Math.round(normalized / unit) % sides;
	return result;
}
