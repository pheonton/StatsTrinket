# Stats Trinket - Free MTG Life Counter & Commander Damage Tracker

[![PWA](https://img.shields.io/badge/PWA-Enabled-blue)](https://statstrinket.com/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green.svg)](LICENSE)

![Stats Trinket - a four-player Commander game with commander art backgrounds, per-deck names and commander-damage tracking](public/screenshot.png)

A free, offline-capable life counter for **Magic: The Gathering**, made for
**Commander/EDH** tables, at [statstrinket.com](https://statstrinket.com/). It
tracks life, commander damage and counters for up to 6 players and keeps
statistics for every deck you play. No accounts, no ads, no analytics.

Stats Trinket is based on [Life Trinket](https://github.com/Vikeo/LifeTrinket)
by Viktor Raadberg and is developed independently.

## Features

- Life, commander damage (including partners), poison, energy, experience and
  monarch for 1 to 6 players, in layouts that face each seat
- **Deck statistics**: name each player's deck; finished games are recorded per
  deck (games, wins, losses, win rate, opponents, pod size) and can be exported
  and imported as CSV, e.g. to add a missed game
- **Commander art**: pick a commander (and partner) from a live
  [Scryfall](https://scryfall.com) search; its art becomes the player's
  background and colour. Fetched on demand, never stored.
- Life history, match score across a series, optional round timer, colour
  picker, and sharing a game via QR code
- Works offline once installed: open the site and choose "Add to Home Screen"
  (Safari) or "Install app" (Chrome)

## Usage

- **Tap** + or - for 1 life, **long press** for 10. Tap a counter to add 1,
  long press to subtract 1.
- **Swipe down** on a card or tap its cog for the **player menu**: colour,
  commander, deck, name, counters, life history, reset, forfeit, and the exit
  button, which pauses the game for **Resume** on the start menu.
- At 0 life, 21 commander damage from one commander or 10 poison, a red skull
  appears. Tapping it puts the player out: their card ignores taps until they
  return with the red skull in their player menu.
- With one player left, the **end screen** offers **Start Game N** (count the
  win, next game in the series), **Back to Game** (count nothing; a trophy on
  the winner's card reopens it) and **Leave Game** (count the win, back to the
  start menu). **Save to deck stats** decides whether the game is recorded.

Known issue: player colours can't be changed in Firefox on mobile.

## Development

React 19, TypeScript, Tailwind CSS v4, Vite and vite-plugin-pwa; state lives in
React context and localStorage. Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm run dev      # development server
pnpm run lint
pnpm run test
pnpm run build    # production build in dist/
```

Every push to `main` deploys to Cloudflare Pages, and `pnpm run release` tags a
new version. See [CLAUDE.md](CLAUDE.md) for the architecture.

## License

[GNU Affero General Public License v3.0](LICENSE). Under its network-use clause,
a publicly hosted modified version must make its complete source available;
this public repository satisfies that. The AGPL covers the source code. Card
artwork visible in screenshots is © Wizards of the Coast and its artists, used
under the Fan Content Policy, and is not covered by the AGPL.

Stats Trinket is unofficial Fan Content permitted under the
[Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy). Not
approved or endorsed by Wizards. Card images and artwork are © Wizards of the
Coast and the credited illustrators.

## Acknowledgments

- [Viktor Raadberg](https://github.com/Vikeo), creator of the original
  [Life Trinket](https://github.com/Vikeo/LifeTrinket)
- [Scryfall](https://scryfall.com) for the card search and art
- The Magic: The Gathering and Commander/EDH community
