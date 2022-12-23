import { Grid, Node } from '../grid.js';
import Phaser from 'phaser';
import { pickOne } from '@amarillion/helixgraph/lib/random.js';
import { assert } from '@amarillion/helixgraph/lib/assert.js';
import { trackbackNodes } from '@amarillion/helixgraph/lib/pathFinding.js';
import { breadthFirstSearch } from '@amarillion/helixgraph';

import { Fluff } from '../sprites/Fluff.js';
import { Banana } from '../sprites/Banana.js';
import { TESSELATIONS, TesselationType } from '../tesselate.js';
import { TILES, Tile } from '../tiles.js';
import { drawTiles } from '../drawTiles.js';
import { MAX_SCORE, SCALE, SCREENH, SCREENW } from '../constants.js';
import { ProgressBar } from '../sprites/progress-bar.js';
import DraggableTile, { Draggable } from '../sprites/DraggableTile.js';
import { openDialog } from '../components/Dialog.js';
import { LEVELDATA } from '../levels.js';
import { Point } from '../util/geometry.js';

const CONTROL_SIZE = 120;
const BAR_W = 100;
const BAR_H = 50;
const MARGIN = 5;

function initGrid(tesselation) {
	const { unitSize, links } = tesselation;
	
	const mw = Math.ceil(SCREENW / SCALE / unitSize[0]);
	const mh = Math.ceil(SCREENH / SCALE / unitSize[1]);
	
	// let mw = 8, mh = 4;
	const xco = 0;
	let yco = 0;

	const grid = new Grid(mw, mh); // TODO: infinite grid?

	for (let my = 0; my < mh; ++my) {
		let rowX = xco;
		for (let mx = 0; mx < mw; ++mx) {
			const unit = grid.get(mx, my);
			unit.addPrimitiveUnit(mx, my, rowX, yco, tesselation, SCALE);
			rowX += unitSize[0] * SCALE;
		}
		yco += unitSize[1] * SCALE;
	}

	grid.initLinks(links);

	return grid;
}

export class Game extends Phaser.Scene {

	constructor () {
		super({ key: 'GameScene' });
	}
	// init () {}
	// preload () {}

	debugPrimaryUnitRectangle(unit) {
		// render primary unit rectangle
		const rect = new Phaser.GameObjects.Rectangle(
			this, unit.xco, unit.yco, unit.unitSize[0] * SCALE, unit.unitSize[1] * SCALE
		);
		rect.isFilled = false;
		rect.isStroked = true;
		rect.setStrokeStyle(3.0, 0xAA8888, 1.0);
		this.bgLayer.add(rect);
		rect.setOrigin(0,0);
		console.log({ xco: unit.xco, yco: unit.yco, w: unit.unitSize[0], h: unit.unitSize[1], rect });
	}

	renderPolygons(grid) {

		for (const unit of grid.eachNode()) {

			/*
			this.debugPrimaryUnitRectangle(unit);
			*/

			for (const node of unit.nodes) {
				const { points } = node;
				const poly = new Phaser.GameObjects.Polygon(
					this, 
					0, 0,
					points,
					0, 1.0
				);
				poly.setOrigin(0,0);
				// const rect = poly.getBounds();
				// if (rect.bottom < 0 || rect.top > SCREENH || rect.right < 0 || rect.left > SCREENW) continue;
		
				poly.isFilled = false;
				poly.isStroked = true;
				poly.setStrokeStyle(3.0, 0xA0A0A0, 1.0);
				this.bgLayer.add(poly);
				node.delegate = poly;
			}
			
		}
	
	}

	spriteLayer : Phaser.GameObjects.Layer;
	bgLayer: Phaser.GameObjects.Layer;
	tileLayer: Phaser.GameObjects.Layer;
	uiLayer: Phaser.GameObjects.Layer;
	fluffs: Phaser.GameObjects.Group;

	score: number;
	level: number;

