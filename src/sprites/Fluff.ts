import { Stream } from '@amarillion/helixgraph/lib/iterableUtils.js';
import { pickOne } from '@amarillion/helixgraph/lib/random.js';
import { ActionType, MapSprite } from './MapSprite.js';
import { Node } from '../grid.js';
import { Point } from '../util/point.js';
import { Game } from '../scenes/Game.js';

const STEPS = 40;

export class Fluff extends MapSprite {
	
	constructor ({ scene, node } : { scene: Game, node: Node }) {
		super({ scene, node, asset: 'fluff-spritesheet' });
		this.play('fluff');
		this.scene.playEffect('sfx-fluff-appear');
	}

	determineNextNode() {
		const exits = Stream.of(Node.getExits(this.node)).map(v => v[1]).filter(n => n !== this.prevNode).collect();
		
		return pickOne(exits);
	}

	determineNextAction() : ActionType {
		// die of old age...
		if (this.actionCounter > 50) {
			return {
				type: 'SIT',
				time: STEPS,
				onComplete: () => {
					this.destroy();
				}
			};
		}
		
		const explodeChance = Math.min(0.5, this.actionCounter / 20);
		if (Math.random() < explodeChance) {
			if (!this.node.isStartNode && !this.node.isEndNode) {
				return {
					type: 'SHAKE',
					time: STEPS * 3,
					onComplete: () => {
						this.scene.destroyTile(this.node);
						this.destroy();
					}
				};
			}
		}

		if (this.actionCounter % 2 === 1) {
			return {
				type: 'MOVE',
				time: STEPS * 2
			};
		}
		else {
			return {
				type: 'SIT',
				time: STEPS
			};

		}
	}

	onHalfWay() {
		if (!this.path.hasDestTile()) {
			this.path.reverse();
			return;
		}

		if (!this.path.hasDestExit()) {
			// we can't go further. 
			// Two options: return or destroy...
			if (this.node.isStartNode ||
				this.node.isEndNode ||
				Math.random() > 0.5) {
				this.path.reverse();
			}
			else {
				// TODO: causes sudden jump in coordinate
				this.stepsRemain = STEPS * 3;
				this.action = {
					type: 'SHAKE',
					time: STEPS * 3,
					onComplete: () => {
						this.scene.destroyTile(this.node);
						this.destroy();
					}
				};
			}
		}
	}

	dragStart() {
		this.action = {
			type: 'SIT',
			time: Infinity
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

	dragRelease(pointer: Point) {
		const destNode = this.scene.findNodeAt(pointer.x, pointer.y);
		if (!(destNode && destNode.tile)) {
			this.dragCancel();
		}
		else {
			// drop bunny on tile
			this.node = destNode;
			this.path = null;
			this.action = null;
			this.x = destNode.cx;
			this.y = destNode.cy;
		}
	}

	dragCancel() {
		this.scene.playEffect('sfx-fluff-throw');
		this.destroy();
	}

}
