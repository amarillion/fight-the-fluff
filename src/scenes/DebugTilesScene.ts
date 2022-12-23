import Phaser from 'phaser';
import { SCREENW } from '../constants.js';
import { drawTiles } from '../drawTiles.js';
import { TILES } from '../tiles.js';

export class DebugTilesScene extends Phaser.Scene {

	constructor () {
		super({ key: 'DebugTilesScene' });
	}

	preload () {
	}

	debugTilesPreview() {
		const startx = 64, starty = 64;
		let xco = startx;
		let yco = starty;
		
		for (const tile of Object.keys(TILES).map(key => TILES[key][0])) {
			// const imgKey = pickOne(TILES.CAIRO)
			console.log(tile);
			
			const img = this.add.image(xco, yco, tile.resKey);
			img.setOrigin(0, 0);
			img.setPosition(xco, yco);
			this.add.existing(img);
			console.log({img});

			const rect = this.add.rectangle(xco, yco, img.width, img.height, 0x000000);
			rect.setOrigin(0, 0);
			rect.isFilled = false;
			rect.setStrokeStyle(1.0, 0x0000FF);
			rect.isStroked = true;
			this.add.circle(xco + tile.origin.x, yco + tile.origin.y, 5.0, 0x00FFFF);
			this.add.circle(xco + tile.center.x, yco + tile.center.y, 5.0, 0xFF00FF);
	
			xco += 128;
			if (xco > SCREENW) {
				yco += 128;
				xco = startx;
			}
	
		}
	
		this.input.on('pointermove', (pointer) => {
			console.log(pointer);
		});
	}
	
	create () {
		drawTiles(this);
		this.debugTilesPreview();
	}

}


