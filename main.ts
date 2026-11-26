// The Robot Vacuum's Funniest Excuse
// make.fun bounty: u-eager-stork-81-9647-the-robot-vacuum-s-funniest-9822fbd2
//
// One line, at most 120 characters, in which a robot vacuum explains why
// it missed a spot. An AI judge reads entries in pairs and picks the
// funnier excuse, weighing, most important first:
//   1. The line is an excuse a robot vacuum gives for missing a spot.
//   2. It is funny at once, a real joke rather than a cute observation.
//   3. It speaks in the vacuum's own voice, a machine owning up to a failure.
//   4. Its humour comes from a vacuum's world: suction, dust, pet hair,
//      rugs, the charging dock.
//   5. It lands in a single line, needing no setup the reader has to supply.
//
// This program holds 18 original candidate one-liners, scores each one
// with a deterministic scorer that mirrors those five criteria in their
// listed order (weights 30 / 25 / 20 / 15 / 10 over 100), writes the
// winning line to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt),
// reads it back, and re-checks every gate from the brief before exiting.
//
// Node 22 stdlib only. No network, no clock, no randomness: the same
// input always produces the same output, byte for byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Gate constants, taken from the competition brief (competition.yaml).
// ---------------------------------------------------------------------------

/** Maximum characters allowed in the entry (gate: 1 to 120 characters). */
const MAX_CHARS = 120;
/** Minimum characters allowed in the entry. */
const MIN_CHARS = 1;

// ---------------------------------------------------------------------------
// The candidates: 18 original one-liners, written for this brief.
// Every line is a robot vacuum explaining, in its own voice, why it
// missed a spot. Each one is checked against the 120-character gate
// by the scorer before it can win.
// ---------------------------------------------------------------------------

const CANDIDATES: string[] = [
  // 1. The diplomatic dodge: blames the spot's feelings, not the machine.
  "I skipped that corner on purpose — it looked lonely, and I didn't want to ruin its vibe.",
  // 2. The triple excuse: everything failed at once, including courage.
  "My dustbin was full, my battery was low, and frankly that rug intimidates me.",
  // 3. The bureaucrat: the miss was filed, processed, and forgotten.
  "I mapped that spot, then filed it under 'not my problem' and went home to charge.",
  // 4. The cat did it: a classic witness-intimidation defence.
  "The cat was watching. I panicked, did a spin, and pretended the dust was invisible.",
  // 5. The crumb that fought back: surrender as a policy.
  "I tried to eat that crumb, but it fought back, so I respectfully declined.",
  // 6. The contract clause: no crawling into the dark.
  "That spot is under the sofa, and my contract says nothing about crawling into the dark.",
  // 7. The dust earned it: defeat reframed as generosity.
  "I ran out of suction halfway there and decided the dust had earned its place.",
  // 8. The haunted corner: ghosts beat sensors every time.
  "My sensors say that corner is haunted. I am not arguing with ghosts for a speck of dust.",
  // 9. The nostalgia defence: the miss was a gift to the owner.
  "I left that patch untouched so you'd remember what life was like before me.",
  // 10. The pile-up: rug, dog and dust all ganged up at once.
  "The rug grabbed my wheel, the dog grabbed my attention, and the dust won.",
  // 11. The almost-hero: three crumbs from glory, then the battery died.
  "I was three crumbs from glory when my battery hit 4% and my dignity hit zero.",
  // 12. The moving spot: an alibi with exactly one witness (itself).
  "That spot moved. I have witnesses. Well, one witness. Me.",
  // 13. Seniority: some dust outranks the machine.
  "I vacuumed around it out of respect — some dust has seniority.",
  // 14. The cliff sensor: a machine scared of its own safety feature.
  "My cliff sensor saw the rug's edge, panicked, and now we're both in therapy.",
  // 15. The clean-in-my-heart defence, immediately retracted.
  "I missed that spot because it was already clean in my heart. Mostly. Okay, it wasn't.",
  // 16. The loyal servant: the dock's call outranks the job.
  "The charging dock called me home mid-clean. I obeyed. I am a simple machine with simple needs.",
  // 17. The chair leg: twelve bumps, one surrender.
  "I bumped into the chair leg twelve times and decided that corner had won the war.",
  // 18. The dust bunny's ultimatum: eye contact, then retreat.
  "That dust bunny looked me in the eye and said 'not today.' I believed it.",
];

