import Phaser from 'phaser';

export default class extends Phaser.Scene {
	constructor () {
		super({ key: 'BootScene' });
	}

	preload () {
		//
		// load your assets
		//
		this.load.spritesheet('banana-spritesheet', './assets/images/Banana_1.png', { frameWidth: 24 });
		this.load.spritesheet('fluff-spritesheet', './assets/images/Fluff_front1.png', { frameWidth: 24 });
		this.load.spritesheet('crosshair-spritesheet', './assets/images/crosshair.png', { frameWidth: 12 });
		this.load.spritesheet('laser-spritesheet', './assets/images/laser.png', { frameWidth: 64, frameHeight: 450 });
		this.load.image('startgate', './assets/images/Ship.png');
		this.load.image('cloud', './assets/images/cloud.png');
		this.load.image('endgate', './assets/images/tower.png');
		this.load.image('projectile', './assets/images/projectile.png');
		this.load.audio('music', ['./assets/music/march_of_the_fluff.mp3']);

		// NOTE! Do not use OGG, it fails on Mac/iOS, and Phaser doesn't give a useful error.
		this.load.audio('sfx-laser',        './assets/sfx/Laser_Cannon-Mike_Koenig-797224747.wav');
		this.load.audio('sfx-banana-spawn', './assets/sfx/connect.wav');
		this.load.audio('sfx-banana-tower', './assets/sfx/explode3.wav');
		this.load.audio('sfx-cannon-shoot', './assets/sfx/shoot1.wav');
		this.load.audio('sfx-cannon-hit',   './assets/sfx/thud.wav');
		this.load.audio('sfx-cannon-target','./assets/sfx/confirm.wav');
		this.load.audio('sfx-tile-place',   './assets/sfx/blockplace.wav');
		this.load.audio('sfx-tile-pickup',  './assets/sfx/newdelete.wav');
		this.load.audio('sfx-tile-deny',    './assets/sfx/denied.wav');
		this.load.audio('sfx-fluff-appear', './assets/sfx/laser.wav');
		this.load.audio('sfx-fluff-shake',  './assets/sfx/lose.wav');
		this.load.audio('sfx-fluff-throw',  './assets/sfx/jump1.wav');
		this.load.audio('sfx-tower-destroyed',  './assets/sfx/expl04.wav');
	}
	
	create () {
		this.scene.start('MenuScene');
	}

}
