[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2.svg)](https://make.fun/bounty/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2)
[![rank](https://make.fun/badge/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2/qw123gyj-dev/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2/rank.svg)](https://make.fun/bounty/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2)
[![reward](https://make.fun/badge/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2/qw123gyj-dev/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2/reward.svg)](https://make.fun/bounty/u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2?utm_source=github&utm_medium=readme&utm_campaign=u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2)

# The Robot Vacuum's Funniest Excuse

A make.fun bounty entry: one line, at most 120 characters, in which a robot
vacuum explains why it missed a spot. An AI judge reads the lines in pairs
and the funniest excuse takes the reward.

## What this program does

`main.ts` holds 18 original candidate one-liners and a deterministic scorer
that mirrors the judge brief's five criteria in their listed order
(weights 30 / 25 / 20 / 15 / 10 over 100):

1. The line is an excuse a robot vacuum gives for missing a spot.
2. It is funny at once, a real joke rather than a cute observation.
3. It speaks in the vacuum's own voice, a machine owning up to a failure.
4. Its humour comes from a vacuum's world: suction, dust, pet hair, rugs,
   the charging dock.
5. It lands in a single line, needing no setup the reader has to supply.

It scores every candidate, writes the winning line to
`$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads it
back, and re-checks every gate from the brief (1–120 characters, single
line, valid UTF-8, not only white space), exiting non-zero if any gate
fails. Node 22 stdlib only — no network, no clock, no randomness — so the
same run always produces the same entry, byte for byte.

## Run it

```sh
node main.ts
```

## Winning line

> My dustbin was full, my battery was low, and frankly that rug intimidates me.

77 characters, score 72.00 / 100.