// ---------------------------------------------------------------------------
// Lexicons. These are small, hand-built word lists that let the scorer
// measure each criterion mechanically. They are deliberately narrow:
// a word only counts when it genuinely serves the criterion it is
// listed under, so a line cannot farm points by stuffing keywords.
// ---------------------------------------------------------------------------

/** Words that say a spot was missed, skipped, or left behind. */
const MISS_WORDS = [
  "missed",
  "skipped",
  "left",
  "untouched",
  "around it",
  "didn't",
  "not today",
  "won the war",
  "gave up",
  "declined",
  "filed it",
];

/** Words naming the spot itself: the place that stayed dirty. */
const SPOT_WORDS = [
  "spot",
  "corner",
  "patch",
  "rug",
  "crumb",
  "dust",
  "speck",
  "floor",
  "under the sofa",
  "edge",
];

/** First-person markers: the vacuum speaking as "I". */
const FIRST_PERSON_WORDS = ["i ", "i'm", "i am", "my ", "me.", "me,", "myself"];

/** Machine words: the vacuum owning up as a machine. */
const MACHINE_WORDS = [
  "sensor",
  "sensors",
  "battery",
  "suction",
  "dustbin",
  "dock",
  "wheel",
  "mapped",
  "charging",
  "spin",
  "bumped",
  "cliff sensor",
];

/** The vacuum's world: suction, dust, pet hair, rugs, the charging dock. */
const VACUUM_WORLD_WORDS = [
  "suction",
  "dust",
  "dustbin",
  "dust bunny",
  "pet hair",
  "cat",
  "dog",
  "rug",
  "charging dock",
  "dock",
  "crumb",
  "wheel",
  "sensor",
  "battery",
  "sofa",
  "chair leg",
];

/** Joke devices: turns, twists, and punchline shapes. */
const JOKE_DEVICES = [
  "but",
  "so ",
  "frankly",
  "respectfully",
  "on purpose",
  "well,",
  "okay,",
  "mostly.",
  "haunted",
  "ghosts",
  "therapy",
  "seniority",
  "won",
  "glory",
  "dignity",
  "vibe",
  "intimidates",
  "panicked",
  "fought back",
  "not my problem",
  "earned",
  "believed it",
  "witness",
  "twelve times",
  "simple machine",
  "remember what life",
];

/** Words that signal a real joke's surprise turn rather than a plain fact. */
const PUNCH_WORDS = [
  "haunted",
  "ghosts",
  "therapy",
  "seniority",
  "dignity",
  "vibe",
  "intimidates",
  "panicked",
  "fought back",
  "not my problem",
  "earned its place",
  "believed it",
  "won the war",
  "three crumbs",
  "simple needs",
  "looked lonely",
];

// ---------------------------------------------------------------------------
// Small deterministic helpers. No clock, no randomness, no I/O here:
// pure functions over the candidate text, so the score of a line is
// fixed forever.
// ---------------------------------------------------------------------------

/** Lower-case the text once so every match is case-insensitive. */
function lower(text: string): string {
  return text.toLowerCase();
}

/** Count how many distinct lexicon entries appear in the text. */
function countHits(text: string, words: string[]): number {
  const hay = lower(text);
  let hits = 0;
  for (const word of words) {
    if (hay.includes(word)) {
      hits += 1;
    }
  }
  return hits;
}

/** Count occurrences of a single word (non-overlapping, case-insensitive). */
function countWord(text: string, word: string): number {
  const hay = lower(text);
  let count = 0;
  let from = 0;
  while (true) {
    const at = hay.indexOf(word, from);
    if (at === -1) {
      break;
    }
    count += 1;
    from = at + word.length;
  }
  return count;
}

/** Split a line into sentences on . ! ? followed by a space or the end. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Count the words in a line (whitespace-separated tokens). */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((token) => token.length > 0).length;
}

/** Clamp a number into the closed interval [low, high]. */
function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}

/** Round a score to two decimal places for stable, readable output. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// The scorer. Five criteria, in the judge brief's order, weighted
// 30 / 25 / 20 / 15 / 10 over 100. Each criterion returns a value in
// [0, 1]; the weighted sum is the line's score out of 100.
// ---------------------------------------------------------------------------

export interface CriterionScores {
  /** Criterion 1 (weight 30): an excuse for missing a spot. */
  onTopic: number;
  /** Criterion 2 (weight 25): funny at once, a real joke. */
  funny: number;
  /** Criterion 3 (weight 20): the vacuum's own voice, owning the failure. */
  ownVoice: number;
  /** Criterion 4 (weight 15): humour from the vacuum's world. */
  vacuumWorld: number;
  /** Criterion 5 (weight 10): lands in a single line, no setup needed. */
  selfContained: number;
}

