import { getRotationUnits, rotateMaskLeft, rotateMaskRight, TILES } from '../src/tiles';
import { RotatingTileMixin } from '../src/sprites/RotatingTileMixin';
import { TESSELATIONS } from '../src/tesselate';
import { phaserWrapRotation, toDegrees, toRadians } from '../src/util/geometry';

test('mask rotation left', () => {

	expect (rotateMaskLeft(1, 0, 4)).toEqual(1);
	expect (rotateMaskLeft(1, 1, 4)).toEqual(2);
	expect (rotateMaskLeft(1, 2, 4)).toEqual(4);
	expect (rotateMaskLeft(1, 3, 4)).toEqual(8);
	expect (rotateMaskLeft(1, 4, 4)).toEqual(1);

	expect (rotateMaskLeft(1, 0, 3)).toEqual(1);
	expect (rotateMaskLeft(1, 1, 3)).toEqual(2);
	expect (rotateMaskLeft(1, 2, 3)).toEqual(4);
	expect (rotateMaskLeft(1, 3, 3)).toEqual(1);
	expect (rotateMaskLeft(1, 4, 3)).toEqual(2);

	expect (rotateMaskLeft(3, 0, 4)).toEqual(3);
	expect (rotateMaskLeft(3, 1, 4)).toEqual(6);
	expect (rotateMaskLeft(3, 2, 4)).toEqual(12);
	expect (rotateMaskLeft(3, 3, 4)).toEqual(9);
	expect (rotateMaskLeft(3, 4, 4)).toEqual(3);

});

test('mask rotation right', () => {

	expect (rotateMaskRight(1, 0, 4)).toEqual(1);
	expect (rotateMaskRight(1, 1, 4)).toEqual(8);
	expect (rotateMaskRight(1, 2, 4)).toEqual(4);
	expect (rotateMaskRight(1, 3, 4)).toEqual(2);
	expect (rotateMaskRight(1, 4, 4)).toEqual(1);

	expect (rotateMaskRight(1, 0, 3)).toEqual(1);
	expect (rotateMaskRight(1, 1, 3)).toEqual(4);
	expect (rotateMaskRight(1, 2, 3)).toEqual(2);
	expect (rotateMaskRight(1, 3, 3)).toEqual(1);
	expect (rotateMaskRight(1, 4, 3)).toEqual(4);

	expect (rotateMaskRight(3, 0, 4)).toEqual(3);
	expect (rotateMaskRight(3, 1, 4)).toEqual(9);
	expect (rotateMaskRight(3, 2, 4)).toEqual(12);
	expect (rotateMaskRight(3, 3, 4)).toEqual(6);
	expect (rotateMaskRight(3, 4, 4)).toEqual(3);

});

test('rounding angles to units', () => {

	expect (getRotationUnits(-2 * Math.PI, 4)).toBe(0);
	expect (getRotationUnits(-0.5 * Math.PI, 4)).toBe(3);
	expect (getRotationUnits(-0.2 * Math.PI, 4)).toBe(0);
	expect (getRotationUnits(0.2 * Math.PI, 4)).toBe(0);
	expect (getRotationUnits(0.4 * Math.PI, 4)).toBe(1);
	expect (getRotationUnits(0.6 * Math.PI, 4)).toBe(1);
	expect (getRotationUnits(0.8 * Math.PI, 4)).toBe(2);
	expect (getRotationUnits(1.0 * Math.PI, 4)).toBe(2);
	expect (getRotationUnits(1.2 * Math.PI, 4)).toBe(2);
	expect (getRotationUnits(1.4 * Math.PI, 4)).toBe(3);
	expect (getRotationUnits(1.6 * Math.PI, 4)).toBe(3);
	expect (getRotationUnits(1.8 * Math.PI, 4)).toBe(0);
	expect (getRotationUnits(2.0 * Math.PI, 4)).toBe(0);
	expect (getRotationUnits(2.2 * Math.PI, 4)).toBe(0);

});

class MockSprite {

	constructor() {
		this._rotation = 0;
		this.texture = null;
	}

	set rotation(value) {
		this._rotation = phaserWrapRotation(value);
	}

	get rotation() {
		return this._rotation;
	}

	setTexture(resKey) {
		this.texture = resKey;
	}
}

class MockDraggableTile extends RotatingTileMixin(MockSprite) {

	constructor(tile, tesselation) {
		super();
		this.initTile(tile, tesselation);
	}
}

// function setupSprite(tesselation, spriteRotation, elementRotation) {
// 	const tiles = TILES[tesselation.name];
// 	const sprite = new MockDraggableTile(tiles[3], tesselation);		
// 	sprite.rotation = spriteRotation;
// 	const { targetRotation, tile } = sprite.matchRotation(elementRotation);
// 	return { sprite, targetRotation, tile };
// }

class ResultTester {
	constructor({ sprite, targetRotation, tile }) {
		this.sprite = sprite;
		this.targetRotation = targetRotation;
		this.tile = tile;
	}

	mask(mask) {
		expect(this.tile.connectionMask).toBe(mask);
		return this;
	}

	get rotating() {
		return this;
	}

	from(rotation) {
		expect(toDegrees(this.sprite.rotation)).toBeCloseTo(rotation);
		return this;
	}

	to(targetRotation) {
		expect(toDegrees(this.targetRotation)).toBeCloseTo(targetRotation);
		return this;
	}

}

