import { TemplateGrid } from '@amarillion/helixgraph/lib/BaseGrid.js';
import {scale, rotate, translate, transform, applyToPoints } from 'transformation-matrix';
import { Tile } from './tiles.js';
import { PrimitiveUnitPart, TesselationType } from './tesselate.js';
import { Point } from './util/geometry.js';

export class Node {
	mx: number;
	my: number;
	idx: number;
	unitXco: number;
	unitYco: number;
	xco: number;
	yco: number;
	points: Point[];
	cx: number;
	cy: number;
	element: PrimitiveUnitPart;
	links: Node[];
	delegate: { isFilled: boolean };
	tile: Tile;
	tileImg: unknown;

	constructor(
		mx: number, my: number, idx: number, 
		xco: number, yco: number, element: PrimitiveUnitPart, 
		points : Point[], SCALE: number
	) {
		this.mx = mx;
		this.my = my;
		this.idx = idx;
		this.unitXco = xco;
		this.unitYco = yco;
		this.xco = xco + element.x * SCALE;
		this.yco = yco + element.y * SCALE;
		const matrix = transform(
			translate(xco, yco),
			scale(SCALE, SCALE),
			translate(element.x, element.y),
			rotate(element.rotation),
		);
		this.points = applyToPoints(matrix, points);
		this.cx = this.points.reduce((prev, cur) => prev + cur.x, 0) / this.points.length;
		this.cy = this.points.reduce((prev, cur) => prev + cur.y, 0) / this.points.length;
		this.element = element;
		this.links = [];
	}

	toString() {
		return `unit [${this.mx} ${this.my}] index: ${this.idx}`;
	}

	static getLinks(node : Node) {
		return Object.entries(node.links);
	}

	static *getAdjacent(node : Node) {
		for (const exit of Node.getExits(node)) {
			const otherNode = exit[1];
			for (const returns of Node.getExits(otherNode)) {
				if (returns[1] === node) {
					yield exit;
				}
			}
		}
	}

	static *getExits(node : Node) {
		const connectionMask = node.tile && node.tile.connectionMask || 0;
		let bit = 1;
		for (const link of Node.getLinks(node)) {
			if ((connectionMask & bit) > 0) {
				yield link;
			}
			bit *= 2;
		}
	}

}

/** Unit combines all shapes in a primitive unit */
export class Unit {
	x: number;
	y: number;
	grid: Grid;
	nodes: Node[];
	xco: number;
	yco: number;
	unitSize: [number, number];

	constructor(x: number, y: number, grid: Grid) {
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.nodes = [];
	}

	push(node: Node) {
		this.nodes.push(node);
	}

	addPrimitiveUnit(
		mx: number, my: number, secondX: number, secondY: number, 
		tesselation : TesselationType, SCALE: number
	) {
		const { primitiveUnit, unitSize, points } = tesselation;
		let idx = 0;
		for (const element of primitiveUnit) {
			this.push(new Node(mx, my, idx++, secondX, secondY, element, points, SCALE));
		}
		this.xco = secondX;
		this.yco = secondY;
		this.unitSize = unitSize;

		// for (let i = 0; i < 2; i += 0.3) {
		// 	const element = {
		// 		x: 0, y: 0, rotation: i
		// 	};
		// 	this.push(new Node(secondX, secondY, element, points, SCALE));
		// }

	}

}

export class Grid extends TemplateGrid<Unit> {
	
	constructor(w: number, h: number) {
		super(w, h, (x, y, grid: Grid) => new Unit(x, y, grid));
	}

	initLinks(linksTemplate: { dx: number, dy: number, idx: number }[][]) {
		
		for (const unit of this.eachNode()) {
			const mx = unit.x;
			const my = unit.y;
			for (let l = 0; l < linksTemplate.length; ++l) {
				const node = unit.nodes[l];
				if (!node) continue;
				for (const { dx, dy, idx } of linksTemplate[l]) {
					const nx = mx + dx, ny = my + dy;
					const targetUnit = this.get(nx, ny);
					if (!targetUnit) continue;
					const targetNode = targetUnit.nodes[idx];
					node.links.push(targetNode);
					// console.log(`linked ${node} to ${targetNode}`);
				}
			}
		}

	}
}