	grid: Grid;
	tileSet: Tile[];
	noDeadEnds: Tile[];
	startNode: Node;
	endNode: Node;
	solution: Node[];
	progressbar: ProgressBar;
	control: Phaser.GameObjects.Ellipse;
	draggableTile: DraggableTile;
	uiBlocked: boolean;
	tesselation: TesselationType;

	initGates() {
		this.startNode = this.findNodeAt(150, 150);
		this.setTile(this.startNode, this.tileSet[this.tileSet.length - 1]);
		
		const c1 = new Phaser.GameObjects.Sprite(this, this.startNode.cx, this.startNode.cy, 'startgate');
		this.spriteLayer.add(c1);

		this.endNode = this.findNodeAt(SCREENW - 150, SCREENH - 150);
		this.setTile(this.endNode, this.tileSet[this.tileSet.length - 1]);
		const c2 = new Phaser.GameObjects.Sprite(this, this.endNode.cx, this.endNode.cy, 'endgate');
		this.spriteLayer.add(c2);
	}

	onRotateLeft() {
		if (this.uiBlocked) { return; }
		if (this.draggableTile) this.draggableTile.rotateLeft();
	}

	onRotateRight() {
		if (this.uiBlocked) { return; }
		if (this.draggableTile) this.draggableTile.rotateRight();
	}

	initUI() {
		const control = new Phaser.GameObjects.Ellipse(this, SCREENW - (CONTROL_SIZE / 2), (CONTROL_SIZE / 2), CONTROL_SIZE - MARGIN, CONTROL_SIZE - MARGIN, 0x888888, 0.5);
		control.setStrokeStyle(2.0, 0x000000);
		this.control = control;
		this.uiLayer.add(control);

		const rotateButton1 = new Phaser.GameObjects.Text(this, 
			SCREENW - CONTROL_SIZE, CONTROL_SIZE, 
			'[L]', { backgroundColor: '#00f', color: '#fff', fontSize: '32px' }
		);
		rotateButton1.setInteractive().on('pointerdown', () => this.onRotateLeft() );
		this.uiLayer.add(rotateButton1);

		const rotateButton2 = new Phaser.GameObjects.Text(this, 
			SCREENW - 60, CONTROL_SIZE, 
			'[R]', { backgroundColor: '#00f', color: '#fff', fontSize: '32px' }
		);
		rotateButton2.setInteractive().on('pointerdown', () => this.onRotateRight() );
		this.uiLayer.add(rotateButton2);

		this.progressbar = new ProgressBar({
			scene: this, layer: this.uiLayer,
			x: SCREENW - BAR_W - MARGIN, y: SCREENH - BAR_H - MARGIN,
			w: BAR_W, h: BAR_H
		});
	}

	addReusableAnimations() {
		this.anims.create({
			key: 'fluff',
			frames: this.anims.generateFrameNumbers('fluff-spritesheet', { frames: [ 0, 1 ] }),
			frameRate: 5,
			repeat: -1
		});
		this.anims.create({
			key: 'banana',
			frames: this.anims.generateFrameNumbers('banana-spritesheet', { frames: [0, 1] }),
			frameRate: 5,
			repeat: -1
		});
	}

	initLevel() {
		this.children.removeAll(); // was: this.add.displayList.removeAll
		
		this.bgLayer = this.add.layer();
		this.bgLayer.setDepth(0);
		this.tileLayer = this.add.layer();
		this.tileLayer.setDepth(1);
		this.spriteLayer = this.add.layer();
		this.spriteLayer.setDepth(2);
		this.uiLayer = this.add.layer();
		this.uiLayer.setDepth(3);
		
		this.fluffs = this.add.group();

		this.score = 0;
		const levelData = LEVELDATA[this.level % LEVELDATA.length];
		this.tesselation = TESSELATIONS[levelData.tesselation];

		this.grid = initGrid(this.tesselation);
		this.renderPolygons(this.grid);

		this.tileSet = TILES[this.tesselation.name];
		this.noDeadEnds = this.tileSet.filter(tile => !(tile.connectionMask in {0:0, 1:1, 2:2, 4:4, 8:8, 16:16, 32:32, 64:64}));

		this.initGates();

		this.initUI();

		this.updateNextTile();

		assert(this.startNode !== null);
		assert(this.endNode !== null);

		if (levelData.dialog) {
			this.uiBlocked = true;
			openDialog(levelData.dialog, () => {
				this.uiBlocked = false;
			});
		}

	}