class RotationBuilder {
	
	constructor(tesselation) {
		this.tesselation = tesselation;
		this.rotation = 0;
		this.targetRotation = 0;
		this.connectionMask = 0;
	}

	get rotating() {
		return this;
	}

	get with() {
		return this;
	}

	mask(value) {
		this.connectionMask = value;
		return this;
	}

	from(rotation) {
		this.rotation = toRadians(rotation);
		return this;
	}

	to(targetRotation) {
		this.targetRotation = toRadians(targetRotation);
		return this;
	}

	get shouldEqual() {
		const tiles = TILES[this.tesselation.name];
		const sprite = new MockDraggableTile(tiles[this.connectionMask], this.tesselation);		
		sprite.rotation = this.rotation;
		const { targetRotation, tile } = sprite.matchRotation(this.targetRotation);
		return new ResultTester({ sprite, targetRotation, tile });
	}
}

function a(tesselation) {
	return new RotationBuilder(tesselation);
}

test('draggable tile mixin squares', () => {
	
	const { SQUARE } = TESSELATIONS;

	a(SQUARE)  .with.mask(0b0011).rotating.from(-180).to(0)
		.shouldEqual.mask(0b1100).rotating.from(0).to(0);

	a(SQUARE).with.mask(0b0011).rotating.from(-90).to(0)
		.shouldEqual.mask(0b1001).rotating.from(0).to(0);

	a(SQUARE).with.mask(0b0011).rotating.from(0).to(0)
		.shouldEqual.mask(0b0011).rotating.from(0).to(0);

	a(SQUARE).with.mask(0b0011).rotating.from(90).to(0)
		.shouldEqual.mask(0b0110).rotating.from(0).to(0);

	a(SQUARE)  .with.mask(0b0011).rotating.from(180).to(0)
		.shouldEqual.mask(0b1100).rotating.from(0).to(0);

});


test('draggable tile mixin triangular', () => {
	
	const { TRIANGULAR } = TESSELATIONS;

	a(TRIANGULAR).with.mask(0b011).rotating.from(-180).to(0)
		.shouldEqual.mask(0b110).rotating.from(60).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(-120).to(0)
		.shouldEqual.mask(0b101).rotating.from(0).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(-60).to(0)
		.shouldEqual.mask(0b011).rotating.from(-60).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(0).to(0)
		.shouldEqual.mask(0b011).rotating.from(0).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(60).to(0)
		.shouldEqual.mask(0b011).rotating.from(60).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(120).to(0)
		.shouldEqual.mask(0b110).rotating.from(0).to(0);

	a(TRIANGULAR).with.mask(0b011).rotating.from(180).to(0)
		.shouldEqual.mask(0b110).rotating.from(60).to(0);


	///////////////////////////////////////////////////////

	//TODO
	a(TRIANGULAR).with.mask(0b011).rotating.from(-180).to(180)
		.shouldEqual.mask(0b011).rotating.from(-180).to(-180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(-120).to(180)
		.shouldEqual.mask(0b011).rotating.from(-120).to(-180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(-60).to(180)
		.shouldEqual.mask(0b110).rotating.from(-180).to(-180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(0).to(180)
		.shouldEqual.mask(0b110).rotating.from(-120).to(-180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(60).to(180)
		.shouldEqual.mask(0b101).rotating.from(180).to(180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(120).to(180)
		.shouldEqual.mask(0b011).rotating.from(120).to(180);

	a(TRIANGULAR).with.mask(0b011).rotating.from(180).to(180)
		.shouldEqual.mask(0b011).rotating.from(-180).to(-180);

});

test('draggable tile mixin hexagon', () => {
	
	const { HEXAGONAL } = TESSELATIONS;

	a(HEXAGONAL).with.mask(0b000011).rotating.from(-180).to(0)
		.shouldEqual.mask(0b011000).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(-120).to(0)
		.shouldEqual.mask(0b110000).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(-60).to(0)
		.shouldEqual.mask(0b100001).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(0).to(0)
		.shouldEqual.mask(0b000011).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(60).to(0)
		.shouldEqual.mask(0b000110).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(120).to(0)
		.shouldEqual.mask(0b001100).rotating.from(0).to(0);

	a(HEXAGONAL).with.mask(0b000011).rotating.from(180).to(0)
		.shouldEqual.mask(0b011000).rotating.from(0).to(0);

});


test('draggable tile mixin cairo', () => {
	
	const { CAIRO } = TESSELATIONS;

	a(CAIRO).with.mask(0b00011).rotating.from(0).to(0)
		.shouldEqual.mask(0b00011).rotating.from(0).to(0);

	a(CAIRO).with.mask(0b00011).rotating.from(90).to(0)
		.shouldEqual.mask(0b00011).rotating.from(90).to(0);

	a(CAIRO).with.mask(0b00011).rotating.from(90).to(90)
		.shouldEqual.mask(0b00011).rotating.from(90).to(90);

});


test('draggable tile mixin diamond', () => {
	
	const { DIAMOND } = TESSELATIONS;

	a(DIAMOND) .with.mask(0b0011).rotating.from(0).to(0)
		.shouldEqual.mask(0b0011).rotating.from(0).to(0);

	a(DIAMOND) .with.mask(0b0011).rotating.from(0).to(120)
		.shouldEqual.mask(0b1100).rotating.from(-180).to(-240);

});

