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
All they have to now, is load up their precious cargo.
The flowers are already in the ship...
</p>
<p>
They are ready to move a load of bananas.
But wait, what's that?
</p>
<p>
There are indiginous life forms here.
They are fluffy.
And they sure love bananas!
</p>
<h2>How to play</h2>
DRAG your tile from the TOP-RIGHT corner.
ROTATE before you drag, by clicking the L or R buttons.
Create a path, but be careful that the fluffs don't sabotage it.
If the fluffs get too annoying, DRAG them away.
`,
		tesselation: TESSELATIONS.SQUARE.name,
		towers: [{ 
			pos: { x: SCREENW - 150, y: SCREENH - 150 },
			period: 1400 - (i * 20),
			range: 1200 + (i * 20),
			bullets: [ { type: 'fixed', 'dir': 270 }, { type: 'fixed', 'dir': 180 } ],
		}],
		laserPeriod: 12000 - (i * 200),
		fluffPeriod: 4000 - (i * 50),
		startPos: { x: 150, y: 150},
	}), 
	(i) => ({ // 1
		dialog: `
<h2>Intermission</h2>
<p>
Boy, the geometry of this place is weird, isn't it?
It reminds me of someone...
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
		<p>Did you enjoy TINS?</p>
		<p>
		Join <a href="https://tins.amarillion.org/">KrampusHack</a> this December, 
		a relaxed, secret-santa-style Game Jam by the origanizers of TINS
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
