import { TESSELATIONS } from './tesselate.js';
import { Point } from './util/point.js';
import { SCREENW, SCREENH } from './constants.js';

export type BulletType = ({ type: 'aim' } | { type: 'fixed', dir: number }) & { phase?: number }
export type TowerConfigType = { pos: Point, period: number, range: number, bullets: BulletType[] };
export type LevelDataType = {
	dialog: string;
	tesselation: string;
	laserPeriod: number;
	fluffPeriod: number;
	towers: TowerConfigType[]
	startPos: Point
}

export const LEVELDATA: ((i: number) => LevelDataType)[] = [

	(i) => ({ // 0
		dialog: `
<h2>Fole and Raul, our heroes</h2>
<p>
After years of adventuring in deep space,
Fole and Raul are ready to return home.
</p>
<p>
But wait, what's that?
There are indiginous life forms here.
They are fluffy. And they are attacking!
</p>
<p>
They have no choice but to use their <b>exploding bananas</b> to blow up their defensive towers.
</p>
<h2>How to play</h2>
<b>DRAG your tile from the <b>TOP-RIGHT</b> corner.
<b>ROTATE</b> before you drag, by clicking the <b>L</b> or <b>R</b> buttons.
Create a path, but be careful that the fluffs don't sabotage it.
If the fluffs get too annoying, <b>DRAG</b> them away.
<p>
When a tile gets <b>SCORCHED</b> by a laser, you can't use it anymore.
<b>DRAG</b> one of the fluffs on top to get rid of it!
</p>
`,
		tesselation: TESSELATIONS.SQUARE.name,
		towers: [{ 
			pos: { x: SCREENW - 150, y: SCREENH - 150 },
			period: 1400 - (i * 20),
			range: 1200 + (i * 20),
			bullets: [ { type: 'fixed', 'dir': 270 }, { type: 'fixed', 'dir': 180 } ],
		}],
		laserPeriod: i === 0 ? 100000 : 12000 - (i * 200),
		fluffPeriod: 4000 - (i * 50),
		startPos: { x: 150, y: 150},
	}), 
	(i) => ({ // 1
		dialog: `
<h2>Intermission</h2>
<p>
Boy, the geometry of this place is weird, isn't it?
It reminds me of creative coding. Or maybe a Dutch artist with a love for optical illusions...
<p>`,
		tesselation: TESSELATIONS.HEXAGONAL.name,
		towers: [{ 
			pos: { x: SCREENW - 150, y: 200 },
			period: 1400 - (i * 20),
			range: 1000 + (i * 20),
			bullets: [
				{ type: 'fixed', dir: 180, phase: 0 }, 
				{ type: 'fixed', dir: 240, phase: 150 }, 
				{ type: 'fixed', dir: 300, phase: 300 }
			],
		}],
		laserPeriod: 11000 - (i * 200),
		fluffPeriod: 3000 - (i * 40),
		startPos: { x: 150, y: 150 },
	}), 
	(i) => ({ // 2
		dialog: `<h2>SHAMELESS PLUG</h2>
		<p>Do you like the hexagonal music?
		</p><p>
		Follow <a href="https://twitter.com/donall">@Donall</a> on twitter!
		</p>`,
		tesselation: TESSELATIONS.TRIANGULAR.name,
		
		towers: [{
			period: 1700 - (i * 20),
			range: 1000,
			pos: { x: 150, y: SCREENH - 150 },
			bullets: [ { type: 'fixed', dir: 330, phase: 100 }, /*{ type: 'aim', phase: 300 }*/ ],
		}, {
			period: 1700 - (i * 20),
			range: 1000,
			pos: { x: SCREENW - 150, y: SCREENH - 150 },
			bullets: [ { type: 'fixed', dir: 210 }, /*{ type: 'aim', phase: 200 }*/ ],
		}], 
		laserPeriod: 10000 - (i * 200), 
		fluffPeriod: 2000 - (i * 100),
		startPos: { x: 400, y: 150},
	}), 
	(i) => ({ // 3
		dialog: `<h2>SHAMELESS PLUG</h2>
		<p>
		Do you want to know the backstory?
		</p><p>
		How did our two heroes got into this mess?
		Play <a href="https://tins.amarillion.org/entry/205/">Fole and Raul go Flower Power</a>, and find out!</p>`,
		tesselation: TESSELATIONS.CAIRO.name,
		towers: [{
			period: 1400 - (i * 20),
			range: 1000,
			pos: { x: SCREENW - 150, y: SCREENH - 150 },
			bullets: [ { type: 'aim' } ],
		}], 
		laserPeriod: 10000 - (i * 200), 
		fluffPeriod: 2000 - (i * 100),
		startPos: { x: 150, y: 150},
	}), 
	(i) => ({ // 4
		tesselation: TESSELATIONS.DIAMOND.name,
		dialog: `<h2>SHAMELESS PLUG</h2>
		<p>Did you enjoy KrampusHack?</p>
		<p>
		Join <a href="https://tins.amarillion.org/">TINS</a> this Summer, 
		an intense, 72h Game Jam by the origanizers of KrampusHack
		where you make a game as a gift for somebody else.
		</p>
		`,
		towers: [{
			period: 1400 - (i * 20),
			range: 1000,
			pos: { x: SCREENW - 150, y: SCREENH - 150 },
			bullets: [ { type: 'aim' } ],
		}], 
		laserPeriod: 10000 - (i * 200), 
		fluffPeriod: 2000 - (i * 100),
		startPos: { x: 150, y: 150},
	})
];
