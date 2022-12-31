import { Grid, Node, Unit } from '../grid.js';
import Phaser from 'phaser';
import { pickOne, randomInt } from '@amarillion/helixgraph/lib/random.js';
import { assert } from '@amarillion/helixgraph/lib/assert.js';
import { Fluff } from '../sprites/Fluff.js';
import { Banana } from '../sprites/Banana.js';
import { TESSELATIONS, TesselationType } from '../tesselate.js';
import { TILES, Tile } from '../tiles.js';
import { drawTiles } from '../drawTiles.js';
import { SCALE, SCREENH, SCREENW } from '../constants.js';
import { ProgressBar } from '../sprites/progress-bar.js';
import DraggableTile, { Draggable } from '../sprites/DraggableTile.js';
import { openDialog } from '../components/Dialog.js';
import { LEVELDATA, LevelDataType } from '../levels.js';
import { Tower } from '../sprites/Tower.js';
import { StartGate } from '../sprites/StartGate.js';
import { Point } from '../util/point.js';
import { IsoPhysics } from '../sprites/IsoPhysics.js';
import { KeyCombo } from '../util/keycombo.js';
import { IntervalTimer } from '../util/IntervalTimer.js';

const CONTROL_SIZE = 120;
const BAR_W = 100;
const BAR_H = 50;
const MARGIN = 5;

const LASER_WARMUP = 2000;
const MAX_BANANAS = 6; // maximum at the same time on screen

