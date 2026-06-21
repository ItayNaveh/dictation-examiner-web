import * as player from "./player.js";
import { sleep } from "./player.js";

let __iota = 0;
const iota = (reset?: boolean) => reset ? (__iota = 0, __iota++) : __iota++;

const assert = (b: boolean) => { if (!b) throw new Error("Assertion failed") };
const assert_eq = <T>(a: T, b: T) => { if (a != b) throw new Error(`Assertion failed: ${a} != ${b}`) };

type Interval = number;
const Interval = {
	p1: iota(true),
	m2: iota(), M2: iota(),
	m3: iota(), M3: iota(),
	p4: iota(), Tr: iota(), p5: iota(),
	m6: iota(), M6: iota(),
	m7: iota(), M7: iota(),
	p8: iota(),
	m9: iota(), M9: iota(),
	m10: iota(), M10: iota(),

	_Count: iota(),
};

type ChordQuality = "Major" | "Minor" | "Diminished" | "Augmented";
// enum ChordQuality { Major, Minor, Diminished, Augmented }
type Seventh = "Minor" | "Major" | "Diminished";

type Inversion = "Root" |
	"_6_3" | "_64" | // only for triads
	"_65_3" | "_6_43" | "_6_42"; // only for 7s

type Scale = "Major" |
	"NaturalMinor" | "HarmonicMinor" | "MelodicMinor" |
	"Dorian" | "Phrygian" | "Lydian" | "Mixolydian" | "Locrian";

// interface Question {
// 	kind: "Interval" | "Chord" | "Scale",
// 	root: number,
// 	data: [Interval, boolean] | [ChordQuality, Seventh | null, Inversion] | Scale,
// }
type Question =
	{ kind: "Interval", anchor: number, interval: Interval, is_up: boolean } |
	{ kind: "Chord", root: number, quality: ChordQuality, seventh: Seventh | null, inversion: Inversion } |
	{ kind: "Scale", root: number, scale: Scale };

function interval_display(i: Interval) {
	if (i == Interval.m2) return "-2";
	if (i == Interval.M2) return "+2";
	if (i == Interval.m3) return "-3";
	if (i == Interval.M3) return "+3";
	if (i == Interval.p4) return "p4";
	if (i == Interval.Tr) return "Tr";
	if (i == Interval.p5) return "p5";
	if (i == Interval.m6) return "-6";
	if (i == Interval.M6) return "+6";
	if (i == Interval.m7) return "-7";
	if (i == Interval.M7) return "+7";
	if (i == Interval.p8) return "p8";
	if (i == Interval.m9) return "-9";
	if (i == Interval.M9) return "+9";
	if (i == Interval.m10) return "-10";
	if (i == Interval.M10) return "+10";
	throw new Error("unknown interval " + i);
}

function interval_try_from_str(s: string): Interval | null {
	if (s == "-2") return Interval.m2;
	if (s == "+2") return Interval.M2;
	if (s == "-3") return Interval.m3;
	if (s == "+3") return Interval.M3;
	if (s == "p4") return Interval.p4;
	if (s == "Tr") return Interval.Tr;
	if (s == "p5") return Interval.p5;
	if (s == "-6") return Interval.m6;
	if (s == "+6") return Interval.M6;
	if (s == "-7") return Interval.m7;
	if (s == "+7") return Interval.M7;
	if (s == "p8") return Interval.p8;
	if (s == "-9") return Interval.m9;
	if (s == "+9") return Interval.M9;
	if (s == "-10") return Interval.m10;
	if (s == "+10") return Interval.M10;
	return null;
}

function chordquality_display(q: ChordQuality) {
	if (q == "Major") return "M";
	if (q == "Minor") return "m";
	if (q == "Diminished") return "o";
	if (q == "Augmented") return "+";
}

function chordquality_try_from_str(s: string): ChordQuality | null {
	if (s == "M") return "Major";
	if (s == "m") return "Minor";
	if (s == "o") return "Diminished";
	if (s == "+") return "Augmented";
	return null;
}

function seventh_display(s: Seventh) {
	if (s == "Major") return "M";
	if (s == "Minor") return "m";
	if (s == "Diminished") return "o";
}

function inversion_display(i: Inversion) {
	// https://symbl.cc/en/unicode/blocks/superscripts-and-subscripts/
	// ⁷ ⁶ ⁴ ₂ ₃ ₄ ₅  ²
	if (i == "Root") return "";
	if (i == "_6_3") return "6";
	if (i == "_64") return "64";
	if (i == "_65_3") return "65";
	if (i == "_6_43") return "43";
	if (i == "_6_42") return "42";
}

