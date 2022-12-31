# Fight the fluff

# KrampusHack '22

This adaption was created for KrampusHack 2022 by Amarillion. See below for credits of the original game.

This submission was created for Jomp. Happy Holidays Jomp!

Jomp wished for a Tower Defence game. But, turning this around, I created a __reverse__ tower defence game. In actual fact, you have to attack a tower, using exploding bananas.

Here are some of the features that have been added:
* Sound effects.
* Defensive towers that shoot canonballs, targetting rockets and lasers.
* Tiles can be picked up and moved.
* More graphics.

Unfortunately, due to time constraint I didn't manage to add additional tesselation types, that will have to wait for some future game jam. Also, there are still a few outstanding bugs that I unfortunately haven't found the time to fix.

See also the [KrampusHack submission page](https://tins.amarillion.org/entry/277/)

This is an extension of our TINS 2021 entry, see below for more information about that.

# Play online

Open this link to [play online](https://amarillion.github.io/fight-the-fluff/) (latest version)

(Use the QR code in the title screen to play on your iPad or cell phone)

# How to play

Create a path by dragging tiles from the space ship.
You can click the L + R buttons (before dragging) to rotate a tile.

The exploding bananas will appear from the space ship, and move along the path you created.
If they reach a tower, they explode and deal damage. The goal of each level is to destroy all the towers, using the exploding bananas.

Create a path, but be careful that the fluffs don't sabotage it.
If the fluffs get too annoying, DRAG them away.

The fluffs employ a powerful laser, that occasionally scorches a tile. These tiles are useless, but you can
still get rid of them by dragging a fluff on top.

Each level has a different geometry.

The sequence of levels loops around with ever increasing difficulty. How far can you reach?

# Source code

You can find all the sources at https://github.com/amarillion/fight-the-fluff

# Tins '21

Originally this was an entry for the TINS 2021 Game Jam, by Amarillion (code), OliviaGS (art) and Donall (music)

* See the [TINS21 submission](https://tins.amarillion.org/entry/228/)
* You can still play the original [TINS21 submission](https://amarillion.github.io/tins21/dist/).

## Implementation of the TINS '21 rules

The last-minute special requirements for TINS 2021 were implemented as follows:

```
genre rule #143: Humoristic/Funny. Make the player laugh out loud at least once by funny situations, dialogue, or anything else in your game. 
```

Our pitiful attempt at humour is mostly based on the setting of the game. Two adventurers traveling through space. Their most precious cargo is bananas, for some reason. And they are obstructed by... harmless bunnies. We hope that the bouncing sprites and the quirky music add to this effect.

```
artistical rule #147: Inspired by MC Escher
```

MC Escher is more than just impossible objects. Escher's art was inspired by symmetry and unusual geometries. Escher took a particular interest in tiling patterns. Not just square tiles, but hexagonal, diamond shaped, pentagonal, ...

I based this game on MC Escher's interest in tiling patterns. This game has 5 different ones to discover. And let me assure you, basing a game on pentagonal tiling is not making things easier for the programmer...

```
artistical rule #94: The game should contain a plug for another program or thing you made.
```

The game plugs various aspects of our work in between levels. Any ideas we had for more interesting ways to hide these plugs were abandoned due to time pressure.

```
technical rule #113: Hexagonal - something in the game must be hexagonal
```

One of the levels is based on hexagonal tiling. Also, if you notice, the music is written in 6/8 time.

```
bonus rule #13: Test of Might - you may skip another rule if your code contains automated test coverage
```

I did write some unit tests in jest, to fix some hard bugs related to tile rotation. But I don't really want to skip any of the other rules.

# Tech stack and code re-use

Our tech stack is: TypeScript, Phaser 3, webpack for bundling, and jest for unit testing.

This game is mostly written from scratch, but I did re-use some code snippets from a few previous game jam entries. For example, the dialog system comes from [ldjam46](https://github.com/amarillion/ldjam46/),
and the menu comes from [ldjam47](https://github.com/amarillion/ldjam47/)

I've also depended on my own path finding node module, [helixgraph](https://amarillion.github.io/helixgraph/)

# How to build from scratch

To build this game, install the latest version of npm (7 or higher)

```
npm install
npm run build
```

You can now serve the 'dist' folder with your favorite http server, for example:

```
npx http-server dist
```

And point your browser to http://localhost:8080