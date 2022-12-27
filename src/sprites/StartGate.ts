import { Node } from '../grid.js';

export class StartGate extends Phaser.GameObjects.Sprite {

	constructor(scene: Phaser.Scene, node: Node) {
		super(scene, node.cx, node.cy, 'startgate');
	}

	update() {
		
	}
}
