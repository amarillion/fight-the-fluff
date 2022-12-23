import Phaser from 'phaser';
import { Tile } from '../tiles.js';
import { Game } from '../scenes/Game.js';
import { Point } from '../util/geometry.js';
import { Node } from '../grid.js';
import { RotatingTileMixin } from './RotatingTileMixin.js';

const TWO_PI = Math.PI * 2;

export interface Draggable {
	dragRelease: ( pointer: Point ) => void,
	dragStart: ( pointer: Point ) => void,
	/** Moving the mouse. If mouse moved outside of screen, x and y are negative.  */
	dragMove: ( pointer: Point ) => void,
	dragCancel: ( pointer: Point ) => void,
}

export default class extends RotatingTileMixin(Phaser.GameObjects.Sprite) {
	
	scene: Game;
	grabPoint: Point;
	target: Point;

	debugGraphics: Phaser.GameObjects.Graphics;

	constructor ({ scene, x, y, tile } : { scene: Game, x: number, y : number, tile: Tile }) {
		super(scene, x, y, tile.resKey);
		this.grabPoint = null;
		this.initTile(tile, scene.tesselation);
		this.rotationBlocked = false;
	}

	preUpdate(/*time, delta*/) {
		// keep moving towards target?
		// keep track of speed?
	}

	dragStart(pointer) {
		this.grabPoint = {
			x : pointer.x - this.x,
			y : pointer.y - this.y
		};
	}

	dragMove(pointer : Point) {
		if (pointer.x < 0) {
			this.visible = false;
		}
		else {
			this.visible = true;
			this.x = pointer.x;
			this.y = pointer.y;
		}
	}

	rotateLeft() {
		if (this.rotationBlocked) return;
		const rotationSteps = this.scene.tesselation.rotationSteps;
		const targetRotation = this.rotation - (TWO_PI / rotationSteps);
		this.scene.tweens.add({
			targets:[this],
			duration: 100,
			rotation: targetRotation,
			onComplete: () => this.rotationBlocked = false
		});
	}

	rotationBlocked: boolean;

	rotateRight() {
		if (this.rotationBlocked) return;
		const rotationSteps = this.scene.tesselation.rotationSteps;
		const targetRotation = this.rotation + (TWO_PI / rotationSteps);
		this.scene.tweens.add({
			targets:[this],
			duration: 100,
			rotation: targetRotation,
			onComplete: () => this.rotationBlocked = false
		});
	}

	dragCancel() {
		this.visible = true; // in case we're out of screen
		const scene = this.scene;
		scene.tweens.add({
			targets: [ this ],
			duration: 200,
			x: scene.control.x,
			y: scene.control.y,
		});
	}

	dropTile(node : Node) {
		const scene = this.scene;
		const { tile, targetRotation } = this.matchRotation(node.element.rotation);
		scene.tweens.add({
			targets: [ this ],
			duration: 300,
			x: node.cx,
			y: node.cy,
			rotation: targetRotation,
			onComplete: () => {
				scene.setTile(node, tile);
				this.destroy();
			}
		});

	}

	dragRelease(/* pointer */) {
		const scene = this.scene;
		
		if (scene.controlContains({ x: this.x, y: this.y })) {
			// we've moved our shape back to the corner
			this.dragCancel();
			return;
		}
		
		const node = scene.findNodeAt(this.x, this.y);
		const dragSuccess = (node && !node.tile);
		if (dragSuccess) {
			this.dropTile(node);
			scene.updateNextTile();
		}
		else {
			this.dragCancel();
		}
	}
}
