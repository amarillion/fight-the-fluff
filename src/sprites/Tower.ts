import { Node } from '../grid.js';
import { Game } from '../scenes/Game.js';
import { Point, toRadians } from '../util/geometry.js';
import { SCREENW, SCREENH } from '../constants.js';

export class Projectile extends Phaser.GameObjects.Sprite {

	private readonly game: Game;
	private dx = 0;
	private dy = 0;

	constructor(game: Game, pos: Point, angleRad: number, speed: number) {
		super(game, pos.x, pos.y, 'projectile');
		this.game = game;

		this.dx = Math.sin(angleRad) * speed;
		this.dy = Math.cos(angleRad) * speed;
	}

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);

		this.x += this.dx;
		this.y += this.dy;

		// if outside screen area, kill.
		if (this.x > SCREENW || this.y > SCREENH || this.x < 0 || this.y < 0) {
			this.destroy();
		}		
	}
}

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
const BULLET_SPEED = 2.0;

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
			const sprite = new Projectile(this.game, { x: this.x, y: this.y }, toRadians(angle), BULLET_SPEED);
			this.game.bullets.add(sprite);
			this.game.spriteLayer.add(sprite);
		}
	}
}