function inversion_try_from_str(s: string): Inversion | null {
	if (s == "6") return "_6_3";
	if (s == "64") return "_64";
	if (s == "65") return "_65_3";
	if (s == "43") return "_6_43";
	if (s == "42") return "_6_42";
	return null;
}

function scale_display(s: Scale) {
	if (s == "Major") return "major";
	if (s == "NaturalMinor") return "natural minor";
	if (s == "HarmonicMinor") return "harmonic minor";
	if (s == "MelodicMinor") return "melodic minor";
	if (s == "Dorian") return "dorian";
	if (s == "Phrygian") return "phrygian";
	if (s == "Lydian") return "lydian";
	if (s == "Mixolydian") return "mixolydian";
	if (s == "Locrian") return "locrian";
}

function scale_try_from_str(s: string): Scale | null {
	if (s == "maj" || s == "major") return "Major";
	if (s == "nat" || s == "natural" || s == "min" || s == "minor") return "NaturalMinor";
	if (s == "harm" || s == "harmonic") return "HarmonicMinor";
	if (s == "mel" || s == "melodic") return "MelodicMinor";
	if (s == "dor" || s == "dorian") return "Dorian";
	if (s == "phr" || s == "phrygian") return "Phrygian";
	if (s == "lyd" || s == "lydian") return "Lydian";
	if (s == "mix" || s == "mixolydian") return "Mixolydian";
	if (s == "loc" || s == "locrian") return "Locrian";
	return null;
}

function question_display(q: Question) {
	if (q.kind == "Interval") return `${interval_display(q.interval)} ${q.is_up ? "up" : "down"}`;
	if (q.kind == "Chord" && q.seventh == null) return `${chordquality_display(q.quality)} ${inversion_display(q.inversion)}`;
	if (q.kind == "Chord") return `${chordquality_display(q.quality)}${seventh_display(q.seventh!)} ${inversion_display(q.inversion)}`;
	if (q.kind == "Scale") return scale_display(q.scale);
}

/*
impl rand::distributions::Distribution<Interval> for rand::distributions::Standard {
	fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> Interval {
		unsafe { std::mem::transmute::<u8, Interval>(rng.gen_range(1..Interval::_Count as usize) as u8) }
	}
}

impl rand::distributions::Distribution<ChordQuality> for rand::distributions::Standard {
	fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> ChordQuality {
		unsafe { std::mem::transmute::<u8, ChordQuality>(rng.gen_range(0..ChordQuality::_Count as usize) as u8) }
	}
}

impl rand::distributions::Distribution<Scale> for rand::distributions::Standard {
	fn sample<R: rand::Rng + ?Sized>(&self, rng: &mut R) -> Scale {
		unsafe { std::mem::transmute::<u8, Scale>(rng.gen_range(0..Scale::_Count as usize) as u8) }
	}
}
*/

const C4 = 60;
const C3 = C4 - 12;
const G4 = C4 + Interval.p5;
const C5 = C4 + 12;

const config = {
	question_count: 10,
	
	interval_anchor_start: C3,
	interval_anchor_end: G4,
	chord_root_start: C3,
	chord_root_end: G4,
	scale_root_start: C3,
	scale_root_end: C4,
	
	all_chords_7th_chance: 0.75,
	
	play_interval_for: 1500,
	play_chord_for: 1500,
	play_scale_note_for: 150,
	
	midi_velocity: 50,
};

interface State {
	preset: string,
	qi: number,
	question: Question | null,
	log: { question: Question, answer: string, is_correct: boolean }[],
	finished: boolean,
	just_finished: boolean,
}

export function init(state: State): string {
	state.qi = 0;
	state.log = [];
	state.finished = false;
	state.just_finished = false;

	const out = ["Presets:"];
	for (const p of PRESETS) out.push("\t- " + p);
	out.push("");
	return out.join("<br/>");
}

