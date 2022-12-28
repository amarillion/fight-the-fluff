import Phaser from 'phaser';

import { TESSELATIONS, TesselationType } from './tesselate.js';
import { transform, translate, scale, applyToPoints, rotate, applyToPoint } from 'transformation-matrix';
import { SCALE } from './constants.js';
import { centerOfMass } from './util/geometry.js';
import { Tile, TILES } from './tiles.js';
import { Point } from './util/point.js';

export function drawTiles(scene: Phaser.Scene) {
	for (const tesselation of Object.values(TESSELATIONS)) {
		for (const tile of TILES[tesselation.name]) {
			drawTile(tile, scene, tesselation);
		}
	}
}

function boundingBox(points : Point[]) {
	return {
		top : Math.min(...points.map(p => p.y)),
		left : Math.min(...points.map(p => p.x)),
		bottom : Math.max(...points.map(p => p.y)),
		right : Math.max(...points.map(p => p.x)),
	};
}

function drawTile(tile : Tile, scene: Phaser.Scene, tesselation: TesselationType) {
	const connectionMask = tile.connectionMask;
	const resKey = `tile-${tesselation.name}-${connectionMask}`;
	const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

	const { points } = tesselation;
	const cc = centerOfMass(points);

	const MARGIN = 8;
	const bbox = boundingBox(points);
	const ox = (-bbox.left * SCALE) + MARGIN;
	const oy = (-bbox.top * SCALE) + MARGIN;

	const w = (bbox.right - bbox.left) * SCALE + 2 * MARGIN;
	const h = (bbox.bottom - bbox.top) * SCALE + 2 * MARGIN;
	renderTile(graphics, ox, oy, tesselation, connectionMask, 0x44aa44, 0x338833, 0xCCCC88);
	graphics.generateTexture(resKey, w, h);

	tile.resKey = resKey;
	tile.origin = { x: ox, y: oy },
	tile.center = { x: ox + (cc.x * SCALE), y: oy + (cc.y * SCALE) };
}

function renderTile(
	graphics: Phaser.GameObjects.Graphics, 
	ox: number, oy: number, tesselation: TesselationType, 
	connectionMask: number, fillColor: number, outlineColor: number, pathColor: number
) {
	const { points, links, primitiveUnit, unitSize } = tesselation;
	const cc = centerOfMass(points);
	
	const srcMatrix = transform(
		translate(ox, oy),
		scale(SCALE, SCALE),
	);

	const tPoints = applyToPoints(srcMatrix, points); 
	const polygon = new Phaser.Geom.Polygon(tPoints);

	graphics.fillStyle(fillColor);
	graphics.fillPoints(polygon.points, true);

	// draw paths
	const primary = links[0];
	let connectionBit = 1;
	for (const { dx, dy, idx } of primary) {
		if ((connectionMask & connectionBit) === 0) {
			connectionBit *= 2;
			continue;
		}
		connectionBit *= 2;

		graphics.lineStyle(8.0, pathColor);
		const destUnit = primitiveUnit[idx];
		const xx = dx * unitSize[0] + destUnit.x;
		const yy = dy * unitSize[1] + destUnit.y;

		const destMatrix = transform(
			translate(ox, oy),
			scale(SCALE, SCALE),
			translate(xx, yy),
			rotate(destUnit.rotation)
		);
		const src = applyToPoint(srcMatrix, cc);
		const target = applyToPoint(destMatrix, cc);	
		graphics.lineBetween(src.x, src.y, (target.x + src.x) / 2, (target.y + src.y) / 2);
	}

	graphics.lineStyle(3.0, outlineColor);
	graphics.strokePoints(polygon.points, true);
}
