import { Node } from '../grid.js';
import { Point } from '../util/point.js';
import { Game } from '../scenes/Game.js';
import { IsoSprite } from './IsoPhysics.js';
import { TowerConfigType } from '../levels.js';
import { IntervalTimer } from '../util/IntervalTimer.js';
import { pickRandom } from '../util/random.js';
import { Banana } from './Banana.js';
import { toDegrees } from '../util/geometry.js';

const PROJECTILE_INTERVAL_MSEC = 900; ///TODO: level-dependent / tower dependent.
const BULLET_SPEED = 50.0; // TODO: bullet-dependent

const CROSSHAIR_LEAD_PERIOD = 1000;
const CROSSHAIR_SHOOT_PERIOD = 1000;

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
	private projectileInterval: IntervalTimer;
	private config: TowerConfigType;
	private crosshair: Phaser.GameObjects.Sprite;

	constructor(game: Game, node: Node, config: TowerConfigType) {
		super(game, node.cx, node.cy, 'endgate');
		this.game = game;
		this.config = config;
		this.projectileInterval = new IntervalTimer(PROJECTILE_INTERVAL_MSEC, () => this.doProjectile());
	}

	shoot(angleDegrees: number) {
		let start = { x: this.x, y: this.y };
		start = Point.add(start, Point.radial(20, angleDegrees));
		const sprite = new IsoSprite(this.game, start.x, start.y, 'projectile');
		sprite.velocity = Point.radial(BULLET_SPEED, angleDegrees);
		this.game.bullets.add(sprite);
		this.game.spriteLayer.add(sprite);
	}

	preUpdate(time: number, delta: number) {
		this.projectileInterval.preUpdate(time, delta);
	}

	doProjectile() {
		for (const bullet of this.config.bullets) {
			
			if (bullet.type === 'fixed') {
				const angleDegrees = bullet.dir;
				this.shoot(angleDegrees);
			}
			else {
				// pick a random banana
				const banana = pickRandom(this.game.bananas.getChildren()) as Banana;
				if (!banana) return;
				this.crosshair = new CrossHair(this.game, banana.x, banana.y, banana, this);
				this.game.uiLayer.add(this.crosshair);
			}
		}
	}
}
