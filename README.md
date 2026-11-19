# Vice City Platinum Path — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rangerkit/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rangerkit/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built as an entry for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Full tracker** — every one of the 55 official trophies with its official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), a checklist saved in your browser (localStorage), and progress by count, percent and grade.
- **Export / import** — save your progress to a JSON file and bring it back on any machine.
- **Filters & search** — by kind (story, missable, collectibles, activities, online), grade and status, plus text search.
- **Spoiler shield** — hides the names and descriptions of unearned story trophies until you earn them.
- **Roadmap to the platinum** — six ordered stages built from the official trophy descriptions, with per-stage progress.
- **Missables flagged** — the 5 trophies that can be missed, each with the point of no return explained.
- **A guide for every trophy** — in our own words: what to do, where and how, and when it can be missed, each citing its sources (PlayStation Network, Exophase, PSNProfiles).

## Run it

The guide is static files under `app/` and works fully offline. Serve the folder with any static server, for example:

```
node serve.ts
```

then open http://localhost:8080 in a desktop browser. Or hand the entry in the way the grader does:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

which copies `app/` and `screenshots/` to the output directory and writes its `dossier.json`.

## Layout

- `app/index.html`, `app/js/` (tracker, rendering, store), `app/style.css` — the guide itself
- `app/data/trophies.json` — the official trophy list with a guide and sources for each trophy
- `screenshots/` — renders of the guide
- `main.ts` — the hand-in program; `vendor/makefun-frontend.ts` — the kit's dossier library

MIT licensed. No Rockstar Games artwork or logos; the look is our own.
