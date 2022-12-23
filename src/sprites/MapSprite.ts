import Phaser from 'phaser';
import { Node } from '../grid.js';
import { Stream } from '@amarillion/helixgraph/lib/iterableUtils.js';
import { Game } from '../scenes/Game.js';
import { Point } from '../util/geometry.js';

const STEPS = 40;

export type ActionType = {
	type: 'MOVE' | 'SIT' | 'SHAKE';
	time: number;
	onComplete?: () => void
}

class Path {
	src: Node;
	dest: Node;
	fraction: number;
	
	constructor(src, dest) {
		this.src = src;
		this.dest = dest;
		this.fraction = 0;
	}

	getPos() : Point {
		const deltax = this.dest.cx - this.src.cx;
		const deltay = this.dest.cy - this.src.cy;

		return {
			x: this.src.cx + this.fraction * deltax,
			y: this.src.cy + this.fraction * deltay
		};
	}

	reverse() {
		this.fraction = 1 - this.fraction;
		[ this.src, this.dest ] = [ this.dest, this.src ];
	}

	hasDestTile() {
		return !!this.dest.tile;
	}

	hasDestExit() {
		if (!this.hasDestTile()) return false;
		const reversePath = Stream.of(Node.getExits(this.dest)).map(v => v[1]).find(n => n === this.src);
		return !!reversePath;
	}
}

export class MapSprite extends Phaser.GameObjects.Sprite {
	
	node: Node;
	stepsRemain: number;
	prevNode: Node;
	halfwayCheckpoint: boolean;
	solution: Node[];
	action: ActionType;
	scene: Game;
	actionCounter: number;
	path: Path;

	constructor ({ scene, node, asset }) {
		super(scene, node.cx, node.cy, asset);
		
		this.node = node;
		this.stepsRemain = 0;
		this.path = null;
		this.prevNode = null;
		this.halfwayCheckpoint = false;
		this.actionCounter = 0;
	}

	determineNextNode() : Node {
		return null;
	}

	onHalfWay() {
		if (!this.path.hasDestTile()) {
			this.destroy();
		}

		if (!this.path.hasDestExit()) {
			// we can't go further. Go back along the same path.
			this.path.reverse();
		}
	}

	onNodeReached() {
		// pass
	}

	followPath() {
		if (!this.path) {
			this.stepsRemain = this.action.time;
			
			const nextNode = this.determineNextNode();
			if (!nextNode) {
				this.action = {
					type: 'SIT',
					time: STEPS
				};
				return;
			}

			this.path = new Path(this.node, nextNode);
			this.halfwayCheckpoint = false;
		}

		this.path.fraction = 1 - (this.stepsRemain / this.action.time);
		
		const pos = this.path.getPos();
		
		this.x = pos.x; this.y = pos.y;
		
		if (!this.halfwayCheckpoint && this.path.fraction > 0.5) {
			this.onHalfWay();
			this.halfwayCheckpoint = true;
		}
	}

	completeAction() {
		if (this.action.type === 'MOVE') {
			this.prevNode = this.node;
			this.node = this.path.dest;
			this.path = null;
			this.onNodeReached();
		}
		if ('onComplete' in this.action) {
			this.action.onComplete();
		}
	}

	determineNextAction() : ActionType {
		return {
			type : 'SIT',
			time : STEPS,
		};
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (!this.action) {
			this.action = this.determineNextAction();
			this.actionCounter++;
			// console.log('New action', this, this.action);
			this.stepsRemain = this.action.time;
		}

		if (this.action.type === 'MOVE') {
			this.followPath();
		}

		if (this.action.type === 'SHAKE') {
			this.x = this.node.cx + 4 * Math.sin(this.stepsRemain * 13);
			this.y = this.node.cy + 4 * Math.cos(this.stepsRemain * 17);
		}

		this.stepsRemain--;
		if (this.stepsRemain <= 0) {
			this.completeAction();
			this.action = null;
		}

	}
}