export async function handleLine(state: State, line: string): Promise<string> {
	if (!state.preset) {
		line = line.trim();
		if (PRESETS.includes(line)) state.preset = line;
		else return `Unknown input: |${line}|<br/>`;
	}

	if (!state.just_finished && !state.finished) {
		if (!state.question) {
			state.question = choose_question(state.preset);
			await play_question(state.question);
			return `(${state.qi + 1}) What to do (again, quit)?<br/>`;
		} else {
			line = line.trim();
			if (line == "") return "";
			if (line == "again" || line == "a") { await play_question(state.question); return ""; }
			if (line == "quit" || line == "q") { state.question = null; state.just_finished = true; return "Finishing test early!<br/>" + await handleLine(state, ""); }
			const result = try_check_answer(state.question, line);
			if (result == null) return `Unknown input: |${line}|<br/>`;
			state.log.push({ question: state.question, answer: line, is_correct: result });
			state.question = null;
			state.qi += 1;
			if (state.qi >= config.question_count) state.just_finished = true;
			return await handleLine(state, "");
		}
	} else {
		if (state.just_finished) {
			state.just_finished = false;
			state.finished = true;

			let out = `<br/>==========<br/>You got ${state.log.filter(e => e.is_correct).length} / ${state.log.length}<br/>==========<br/>`;
			out += "    You   Answer<br/>";
			state.log.forEach((e, i) => {
				const color = e.is_correct ? "green" : "red";
				// TODO: alignment
				out += `${i + 1}. <span style="color: ${color}">${e.answer}    ${question_display(e.question)}</span><br/>`;
			});
			out += "<br/>What to do (quit, #)?<br/>";
			return out;
		}
		
		line = line.trim();
		if (line == "") return "";
		if (line == "quit" || line == "q") throw new Error("todo");

		const qn = Number(line) - 1;
		if (isNaN(qn)) return `Unknown input: |${line}|<br/>`;
		if (qn >= state.log.length) return "Question number invalid<br/>";
		await play_question(state.log[qn].question);
		return "";
	}
}


const gen_range_exclusive = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));
const gen_range_inclusive = (min: number, max: number) => gen_range_exclusive(min, max + 1);

function choose_from_arr<T>(arr: T[]): T {
	return arr[gen_range_exclusive(0, arr.length)];
}

function choose_seventh_by_quality(quality: ChordQuality): Seventh {
	if (quality == "Major" || quality == "Minor") return choose_from_arr(["Minor", "Major"]);
	if (quality == "Diminished") return choose_from_arr(["Minor", "Diminished"]);
	if (quality == "Augmented") return "Major";
	throw new Error("unreachable");
}

const PRESETS = [
	"Intervals",
	"Triads", "InvertedTriads", "SevenChords", "InvertedSevenChords", "AllChords",
	"BasicScales", "MinorModes", "MajorModes", "AllModes",

	"MajMix",
];

function choose_question(preset: string): Question {
	assert_eq(PRESETS.length, 11);

	if (preset == "Intervals") return {
		kind: "Interval",
		anchor: gen_range_inclusive(config.interval_anchor_start, config.interval_anchor_end),
		interval: gen_range_inclusive(Interval.m2, Interval.M10),
		is_up: Math.random() > 0.5,
	};

	if (preset == "Triads") return {
		kind: "Chord",
		root: gen_range_inclusive(config.chord_root_start, config.chord_root_end),
		quality: choose_from_arr(["Major", "Minor", "Diminished", "Augmented"]),
		seventh: null,
		inversion: "Root",
	};

	if (preset == "InvertedTriads") return {
		kind: "Chord",
		root: gen_range_inclusive(config.chord_root_start, config.chord_root_end),
		quality: choose_from_arr(["Major", "Minor", "Diminished", "Augmented"]),
		seventh: null,
		inversion: choose_from_arr(["Root", "_6_3", "_64"]),
	};

	if (preset == "SevenChords") {
		const quality = choose_from_arr<ChordQuality>(["Major", "Minor", "Diminished", "Augmented"]);
		return {
			kind: "Chord",
			root: gen_range_inclusive(config.chord_root_start, config.chord_root_end),
			quality,
			seventh: choose_seventh_by_quality(quality),
			inversion: "Root",
		};
	}

	if (preset == "InvertedSevenChords") {
		const quality = choose_from_arr<ChordQuality>(["Major", "Minor", "Diminished", "Augmented"]);
		return {
			kind: "Chord",
			root: gen_range_inclusive(config.chord_root_start, config.chord_root_end),
			quality,
			seventh: choose_seventh_by_quality(quality),
			inversion: choose_from_arr(["Root", "_65_3", "_6_43", "_6_42"]),
		};
	}

	if (preset == "AllChords") {
		const quality = choose_from_arr<ChordQuality>(["Major", "Minor", "Diminished", "Augmented"]);
		const [seventh, inversion] = Math.random() < config.all_chords_7th_chance ?
			[choose_seventh_by_quality(quality), choose_from_arr<Inversion>(["Root", "_65_3", "_6_43", "_6_42"])] :
			[null,                               choose_from_arr<Inversion>(["Root", "_6_3", "_64"])];
		return {
			kind: "Chord",
			root: gen_range_inclusive(config.chord_root_start, config.chord_root_end),
			quality, seventh, inversion,
		};
	}

	if (preset == "BasicScales") return {
		kind: "Scale",
		root: gen_range_inclusive(config.scale_root_start, config.scale_root_end),
		scale: choose_from_arr(["Major", "NaturalMinor", "HarmonicMinor", "MelodicMinor"]),
	};

	if (preset == "MinorModes") return {
		kind: "Scale",
		root: gen_range_inclusive(config.scale_root_start, config.scale_root_end),
		scale: choose_from_arr(["NaturalMinor", "HarmonicMinor", "MelodicMinor", "Dorian", "Phrygian", "Locrian"]),
	};

	if (preset == "MajorModes") return {
		kind: "Scale",
		root: gen_range_inclusive(config.scale_root_start, config.scale_root_end),
		scale: choose_from_arr(["Major", "Lydian", "Mixolydian"]),
	};

	if (preset == "AllModes") return {
		kind: "Scale",
		root: gen_range_inclusive(config.scale_root_start, config.scale_root_end),
		scale: choose_from_arr([
			"Major", "NaturalMinor", "HarmonicMinor", "MelodicMinor",
			"Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"
		]),
	};

	if (preset == "MajMix") return {
		kind: "Scale",
		root: gen_range_inclusive(config.scale_root_start, config.scale_root_end),
		scale: choose_from_arr(["Major", "Mixolydian"]),
	};

	throw new Error("unreachable: unknown preset " + preset);
}