	endReached() {
		this.score++;
		this.progressbar.refresh(this.score, MAX_SCORE);

		if (this.score === MAX_SCORE) {
			const text = new Phaser.GameObjects.Text(this, 
				SCREENW / 2, SCREENH / 2, 'LEVEL COMPLETE', { color: 'black', align: 'center' }
			);
			this.uiLayer.add(text);
			setTimeout(() => {
				this.level++;
				this.initLevel();
				text.destroy();
			}, 3000);
		}
	}

	debugAdjacent(node) {
		node.delegate.isFilled = true;
		let i = 0;
		for (const [ , adjacent ] of Node.getAdjacent(node)) {
			const delegate = adjacent.delegate as Phaser.GameObjects.Polygon;
			setTimeout(() => delegate.isFilled = true, (i+2) * 200);
			setTimeout(() => delegate.isFilled = false, (i+3) * 200);
			i++;
		}
		setTimeout(() => node.delegate.isFilled = false, 100);
		console.log(`{ dx: ${node.mx - 1}, dy: ${node.my - 1}, idx: ${node.idx} },`);
	}

	addMob() {
		if (this.uiBlocked) { return; }

		const config = {
			scene: this,
			node: this.startNode,
		};
		const sprite = new Banana(config);
		this.spriteLayer.add(sprite);
		
		
		
		this.spawnFluff();
	}

	spawnFluff() {
		// if (Math.random() > 0.5) {
		// pick a random node

		let minimum = 0;
		if (this.score > MAX_SCORE * 0.5) minimum = 1;
		if (this.score > MAX_SCORE * 0.8) minimum = 2;

		do {
			const cell = this.grid.randomCell();
			const node = pickOne(cell.nodes);

			//TODO: instead - pick a random node that doesn't have a tile, and look for an adjacent one that does
			if (node.tile) {
				const sprite = new Fluff({scene: this, node});
				this.spriteLayer.add(sprite);
				this.fluffs.add(sprite);
				console.log('Added fluff', this.fluffs.children.size);
			}
			// }
		}
		while (this.fluffs.children.size < minimum);
	}

	findNodeAt(xco, yco) {
		// TODO: check bounding box of unit as speed optimization...
		for (const unit of this.grid.eachNode()) {
			for (const node of unit.nodes) {
				if (!node.delegate) continue; // outside screen is undefined
				const delegate = node.delegate as Phaser.GameObjects.Polygon;
				if (Phaser.Geom.Polygon.Contains(delegate.geom, xco, yco)) {
					return node;
				}
			}
		}
		return null;
	}

	setTile(node : Node, tile : Tile) {
		node.tile = tile;
		const img = new Phaser.GameObjects.Image(this, node.xco, node.yco, node.tile.resKey);
		img.setDisplayOrigin(tile.origin.x, tile.origin.y);
		img.rotation = node.element.rotation;
		node.tileImg = img;
		this.tileLayer.add(img);
		this.checkPath();
	}

	destroyTile(node: Node) {
		// can't destroy start or end!
		if (node === this.startNode || node === this.endNode) return;

		const img = node.tileImg as Phaser.GameObjects.Image;
		const tile = node.tile;
		
		if (!tile || !img) return; // already destroyed by something else....

		// re-center on the center of mass instead of the pivot
		img.setPosition(
			node.xco - tile.origin.x + tile.center.x, 
			node.yco - tile.origin.y + tile.center.y
		);
		img.setDisplayOrigin(tile.center.x, tile.center.y);

		
		this.tweens.add({
			targets: [ img ],
			duration: 1000,
			rotation: Math.PI,
			scale: 0,
			onComplete: () => img.destroy()
		});

		node.tile = null;
		node.tileImg = null;
	}