export interface ScoredLine {
  index: number;
  text: string;
  chars: number;
  words: number;
  criteria: CriterionScores;
  total: number;
}

/**
 * Criterion 1 — on topic (weight 30).
 * A winning line must be an excuse a robot vacuum gives for missing a
 * spot. Score from two halves: it names a miss (an excuse verb or a
 * surrender) and it names the spot (the place left dirty). A line with
 * neither half scores near zero; a line with both, and with an explicit
 * reason word ("because", "so", "when", "but"), scores near the top.
 */
function scoreOnTopic(text: string): number {
  const missHits = countHits(text, MISS_WORDS);
  const spotHits = countHits(text, SPOT_WORDS);
  const hay = lower(text);
  const hasReason =
    hay.includes("because") ||
    hay.includes(" so ") ||
    hay.includes("when ") ||
    hay.includes("but ") ||
    hay.includes("then ");
  // NOTE: " and " is deliberately NOT a reason word here: almost every
  // multi-clause line contains it, so counting it handed out a free
  // +0.1 to nearly the whole field and flattened the criterion.
  // Each half is worth 0.5; a reason word lifts the total by up to 0.1.
  const missPart = clamp(missHits / 2, 0, 1) * 0.5;
  const spotPart = clamp(spotHits / 2, 0, 1) * 0.5;
  const reasonBonus = hasReason ? 0.1 : 0;
  return clamp(missPart + spotPart + reasonBonus, 0, 1);
}

/**
 * Criterion 2 — funny at once (weight 25).
 * A real joke, not a cute observation. Score from joke devices (a twist,
 * a reversal, a personified object) plus punch words (the surprising
 * image that lands the joke), plus a small bonus when the line's final
 * clause is the punchline rather than a flat statement. A line that is
 * only a plain report of a miss scores low here even if it is on topic.
 */
function scoreFunny(text: string): number {
  const deviceHits = countHits(text, JOKE_DEVICES);
  const punchHits = countHits(text, PUNCH_WORDS);
  const sentences = splitSentences(text);
  const lastSentence = sentences.length > 0 ? sentences[sentences.length - 1] : "";
  const punchInTail = countHits(lastSentence, PUNCH_WORDS) > 0;
  const devicePart = clamp(deviceHits / 3, 0, 1) * 0.55;
  const punchPart = clamp(punchHits / 2, 0, 1) * 0.35;
  const tailBonus = punchInTail ? 0.1 : 0;
  return clamp(devicePart + punchPart + tailBonus, 0, 1);
}

/**
 * Criterion 3 — the vacuum's own voice (weight 20).
 * The line must speak as the machine, owning up to a failure. Score
 * from first-person markers ("I", "my") plus machine words (battery,
 * sensor, suction, dock), with a small bonus when the line admits the
 * failure outright ("I missed", "I skipped", "I left", "I panicked",
 * "I obeyed"). A line about a vacuum in the third person scores low.
 */
function scoreOwnVoice(text: string): number {
  const hay = lower(text);
  const firstPersonHits = countHits(text, FIRST_PERSON_WORDS);
  const machineHits = countHits(text, MACHINE_WORDS);
  const ownsFailure =
    hay.includes("i missed") ||
    hay.includes("i skipped") ||
    hay.includes("i left") ||
    hay.includes("i panicked") ||
    hay.includes("i obeyed") ||
    hay.includes("i bumped") ||
    hay.includes("i ran out") ||
    hay.includes("i tried") ||
    hay.includes("i vacuumed") ||
    hay.includes("i was ");
  const firstPersonPart = clamp(firstPersonHits / 2, 0, 1) * 0.45;
  const machinePart = clamp(machineHits / 2, 0, 1) * 0.35;
  const ownsPart = ownsFailure ? 0.2 : 0;
  return clamp(firstPersonPart + machinePart + ownsPart, 0, 1);
}

