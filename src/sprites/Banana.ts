import { Stream } from '@amarillion/helixgraph/lib/iterableUtils.js';
import { pickOne } from '@amarillion/helixgraph/lib/random.js';
import { ActionType, MapSprite } from './MapSprite.js';
import { Node } from '../grid.js';
import { Game } from '../scenes/Game.js';
import { IsoPhysics } from './IsoPhysics.js';
import { Tower } from './Tower.js';

const STEPS = 40;

export class Banana extends MapSprite {
	
	prevPickedNodes = new Set<Node>(); 

	constructor ({ scene, node } : { scene: Game, node: Node }) {
		super({ scene, node, asset: 'banana-spritesheet' });
		this.play('banana');
		this.scene.playEffect('sfx-banana-spawn');
		// this.solution = scene.solution && scene.solution.slice(1);
	}

	onNodeReached() {
		this.prevPickedNodes.add(this.node);
		for (const tower of this.scene.towers.children.getArray()) {
			if (IsoPhysics.overlapSingle(this, tower as Phaser.GameObjects.Sprite)) {
				(tower as Tower).onHit();
				this.scene.playEffect('sfx-banana-tower');
				this.destroy();
			}
		}
	}

	determineNextNode() {
		const result = this.determineNextNodeHelper();
		if (result) this.prevPickedNodes.add(result);
		return result;
	}

	determineNextNodeHelper() {
		const exits = Stream.of(
			Node.getExits(this.node)).map(v => v[1])
			// don't go back.
			.filter(n => n !== this.prevNode)
			.collect();
		
		if(exits.length === 0) {
			// we somehow ended in a dead end. This shouldn't be possible.
			this.destroy();
			return;
		}

		// filter for paths that do not fall off a cliff
		const exitsToTile = exits.filter(n => n.tile && !n.scorched);
		if (exitsToTile.length > 0) {

			// filter for paths that do not revisit old nodes
			const newTiles = exitsToTile.filter(n => !this.prevPickedNodes.has(n));
			if (newTiles.length > 0) {
				return pickOne(newTiles);
			}

			return pickOne(exitsToTile);
		}

		// no choice but to fall off a cliff / revisit previous node.
		return pickOne(exits);
	}

	determineNextAction() : ActionType {
		return {
			type: 'MOVE',
			time: STEPS
		};
	}

}