	checkPath() {
		const prev = breadthFirstSearch(this.startNode, this.endNode, Node.getAdjacent);
		this.solution = trackbackNodes(this.startNode, this.endNode, prev);
		if (this.solution) {
			console.log(this.solution);
		}
	}

	updateNextTile() {
		const nextTile = pickOne(this.noDeadEnds);
		this.draggableTile = new DraggableTile({
			scene: this, 
			x: SCREENW - (CONTROL_SIZE / 2),
			y: (CONTROL_SIZE / 2),
			tile: nextTile
		});
		this.uiLayer.add(this.draggableTile);
	}


	create () {
		this.addReusableAnimations();
		
		// make tile variants
		this.level = 0;
		this.uiBlocked = false;
		drawTiles(this);

		this.time.addEvent({ delay: 1000, callback: () => this.addMob(), loop: true });
	
		this.initLevel();
		
		this.input.on('pointerdown', (pointer) => {
			/*
			const node = this.findNodeAt(pointer.x, pointer.y);
			if (node && !node.tile) {
				assert(!!this.nextTile);
				this.setTile(node, this.nextTile);
				this.updateNextTile();
				// this.debugAdjacent(node);
			}
			*/
			this.onDown(pointer);
		});
		this.input.on('pointermove', (pointer) => this.onMove(pointer));
		this.input.on('pointerup', (pointer) => this.onRelease(pointer));
		
		// Phaser annoyance: gameout is weird, gameover is weirder.
		// Who thought of naming the event when a pointer enters the game screen 'gameover'???
		this.input.on('gameout', () => this.onGameOut());

		const music = this.sound.add('music', { loop: true });
		music.play();
	}

	dragTarget : Draggable;

	controlContains(pos : Point) {
		/**
		 * Phaser annoyance: the geom of an ellipse object does not have the translation information
		 *  needed to convert to screen coordinates.
		 * 
		 * So we need to take an extra step to convert coordinate with getLocalPoint()
		 * 
		 * Why can't I call this.control.geom.Contains? Why so indirect via utility method?
		 * This means there is no polymorphism possible here...
		 */
		const localPoint = this.control.getLocalPoint(pos.x, pos.y);
		const result = Phaser.Geom.Ellipse.Contains(this.control.geom, localPoint.x, localPoint.y);
		return result;
	}

	onDown(pointer) {
		if (this.uiBlocked) { return; }

		const contains = this.controlContains(pointer);
		if (contains) {
			this.dragTarget = this.draggableTile;
			this.dragTarget.dragStart(pointer);
			return;
		}

		// else check for fluffs to drag...
		// Phaser annoyance: children is Phasers own Set type that can not be iterated...
		for (const f of this.fluffs.children.getArray()) {
			const fluff = f as Fluff;
			const center = fluff.getCenter();
			const dx = pointer.x - center.x;
			const dy = pointer.y - center.y;
			if (Math.abs(dx) < 64 && Math.abs(dy) < 64) {
				this.dragTarget = fluff;
				this.dragTarget.dragStart(pointer);
				return;
			}

		}
	}

	onGameOut() {
		if (this.uiBlocked) { return; }
		if (this.dragTarget) {
			// use negative coordinates to indicate out of screen
			this.dragTarget.dragMove({x: -1, y: -1});
		}
	}

	onMove(pointer) {
		if (this.uiBlocked) { return; }

		if (this.dragTarget) {
			if (pointer.isDown) {
				this.dragTarget.dragMove(pointer);
			}
			else {
				// we missed the onRelease event. This can happen if the mouse left the screen and returned...
				this.dragTarget.dragCancel(pointer);
			}
		}
		
	}

	onRelease(pointer) {
		if (this.uiBlocked) { return; }

		if (!this.dragTarget) return;

		this.dragTarget.dragRelease(pointer);
		this.dragTarget = null;
	}

}