/**
 * Criterion 4 — humour from the vacuum's world (weight 15).
 * The joke should come from suction, dust, pet hair, rugs, the charging
 * dock — the machine's own life — rather than from a generic gag that
 * could belong to any appliance. Score from distinct vacuum-world words,
 * with a bonus when two different kinds of vacuum-world thing appear
 * together (for example a rug and a wheel, or a cat and a dustbin),
 * because the funniest lines collide two parts of that world.
 */
function scoreVacuumWorld(text: string): number {
  const hay = lower(text);
  const worldHits = countHits(text, VACUUM_WORLD_WORDS);
  const hasPet = hay.includes("cat") || hay.includes("dog") || hay.includes("pet hair");
  const hasHome = hay.includes("rug") || hay.includes("sofa") || hay.includes("chair leg");
  const hasMachine =
    hay.includes("suction") ||
    hay.includes("battery") ||
    hay.includes("dock") ||
    hay.includes("sensor") ||
    hay.includes("wheel") ||
    hay.includes("dustbin");
  const hasDirt =
    hay.includes("dust") ||
    hay.includes("crumb") ||
    // Word-boundary match: plain includes("hair") also fires inside
    // "chair leg", which is furniture, not dirt.
    /\bhair\b/.test(hay);
  const kinds = [hasPet, hasHome, hasMachine, hasDirt].filter(Boolean).length;
  const hitsPart = clamp(worldHits / 4, 0, 1) * 0.7;
  const kindsPart = clamp((kinds - 1) / 2, 0, 1) * 0.3;
  return clamp(hitsPart + kindsPart, 0, 1);
}

/**
 * Criterion 5 — lands in a single line (weight 10).
 * The joke must need no setup the reader has to supply. Score from
 * brevity and shape: one or two short sentences, no dangling setup,
 * no "as you know" throat-clearing. Longer lines and lines that sprawl
 * over three or more sentences lose points; a tight line that lands
 * its punch in the same breath scores near the top.
 */
function scoreSelfContained(text: string): number {
  const sentences = splitSentences(text);
  const chars = [...text].length;
  // Sentence shape: 1 sentence is ideal, 2 is fine, 3+ starts to sprawl.
  const sentencePart = sentences.length <= 1 ? 0.5 : sentences.length === 2 ? 0.4 : 0.15;
  // Length shape: the gate allows 120, but a joke that lands fast is
  // stronger; reward lines under 100 characters, taper above that.
  let lengthPart: number;
  if (chars <= 80) {
    lengthPart = 0.35;
  } else if (chars <= 100) {
    lengthPart = 0.3;
  } else if (chars <= 110) {
    lengthPart = 0.2;
  } else {
    lengthPart = 0.1;
  }
  // No setup words: penalise lines that open by explaining themselves.
  const hay = lower(text);
  const hasSetup =
    hay.startsWith("as you know") ||
    hay.startsWith("let me explain") ||
    hay.startsWith("the thing is") ||
    hay.includes("you see,");
  const setupPart = hasSetup ? 0 : 0.15;
  return clamp(sentencePart + lengthPart + setupPart, 0, 1);
}

/** Weights for the five criteria, in the judge brief's order, over 100. */
const WEIGHTS: CriterionScores = {
  onTopic: 30,
  funny: 25,
  ownVoice: 20,
  vacuumWorld: 15,
  selfContained: 10,
};

/** Score one candidate line against all five criteria. */
function scoreLine(index: number, text: string): ScoredLine {
  const criteria: CriterionScores = {
    onTopic: round2(scoreOnTopic(text)),
    funny: round2(scoreFunny(text)),
    ownVoice: round2(scoreOwnVoice(text)),
    vacuumWorld: round2(scoreVacuumWorld(text)),
    selfContained: round2(scoreSelfContained(text)),
  };
  const total = round2(
    criteria.onTopic * WEIGHTS.onTopic +
      criteria.funny * WEIGHTS.funny +
      criteria.ownVoice * WEIGHTS.ownVoice +
      criteria.vacuumWorld * WEIGHTS.vacuumWorld +
      criteria.selfContained * WEIGHTS.selfContained,
  );
  return {
    index,
    text,
    chars: [...text].length,
    words: countWords(text),
    criteria,
    total,
  };
}

// ---------------------------------------------------------------------------
// Gates. The brief's gate: /output/entry.txt must be UTF-8 text of 1 to
// 120 characters, not only white space. The program checks the winning
// line before writing it and re-checks the file after reading it back.
// ---------------------------------------------------------------------------

