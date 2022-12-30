import { Stream } from '@amarillion/helixgraph/lib/iterableUtils.js';
import { pickOne } from '@amarillion/helixgraph/lib/random.js';
import { ActionType, MapSprite } from './MapSprite.js';
import { Node } from '../grid.js';
import { Game } from '../scenes/Game.js';

const STEPS = 40;

export class Banana extends MapSprite {
	
	nextNode: Node = null;

	constructor ({ scene, node } : { scene: Game, node: Node }) {
		super({ scene, node, asset: 'banana-spritesheet' });
		this.play('banana');
		// this.solution = scene.solution && scene.solution.slice(1);
	}

	onNodeReached() {
		if (this.node === this.scene.endNode) {
			this.scene.endReached();
			this.destroy();
		}
	}

	determineNextNode() {
		const exits = Stream.of(
			Node.getExits(this.node)).map(v => v[1])
			// don't go back.
			// don't pick the same nextNode twice in a row.
			.filter(n => n !== this.prevNode && n !== this.nextNode)
			.collect();
		
		if(exits.length === 0) {
			// we somehow ended in a dead end. This shouldn't be possible.
			this.destroy();
			return;
		}

		// filter for paths that do not fall off a cliff
		const exitsToTile = exits.filter(n => n.tile && !n.destroyed);
		if (exitsToTile.length > 0) {
			this.nextNode = pickOne(exitsToTile);
			return this.nextNode;
		}

		// no choice but to fall off a cliff.
		this.nextNode = pickOne(exits);
		return this.nextNode;
	}

	determineNextAction() : ActionType {
		return {
			type: 'MOVE',
			time: STEPS
		};
	}

}
