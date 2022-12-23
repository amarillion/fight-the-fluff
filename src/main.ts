import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import { Game as GameScene } from './scenes/Game.js';
import { MenuScene } from './scenes/menu.js';
import { MenuComponent } from './components/menuComponent.js';

import { SCREENH, SCREENW } from './constants.js';
import { DebugTilesScene } from './scenes/DebugTilesScene.js';

const config = {
	type: Phaser.AUTO,
	parent: 'content',
	disableContextMenu: true,
	backgroundColor: '#dddddd',
	width: SCREENW,
	height: SCREENH,
	localStorageName: 'tins21-amarillion',
	fps: {
		target: 60
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: 'content'
	},
	scene: [
		BootScene, 
		GameScene, 
		MenuScene, 
		DebugTilesScene 
	]
};

class Game extends Phaser.Game {
	constructor () {
		super(config);
	}
}

customElements.define('game-menu', MenuComponent);

export const game = new Game();