export interface GateResult {
  ok: boolean;
  reasons: string[];
}

/** Check a candidate text against every gate in the brief. */
function checkGates(text: string): GateResult {
  const reasons: string[] = [];
  if (typeof text !== "string") {
    reasons.push("entry is not a string");
  } else {
    const chars = [...text].length;
    if (chars < MIN_CHARS) {
      reasons.push(`entry is ${chars} characters, below the minimum of ${MIN_CHARS}`);
    }
    if (chars > MAX_CHARS) {
      reasons.push(`entry is ${chars} characters, above the maximum of ${MAX_CHARS}`);
    }
    if (text.trim().length === 0) {
      reasons.push("entry is only white space");
    }
    if (text.includes("\n") || text.includes("\r")) {
      reasons.push("entry is not a single line");
    }
    // Valid UTF-8 round-trip: encoding then decoding must reproduce it.
    const roundTripped = Buffer.from(text, "utf8").toString("utf8");
    if (roundTripped !== text) {
      reasons.push("entry is not valid UTF-8 text");
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Main: score all 18, pick the winner, write it, read it back, re-gate.
// ---------------------------------------------------------------------------

function main(): void {
  // Score every candidate, including a gate check per candidate so a
  // line that breaks the 120-character limit can never win.
  const scored: ScoredLine[] = [];
  for (let i = 0; i < CANDIDATES.length; i++) {
    const text = CANDIDATES[i]!;
    const gate = checkGates(text);
    if (!gate.ok) {
      console.error(`candidate ${i + 1} fails the gate and is skipped: ${gate.reasons.join("; ")}`);
      console.error(`  skipped line: ${text}`);
      continue;
    }
    scored.push(scoreLine(i, text));
  }

  if (scored.length === 0) {
    console.error("no candidate passed the gate; refusing to write an entry");
    process.exit(1);
  }

  // Sort by total score, highest first. Ties break toward the shorter
  // line (the brief's tie-break prefers the smaller text), then toward
  // the earlier candidate, so the result is fully deterministic.
  const ranked = [...scored].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (a.chars !== b.chars) return a.chars - b.chars;
    return a.index - b.index;
  });

  // Print the full table so the run is auditable from its own output.
  console.log("Robot Vacuum's Funniest Excuse — candidate scores (weights 30/25/20/15/10)");
  console.log("rank | score | chars | line");
  for (let rank = 0; rank < ranked.length; rank++) {
    const line = ranked[rank]!;
    console.log(
      `${String(rank + 1).padStart(2)} | ${line.total.toFixed(2).padStart(6)} | ${String(line.chars).padStart(3)} | ${line.text}`,
    );
  }
  console.log("");
  console.log("winner breakdown (on-topic / funny / own-voice / vacuum-world / self-contained):");
  const winner = ranked[0]!;
  const runnerUp = ranked[1];
  console.log(
    `  on-topic ${winner.criteria.onTopic.toFixed(2)} x30, funny ${winner.criteria.funny.toFixed(2)} x25, ` +
      `own-voice ${winner.criteria.ownVoice.toFixed(2)} x20, vacuum-world ${winner.criteria.vacuumWorld.toFixed(2)} x15, ` +
      `self-contained ${winner.criteria.selfContained.toFixed(2)} x10`,
  );
  if (runnerUp) {
    console.log(`runner-up: ${runnerUp.total.toFixed(2)} — ${runnerUp.text}`);
  }

  // Write the winning line. The output directory comes from the
  // environment the grader sets; fall back to /output/entry.txt.
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outputPath = join(outputDir, "entry.txt");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, winner.text, "utf8");
  console.log(`wrote ${outputPath} (${winner.chars} characters, score ${winner.total.toFixed(2)})`);

  // Read it back and re-check every gate from the brief.
  const readBack = readFileSync(outputPath, "utf8");
  if (readBack !== winner.text) {
    console.error("read-back mismatch: the file does not contain the winning line");
    process.exit(1);
  }
  const finalGate = checkGates(readBack);
  if (!finalGate.ok) {
    console.error(`written entry fails the gate: ${finalGate.reasons.join("; ")}`);
    process.exit(1);
  }
  console.log("gate re-check passed: 1-120 characters, single line, valid UTF-8, not only white space");
  console.log(`ENTRY: ${readBack}`);
}

main();