const play_note_for = (note: number, ms: number) => player.play_for(note, ms);
async function play_notes_for(notes: number[], ms: number) {
	await Promise.all(notes.map(n => player.precache_for_note(n)));
	await Promise.all(notes.map(n => player.play_for(n, ms)));
}

async function play_question(question: Question) {
	if (question.kind == "Interval") {
		const other = question.anchor + (question.interval * (question.is_up ? 1 : -1));
		await play_note_for(question.anchor, config.play_interval_for);
		await sleep(100);
		await play_notes_for([question.anchor, other], config.play_interval_for);
	}

	if (question.kind == "Chord") {
		// Sanity assertions
		if (question.seventh) {
			assert(["Root", "_65_3", "_6_43", "_6_42"].includes(question.inversion));
			if (question.quality == "Diminished") assert(["Diminished", "Minor"].includes(question.seventh));
			if (question.quality == "Major" || question.quality == "Minor") assert(["Minor", "Major"].includes(question.seventh));
			if (question.quality == "Augmented") assert_eq<Seventh>(question.seventh, "Major");
		} else {
			assert(["Root", "_6_3", "_64"].includes(question.inversion));
		}
		

		let chord = (() => {
			if (question.quality == "Major") return [question.root, question.root + Interval.M3, question.root + Interval.p5];
			if (question.quality == "Minor") return [question.root, question.root + Interval.m3, question.root + Interval.p5];
			if (question.quality == "Diminished") return [question.root, question.root + Interval.m3, question.root + Interval.Tr];
			if (question.quality == "Augmented") return [question.root, question.root + Interval.M3, question.root + Interval.m6];
			throw new Error("unreachable");
		})();

		if (question.seventh == "Diminished") chord.push(question.root + Interval.M6);
		if (question.seventh == "Minor") chord.push(question.root + Interval.m7);
		if (question.seventh == "Major") chord.push(question.root + Interval.M7);

		let inversion_count = (() => {
			if (question.inversion == "Root") return 0;
			if (question.inversion == "_6_3" || question.inversion == "_65_3") return 1;
			if (question.inversion == "_64" || question.inversion == "_6_43") return 2;
			if (question.inversion == "_6_42") return 3;
			throw new Error("unreachable");
		})();

		for (let i = 0; i < inversion_count; i++) {
			const n = chord.shift()!;
			chord.push(n + Interval.p8); // TODO: be possible to generate 64 chords that are lower
		}
		
		await play_note_for(chord[0], config.play_interval_for);
		await sleep(100);
		await play_notes_for(chord, config.play_chord_for);
	};

	if (question.kind == "Scale") {
		if (question.scale != "MelodicMinor") {
			const notes = [question.root];
			let scale_step_pattern = (() => {
				if (question.scale == "Major")         return [1., 1., 0.5, 1., 1., 1., 0.5];
				if (question.scale == "NaturalMinor")  return [1., 0.5, 1., 1., 0.5, 1., 1.];
				if (question.scale == "HarmonicMinor") return [1., 0.5, 1., 1., 0.5, 1.5, 0.5];

				if (question.scale == "Dorian")     return [1., 0.5, 1., 1., 1., 0.5, 1.];
				if (question.scale == "Phrygian")   return [0.5, 1., 1., 1., 0.5, 1., 1.];
				if (question.scale == "Lydian")     return [1., 1., 1., 0.5, 1., 1., 0.5];
				if (question.scale == "Mixolydian") return [1., 1., 0.5, 1., 1., 0.5, 1.];
				if (question.scale == "Locrian")    return [0.5, 1., 1., 0.5, 1., 1., 1.];

				throw new Error("unreachable");
			})();

			for (const step of scale_step_pattern) {
				const semitones = (() => { if (step == 0.5) return 1; if (step == 1.0) return 2; if (step == 1.5) return 3; throw new Error("unreachable"); })();
				notes.push(notes[notes.length - 1] + semitones);
			}

			await Promise.all(notes.map(n => player.precache_for_note(n)));

			for (const n of notes) {
				await play_note_for(n, config.play_scale_note_for);
			}

			// for (const n of notes.iter().rev().skip(1)) {
			for (let i = notes.length - 2; i >= 0; i--) {
				await play_note_for(notes[i], config.play_scale_note_for);
			}
		} else {
			const asc = [1., 0.5, 1., 1., 1., 1., 0.5];
			const des = [1., 0.5, 1., 1., 0.5, 1., 1.]; // NaturalMinor
			const asc_notes = [question.root];
			const des_notes = [question.root];

			for (const step of asc) {
				let semitones = (() => { if (step == 0.5) return 1; if (step == 1.0) return 2; throw new Error("unreachable"); })();
				asc_notes.push(asc_notes[asc_notes.length - 1] + semitones);
			}

			for (const step of des) {
				let semitones = (() => { if (step == 0.5) return 1; if (step == 1.0) return 2; throw new Error("unreachable"); })();
				des_notes.push(des_notes[des_notes.length - 1] + semitones);
			}

			await Promise.all([...new Set([asc_notes, des_notes].flat())].map(n => player.precache_for_note(n)));

			for (const n of asc_notes) {
				await play_note_for(n, config.play_scale_note_for);
			}

			// for n in des_notes.iter().rev().skip(1) {
			for (let i = des_notes.length - 2; i >= 0; i--) {
				await play_note_for(des_notes[i], config.play_scale_note_for);
			}
		}
	}
}

