import { Node } from '../grid.js';
import { Point } from '../util/point.js';
import { Game } from '../scenes/Game.js';
import { IsoSprite } from './IsoPhysics.js';
import { BulletType, TowerConfigType } from '../levels.js';
import { IntervalTimer } from '../util/IntervalTimer.js';
import { pickRandom } from '../util/random.js';
import { Banana } from './Banana.js';
import { toDegrees } from '../util/geometry.js';

const BULLET_SPEED = 50.0; // TODO: bullet-dependent

const CROSSHAIR_LEAD_PERIOD = 500;
const CROSSHAIR_SHOOT_PERIOD = 500;
const TOWER_MAX_HP = 20;

export class CrossHair extends Phaser.GameObjects.Sprite {

	private readonly target: Banana;
	private readonly parent: Tower;
	private counter = 0;
	private shot = false;

	constructor(scene: Game, x: number, y: number, target: Banana, parent: Tower) {
		super(scene, x, y, 'crosshair-spritesheet');
		this.play('crosshair');
		this.target = target;
		this.parent = parent;
	}

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);
		this.counter += delta;
		if (this.counter < CROSSHAIR_LEAD_PERIOD) {
			this.x = this.target.x;
			this.y = this.target.y;
			if (this.target.active === false) {
				this.destroy();
			}
		}
		else if (!this.shot) {
			const angleDegrees = toDegrees(Math.atan2(this.y - this.parent.y, this.x - this.parent.x));
			this.parent.shoot(angleDegrees);
			this.shot = true;
		}
		else if (this.counter > CROSSHAIR_SHOOT_PERIOD + CROSSHAIR_LEAD_PERIOD) {
			this.destroy();
		}
	}
}

export class Tower extends Phaser.GameObjects.Sprite {

	private readonly game: Game;
	private intervals: IntervalTimer[] = [];
	private config: TowerConfigType;
	private crosshair: Phaser.GameObjects.Sprite;
	hp = TOWER_MAX_HP;

	constructor(game: Game, node: Node, config: TowerConfigType) {
		super(game, node.cx, node.cy, 'endgate');
		this.game = game;
		this.config = config;
		for (const bullet of this.config.bullets) {
			const interval = new IntervalTimer(this.config.period, () => this.doProjectile(bullet), bullet.phase);
			this.intervals.push(interval);
		}
	}

	shoot(angleDegrees: number) {
		let start = { x: this.x, y: this.y };
		start = Point.add(start, Point.radial(20, angleDegrees));
		const sprite = new IsoSprite(this.game, start.x, start.y, 'projectile');
		sprite.lifeRemain = this.config.range;
		sprite.velocity = Point.radial(BULLET_SPEED, angleDegrees);
		this.game.bullets.add(sprite);
		this.game.spriteLayer.add(sprite);
		this.game.playEffect('sfx-cannon-shoot');
	}

	preUpdate(time: number, delta: number) {
		this.intervals.forEach(i => i.preUpdate(time, delta));
	}

	onHit() {
		this.hp--;
		if (this.hp === 0) {
			this.game.playEffect('sfx-tower-destroyed');
			this.destroy();
		}
		this.game.endReached();
	}

	doProjectile(bullet: BulletType) {
		if (bullet.type === 'fixed') {
			const angleDegrees = bullet.dir;
			this.shoot(angleDegrees);
		}
		else {
			// pick a random banana
			const inRange = this.game.bananas.getChildren().filter(
				b => {
					const bb = b as Phaser.GameObjects.Sprite; 
					const dist = Point.distance({ x: this.x, y: this.y }, { x: bb.x, y: bb.y });
					return (dist < 300 && dist > 50);
				}
			);
			const banana = pickRandom(inRange) as Banana;
			if (!banana) return;
			this.game.playEffect('sfx-cannon-target');
			this.crosshair = new CrossHair(this.game, banana.x, banana.y, banana, this);
			this.game.uiLayer.add(this.crosshair);
		}
	}
}
