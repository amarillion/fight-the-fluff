import { Node } from '../grid.js';
import { Point } from '../util/point.js';
import { Game } from '../scenes/Game.js';
import { IsoSprite } from './IsoPhysics.js';
import { TowerConfigType } from '../levels.js';

export class IntervalTimer {
	
	private readonly startTime: number;
	private readonly action: () => void;
	private remain: number;

	constructor(startTime: number, onIntervalComplete: () => void) {
		this.startTime = startTime;
		this.action = onIntervalComplete;
		this.remain = startTime;
	}

	preUpdate(timer: number, delta: number) {
		this.remain -= delta;
		if (this.remain < 0) {
			this.action();
			this.remain += this.startTime;
		}
	}
}

const PROJECTILE_INTERVAL_MSEC = 900; ///TODO: level-dependent.
const BULLET_SPEED = 50.0;

export class Tower extends Phaser.GameObjects.Sprite {

	private readonly game: Game;
	private projectileInterval: IntervalTimer;
	private config: TowerConfigType;

	constructor(game: Game, node: Node, config: TowerConfigType) {
		super(game, node.cx, node.cy, 'endgate');
		this.game = game;
		this.config = config;
		this.projectileInterval = new IntervalTimer(PROJECTILE_INTERVAL_MSEC, () => this.doProjectile());
	}

	preUpdate(time: number, delta: number) {
		this.projectileInterval.preUpdate(time, delta);
	}

	doProjectile() {
		for (const bullet of this.config.bullets) {
			const angle = bullet.dir || 0;
			let start = { x: this.x, y: this.y };
			start = Point.add(start, Point.radial(20, angle));
			const sprite = new IsoSprite(this.game, start.x, start.y, 'projectile');
			sprite.velocity = Point.radial(BULLET_SPEED, angle);
			this.game.bullets.add(sprite);
			this.game.spriteLayer.add(sprite);
		}
	}
}
