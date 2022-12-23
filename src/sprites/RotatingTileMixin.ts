import { TesselationType } from '../tesselate.js';
import { Tile, TILES, rotateMaskLeft, rotateMaskRight } from '../tiles.js';
import { toDegrees, TWO_PI, phaserWrapRotation } from '../util/geometry.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T;

interface Rotatable {
	rotation: number;
	setTexture(resKey : string): void;
}

export function RotatingTileMixin<TBase extends Constructor<Rotatable>>(Base: TBase) {
	return class RotatingTile extends Base {

		#tile: Tile;
		#tesselation: TesselationType;
		#tileSet: Tile[];

		/*
		Expect this to be called by constructor of super class.
		
		Extending the constructor itself is possible but tricky
		https://github.com/Microsoft/TypeScript/issues/14126
		*/
		initTile(tile: Tile, tesselation: TesselationType) {
			this.#tile = tile;
			this.#tileSet = TILES[tesselation.name];
			this.#tesselation = tesselation;
		}

		/**
		 * Rotate, while at the same time substituting the contents of the tile,
		 * so that the rotation appears invisible.
		 * @param sign negative: left rotation. Positive: right rotation
		 */
		rotateContents(sign : -1 | 1) {
			const symmetryAngle = TWO_PI / this.#tesselation.symmetry;
			let connectionMask = this.#tile.connectionMask;
			const sides = this.#tesselation.sides;
			const symmetryUnit = Math.round(sides / this.#tesselation.symmetry);
			
			let currentRotation = this.rotation;
			// const before = currentRotation;
			
			if (sign === -1) {
				connectionMask = rotateMaskLeft(connectionMask, symmetryUnit, sides);
				currentRotation -= symmetryAngle;
			}
			else {
				connectionMask = rotateMaskRight(connectionMask, symmetryUnit, sides);
				currentRotation += symmetryAngle;
			}
			
			// replace tile and texture
			this.rotation = currentRotation;
			this.#tile = this.#tileSet[connectionMask];
			this.setTexture(this.#tile.resKey);
		}


		matchRotation(elementRotation : number) {
			// round rotation to nearest unit angle...
			const symmetryAngle = TWO_PI / this.#tesselation.symmetry;
			let targetRotation = elementRotation;
			
			const deltaRotation = () => phaserWrapRotation(targetRotation - this.rotation); 
			
			// converting to angle to round off, and avoid float equality problems
			// where the angle should be 0 but in reality it's 1e-16.
			let it = 0;
			while (toDegrees(deltaRotation()) > toDegrees(symmetryAngle / 2)) {
				this.rotateContents(+1);
				if(it++ > 6) throw new Error('Infinite loop detected');
			}

			it = 0;
			while (toDegrees(deltaRotation()) < toDegrees(-symmetryAngle / 2)) {
				this.rotateContents(-1);
				//TODO: this can get in an infinite loop if elementRotation is +180 and targetRotation = -180
				if(it++ > 6) throw new Error('Infinite loop detected');
			}

			// limit rotation to smallest part of circle
			// we can't adjust this.rotation, because it's automatically wrapped
			// so we have to change the targetRotation instead.
			if (targetRotation - this.rotation > Math.PI) {
				targetRotation -= TWO_PI; 
			}

			if (targetRotation - this.rotation < -Math.PI) {
				targetRotation += TWO_PI; 
			}
			
			return { targetRotation, tile: this.#tile };
		}

	};
}