function try_check_answer(question: Question, answer: string): boolean | null {
	if (question.kind == "Interval") {
		const spaceindex = answer.indexOf(" ");
		if (spaceindex < 0) return null;
		const [intstr, dirstr] = [answer.slice(0, spaceindex), answer.slice(spaceindex + 1)];
		const int = interval_try_from_str(intstr);
		if (int == null) return null;
		const dir = (dirstr == "up" || dirstr == "u") ? true : ((dirstr == "down" || dirstr == "d") ? false : null);
		if (dir == null) return null;

		return int == question.interval && dir == question.is_up;
	}

	if (question.kind == "Chord") {
		const spaceindex = answer.indexOf(" ");
		const [part1, part2] = spaceindex < 0 ? [answer, null] : [answer.slice(0, spaceindex), answer.slice(spaceindex + 1)];

		const qletter = part1[0];
		const q = (() => {
			if (qletter == 'M') return "Major";
			if (qletter == 'm') return "Minor";
			if (qletter == 'o') return "Diminished";
			if (qletter == '+') return "Augmented";
			return null;
		})();
		if (q == null) return null;

		let s: Seventh | null = null;
		if (part1.length > 1) {
			const seventh_letter = part1[1];
			s = (() => {
				if (seventh_letter == 'm') return "Minor";
				if (seventh_letter == 'M') return "Major";
				if (seventh_letter == 'o') return "Diminished";
				return null;
			})();
			if (s == null) return null;
		}

		let inv: Inversion | null = null;
		if (part2) {
			inv = inversion_try_from_str(part2);
			if (inv == null) return null;
		} else {
			inv = "Root";
		}

		return q == question.quality && s == question.seventh && inv == question.inversion;
	}

	if (question.kind == "Scale") {
		const s = scale_try_from_str(answer);
		if (s == null) return null;
		return s == question.scale;
	}

	throw new Error("unreachable");
}
