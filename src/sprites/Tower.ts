import { Node } from '../grid.js';
import { Game } from '../scenes/Game.js';
import { toRadians } from '../util/geometry.js';

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

const PROJECTILE_INTERVAL_MSEC = 1000; ///TODO: level-dependent.
const BULLET_SPEED = 200.0;

export class Tower extends Phaser.GameObjects.Sprite {

	private readonly game: Game;
	private projectileInterval: IntervalTimer;

	constructor(game: Game, node: Node) {
		super(game, node.cx, node.cy, 'endgate');
		this.game = game;
		this.projectileInterval = new IntervalTimer(PROJECTILE_INTERVAL_MSEC, () => this.doProjectile());
	}

	preUpdate(time: number, delta: number) {
		this.projectileInterval.preUpdate(time, delta);
	}

	doProjectile() {
		for (const angle of [180, 270]) {
			// const sprite = new Projectile(this.game, { x: this.x, y: this.y }, toRadians(angle), BULLET_SPEED);

			const sprite = this.game.physics.add.sprite(this.x, this.y, 'projectile');
			const radAngle = toRadians(angle);
			sprite.setVelocity(Math.sin(radAngle) * BULLET_SPEED, Math.cos(radAngle) * BULLET_SPEED);
			
			// You need to enable these BOTH to generate 'worldbounds' event.
			// The first enables the collision detection with the world, the second enables generation of events.
			sprite.setCollideWorldBounds(true);
			sprite.body.onWorldBounds = true;

			this.game.bullets.add(sprite);
			this.game.spriteLayer.add(sprite); // needed?
		}
	}
}