function initGrid(tesselation: TesselationType) {
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

	spriteLayer : Phaser.GameObjects.Layer;
	cloudLayer: Phaser.GameObjects.Layer;
	bgLayer: Phaser.GameObjects.Layer;
	tileLayer: Phaser.GameObjects.Layer;
	uiLayer: Phaser.GameObjects.Layer;
	fluffs: Phaser.GameObjects.Group;
	bananas: Phaser.GameObjects.Group;
	bullets: Phaser.GameObjects.Group;
	towers: Phaser.GameObjects.Group;

	score: number;
	maxScore: number;
	level: number;

	grid: Grid;
	tileSet: Tile[];
	noDeadEnds: Tile[];
	startNode: Node;
	solution: Node[];
	progressbar: ProgressBar;
	control: Phaser.GameObjects.Ellipse;
	draggableTile: DraggableTile;
	uiBlocked: boolean;
	tesselation: TesselationType;

	private readonly keyCombo = new KeyCombo({ code: /iddqd/, action: () => {
		this.advanceToNextLevel();
	}});

	constructor () {
		super({ key: 'GameScene' });
	}
	// init () {}
	// preload () {}

	debugPrimaryUnitRectangle(unit: Unit) {
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

	renderPolygons(grid: Grid) {

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

	initGates(levelData: LevelDataType) {
		this.startNode = this.findNodeAt(levelData.startPos.x, levelData.startPos.y);
		this.startNode.isStartNode = true;
		this.setTile(this.startNode, this.tileSet[this.tileSet.length - 1]);
		const c1 = new StartGate(this, this.startNode);
		this.spriteLayer.add(c1);
		this.maxScore = 0;

		for (const tower of levelData.towers) {
			const node = this.findNodeAt(tower.pos.x, tower.pos.y);
			this.setTile(node, this.tileSet[this.tileSet.length - 1]);
			node.isEndNode = true;
			const c2 = new Tower(this, node, tower);
			this.spriteLayer.add(c2);
			this.towers.add(c2);
			this.maxScore += c2.hp;
		}

		const laserInterval = new IntervalTimer(levelData.laserPeriod, () => this.doLaser());
		this.intervals.push(laserInterval);

		const fluffInterval = new IntervalTimer(levelData.fluffPeriod, () => this.spawnFluff());
		this.intervals.push(fluffInterval);

		const bananaInterval = new IntervalTimer(1600, () => this.addMob());
		this.intervals.push(bananaInterval);
	}

	private intervals: IntervalTimer[] = [];

	update(time: number, delta: number) {
		super.update(time, delta);
		this.intervals.forEach(i => i.preUpdate(time, delta));

		IsoPhysics.overlap(this.bananas, this.bullets, 
			//TODO: explosion... 
			(a, b) => { a.destroy(); b.destroy(); this.playEffect('sfx-cannon-hit'); }
		);
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
			key: 'crosshair',
			frames: this.anims.generateFrameNumbers('crosshair-spritesheet', { frames: [ 0, 1 ] }),
			frameRate: 20,
			repeat: -1
		});
		this.anims.create({
			key: 'laser',
			frames: this.anims.generateFrameNumbers('laser-spritesheet', { frames: [ 0, 1, 2 ] }),
			frameRate: 1,
			repeat: 0
		});
		this.anims.create({
			key: 'banana',
			frames: this.anims.generateFrameNumbers('banana-spritesheet', { frames: [0, 1] }),
			frameRate: 5,
			repeat: -1
		});
	}

	initLevel() {
		// TODO: cleaner solution to make each level its own Scene, and destroy that.
		// no risk of lingering references...
		this.children.each(c => c.destroy());
		this.children.removeAll();
		this.intervals = [];

		this.cloudLayer = this.add.layer();
		this.cloudLayer.setDepth(-1);
		this.bgLayer = this.add.layer();
		this.bgLayer.setDepth(0);
		this.tileLayer = this.add.layer();
		this.tileLayer.setDepth(1);
		this.spriteLayer = this.add.layer();
		this.spriteLayer.setDepth(2);
		this.uiLayer = this.add.layer();
		this.uiLayer.setDepth(3);
		
		this.fluffs = this.add.group();
		this.bananas = this.add.group();
		this.bullets = this.add.group();
		this.towers = this.add.group();
		
		this.score = 0;
		const levelData = LEVELDATA[this.level % LEVELDATA.length](this.level);
		this.tesselation = TESSELATIONS[levelData.tesselation];

		this.grid = initGrid(this.tesselation);
		this.renderPolygons(this.grid);

		this.tileSet = TILES[this.tesselation.name];
		this.noDeadEnds = this.tileSet.filter(tile => !(tile.connectionMask in {0:0, 1:1, 2:2, 4:4, 8:8, 16:16, 32:32, 64:64}));

		this.initGates(levelData);

		this.initUI();

		this.updateNextTile();

		assert(this.startNode !== null);

		if (levelData.dialog) {
			this.uiBlocked = true;
			openDialog(levelData.dialog, () => {
				this.uiBlocked = false;
			});
		}

		// destroys any physics bodies with setCollideWorldBounds(true) AND onWorldBounds = true
		this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
			const sprite = body.gameObject as  Phaser.GameObjects.Sprite;
			sprite.destroy();
		});

		const cloudInterval = new IntervalTimer(2000, () => this.doCloud());
		this.intervals.push(cloudInterval);
	}

	doCloud() {
		const cloud = new Phaser.GameObjects.Image(this, SCREENW + 10, randomInt(SCREENH), 'cloud');
		this.cloudLayer.add(cloud);
		this.tweens.add({
			targets: [ cloud ],
			x: - 10,
			duration: 10000,
			onComplete: () => { cloud.destroy(); }
		});

	}

	advanceToNextLevel() {
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

	endReached() {
		this.score++;
		this.progressbar.refresh(this.score, this.maxScore);

		if (this.score === this.maxScore) {
			this.advanceToNextLevel();
		}
	}

	debugNode(node: Node) {
		// LOG DEBUGGING INFO
		console.log(node);
		let exitIdx = 0;
		for (const exit of Node.getExits(node)) {
			const otherNode = exit[1];
			let msg = `Exit ${exitIdx} dir: ${exit[0]} node: ${exit[1]} => `;
			for (const returns of Node.getExits(otherNode)) {
				if (returns[1] === node) {
					msg += ` return found`;
				}
			}
			exitIdx++;
			console.log(msg);
		}		
	}

	addMob() {
		if (this.uiBlocked) { return; }

		if (this.bananas.getLength() > MAX_BANANAS) { return; }
		const config = {
			scene: this,
			node: this.startNode,
		};
		const sprite = new Banana(config);
		this.bananas.add(sprite);
		this.spriteLayer.add(sprite);
	}

	doLaser() {
		// pick a tile at random
		const cell = this.grid.randomCell();
		const node = pickOne(cell.nodes.filter(n => (n.tile && !n.isStartNode && !n.isEndNode && !n.scorched)));
		if (node && node.tile) {
			const sprite = new Phaser.GameObjects.Sprite(this, node.cx, node.cy, 'laser-spritesheet');
			sprite.setOrigin(0.5, 0.97);
			sprite.play('laser');
			this.tileLayer.add(sprite);
			
			node.scorchMark = sprite; // already mark node so it can't be picked up.
			node.scorched = true;
			setTimeout(() => { 
				node.tile = this.tileSet[0]; // removes connections. 
				this.checkPath();
			}, LASER_WARMUP);
			setTimeout(() => {
				this.playEffect('sfx-laser');
			});
		}
	}

	spawnFluff() {
		// if (Math.random() > 0.5) {
		// pick a random node

		let minimum = 0;
		if (this.score > this.maxScore * 0.5) minimum = 1;
		if (this.score > this.maxScore * 0.8) minimum = 2;

		do {
			const cell = this.grid.randomCell();
			const node = pickOne(cell.nodes);

			//TODO: instead - pick a random node that doesn't have a tile, and look for an adjacent one that does
			if (node.tile) {
				const sprite = new Fluff({scene: this, node});
				this.spriteLayer.add(sprite);
				this.fluffs.add(sprite);
				this.playEffect('sfx-fluff-appear');
			}
		}
		while (this.fluffs.children.size < minimum);
	}

	findNodeAt(xco: number, yco: number) {
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
		node.scorched = false;
		this.tileLayer.add(img);
		this.checkPath();
	}

	destroyTile(node: Node) {
		// can't destroy start or end!
		if (node.isStartNode || node.isEndNode) return;

		const img = node.tileImg;
		const scorchMark = node.scorchMark;
		if (scorchMark) { scorchMark.destroy(); }
		const tile = node.tile;
		
		if (!tile || !img) return; // already destroyed by something else....

		// re-center on the center of mass instead of the pivot
		img.setPosition(
			node.xco - tile.origin.x + tile.center.x, 
			node.yco - tile.origin.y + tile.center.y
		);
		img.setDisplayOrigin(tile.center.x, tile.center.y);
	
		this.playEffect('sfx-fluff-shake');
		this.tweens.add({
			targets: [ img, scorchMark ],
			duration: 1000,
			rotation: Math.PI,
			scale: 0,
			onComplete: () => { img.destroy(); scorchMark?.destroy(); }
		});

		node.tile = null;
		node.tileImg = null;
		node.scorchMark = null;
		node.scorched = true;
	}

	checkPath() {
		// const prev = breadthFirstSearch(this.startNode, this.endNode, Node.getAdjacent);
		// this.solution = trackbackNodes(this.startNode, this.endNode, prev);
		// if (this.solution) {
		// 	console.log(this.solution);
		// }
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

	sounds: Record<string, Phaser.Sound.BaseSound> = {};

	create() {
		this.input.keyboard.on('keydown', (evt: { key: string }) => {
			this.keyCombo.onKeyPress(evt.key);
		});
		
		this.addReusableAnimations();

		this.sounds['sfx-laser'        ] = this.game.sound.add('sfx-laser'        );
		this.sounds['sfx-banana-spawn' ] = this.game.sound.add('sfx-banana-spawn' );
		this.sounds['sfx-banana-tower' ] = this.game.sound.add('sfx-banana-tower' );
		this.sounds['sfx-cannon-shoot' ] = this.game.sound.add('sfx-cannon-shoot' );
		this.sounds['sfx-cannon-hit'   ] = this.game.sound.add('sfx-cannon-hit'   );
		this.sounds['sfx-cannon-target'] = this.game.sound.add('sfx-cannon-target');
		this.sounds['sfx-tile-place'   ] = this.game.sound.add('sfx-tile-place'   );
		this.sounds['sfx-tile-pickup'  ] = this.game.sound.add('sfx-tile-pickup'  );
		this.sounds['sfx-tile-deny'    ] = this.game.sound.add('sfx-tile-deny'    );
		this.sounds['sfx-fluff-shake'  ] = this.game.sound.add('sfx-fluff-shake'  );
		this.sounds['sfx-fluff-appear' ] = this.game.sound.add('sfx-fluff-appear' );
		this.sounds['sfx-fluff-throw'  ] = this.game.sound.add('sfx-fluff-throw'  );
		this.sounds['sfx-tower-destroyed' ] = this.game.sound.add('sfx-tower-destroyed'  );

		// make tile variants
		this.level = 0;
		this.uiBlocked = false;
		drawTiles(this);

		this.initLevel();
		
		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			this.onDown(pointer);
		});
		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.onMove(pointer));
		this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.onRelease(pointer));
		
		// Phaser annoyance: gameout is weird, gameover is weirder.
		// Who thought of naming the event when a pointer enters the game screen 'gameover'???
		this.input.on('gameout', () => this.onGameOut());

		const music = this.sound.add('music', { loop: true });
		music.play();
	}

	dragTarget : Draggable;

	playEffect(name: string) {
		const sound = this.sounds[name];
		if (sound) {
			sound.play();
		}
		else {
			console.error(`sfx ${name} not found`);
		}
	}

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

	onDown(pointer: Phaser.Input.Pointer) {
		if (this.uiBlocked) { return; }

		const contains = this.controlContains(pointer);
		if (contains) {
			this.dragTarget = this.draggableTile;
			this.dragTarget.dragStart(pointer);
			return;
		}

		// check for fluffs to drag...
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

		// otherwise, check for tiles...
		const node = this.findNodeAt(pointer.x, pointer.y);
		// if(node) {
		// 	this.debugNode(node);
		// }

		// TODO check if press is maintained at least 100 msec...
		if (node && node.tile) {
			// TODO: remove any pre-existing draggable tiles...
			if (node.isStartNode ||
				node.isEndNode ||
				node.scorched
			) {
				this.playEffect('sfx-tile-deny');
			}
			else {
				this.playEffect('sfx-tile-pickup');
				this.draggableTile = new DraggableTile({
					scene: this, 
					x: pointer.x,
					y: pointer.y,
					tile: node.tile
				});
				this.dragTarget = this.draggableTile;
				this.dragTarget.dragStart(pointer);
				this.uiLayer.add(this.draggableTile);
				
				node.tile = null;
				node.tileImg.destroy();
				node.tileImg = null;
				this.checkPath();
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

	onMove(pointer: Phaser.Input.Pointer) {
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

	onRelease(pointer: Phaser.Input.Pointer) {
		if (this.uiBlocked) { return; }

		if (!this.dragTarget) return;

		this.dragTarget.dragRelease(pointer);
		this.dragTarget = null;
	}

}
