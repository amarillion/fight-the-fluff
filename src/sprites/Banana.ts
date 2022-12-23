import { Stream } from '@amarillion/helixgraph/lib/iterableUtils.js';
import { pickOne } from '@amarillion/helixgraph/lib/random.js';
import { ActionType, MapSprite } from './MapSprite.js';
import { Node } from '../grid.js';

const STEPS = 40;

export class Banana extends MapSprite {
	
	constructor ({ scene, node }) {
		super({ scene, node, asset: 'banana-spritesheet' });
		this.play('banana');
		this.solution = scene.solution && scene.solution.slice(1);
	}

	onNodeReached() {
		if (this.node === this.scene.endNode) {
			this.scene.endReached();
			this.destroy();
		}
	}

	determineNextNode() {
		const exits = Stream.of(Node.getExits(this.node)).map(v => v[1]).filter(n => n !== this.prevNode).collect();
		
		if(exits.length === 0) {
			this.destroy();
			return;
		}

		let result;

		if (this.solution && exits.indexOf(this.solution[0]) >= 0) {
			result = this.solution.shift();
		}
		else {
			result = pickOne(exits);
		}
		return result;
	}

	determineNextAction() : ActionType {
		return {
			type: 'MOVE',
			time: STEPS
		};
	}

}
