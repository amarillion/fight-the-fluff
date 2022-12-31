import { SCREENH, SCREENW } from '../constants.js';
import { Point } from '../util/point.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T;

const GRAVITY = 50.0;

export function IsometricMixin<TBase extends Constructor<Phaser.GameObjects.Sprite>>(Base: TBase) {
	return class IsometricSprite extends Base {
		xx = 0;
		yy = 0;
		zz = 0;
		prevX = 0; prevY = 0; // used to check if x,y have been adjusted outside of preUpdate
		
		gravity = false;
		private velocityX = 0;
		private velocityY = 0;
		private velocityZ = 0;
	
		lifeRemain = -1;

		set velocity(p: Point) {
			this.velocityX = p.x;
			this.velocityY = p.y;
		}

		preUpdate(time: number, delta: number) {
			super.preUpdate(time, delta);
			if (this.prevX !== this.x) {
				this.xx = this.x;
			}
			if (this.prevY !== this.y) {
				this.yy = this.y;
			}
			this.xx += this.velocityX / delta;
			this.yy += this.velocityY / delta;
			this.zz += this.velocityZ / delta;
			
			if (this.gravity) {
				this.velocityZ -= (GRAVITY / delta);
			}

			// copy coordinates to sprite.
			this.x = this.xx;
			this.y = this.yy - this.zz;
			this.depth = this.yy;

			// destroy if out of bounds
			if (this.x < 0 || this.y < 0 || this.x > SCREENW || this.y > SCREENH) {
				this.destroy();
			}
			this.prevX = this.x;
			this.prevY = this.y;

			if (this.lifeRemain > 0) {
				this.lifeRemain -= delta;
				if (this.lifeRemain < 0) {
					this.destroy();
				}
			}
		}
	};
}

/*
 Simplified replacement for arcade physics, that can also do isometric / z coordinates
*/
export class IsoPhysics {

	static overlapSingle(aa: Phaser.GameObjects.Sprite, bb: Phaser.GameObjects.Sprite) {
		return (aa.z === bb.z && !(aa.x > bb.x + bb.width ||
			aa.y > bb.y + bb.height ||
			bb.x > aa.x + aa.width ||
			bb.y > aa.y + aa.height));
	}

	static overlap(a: Phaser.GameObjects.Group, b: Phaser.GameObjects.Group, 
		onOverlap: (aa: Phaser.GameObjects.GameObject, bb: Phaser.GameObjects.GameObject) => void
	) {
		for (const aa of a.getChildren() as Phaser.GameObjects.Sprite[]) {
			for (const bb of b.getChildren() as Phaser.GameObjects.Sprite[]) {
				if (IsoPhysics.overlapSingle(aa, bb)) {
					onOverlap(aa, bb);
				}
			}
		}
	}
}

export class IsoSprite extends IsometricMixin(Phaser.GameObjects.Sprite) {
}
