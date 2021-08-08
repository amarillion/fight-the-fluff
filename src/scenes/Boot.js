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
		this.load.image('startgate', './assets/images/BananaBox.png');
		this.load.image('endgate', './assets/images/Ship.png');
	}
	
	create () {
		this.scene.start('MenuScene'); // TODO: change back to MenuScene
	}

}
