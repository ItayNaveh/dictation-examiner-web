import _bundle_index from "./salindex.json";

/** @type {AudioContext} */ let ctx;
/** @type {[number | string, number][]} */ let bundle_index = _bundle_index;
/** @type {ArrayBuffer} */ let bundle;
const decoded_cache = {};

export async function init() {
	bundle = await (await fetch("/salbin.bin")).arrayBuffer();
	ctx = new AudioContext();
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function play_for(midi_note_value, ms) {
	const { src, gain } = await play(midi_note_value);
	// src.stop(ctx.currentTime + (ms / 1000));
	await sleep(ms);
	const release_time = 350;
	gain.gain.linearRampToValueAtTime(0, ctx.currentTime + (release_time / 1000));
	setTimeout(() => src.stop(), release_time + 150);

	// await promisesrcend(src);
}

const promisesrcend = src => new Promise(resolve => { src.onended = resolve });

export async function play_until_end(midi_note_value) {
	await promisesrcend(await play(midi_note_value).src);
}

export async function precache_for_note(midi_note_value) {
	const closesti = find_closest_in_index_to(midi_note_value);
	if (!decoded_cache[closesti]) {
		console.log("Precaching", closesti);
		const bundle_pos = bundle_index[closesti][1];
		const bundle_end = bundle_index[closesti + 1][1];
		const decoded_audio = await ctx.decodeAudioData(bundle.slice(bundle_pos, bundle_end));
		decoded_cache[closesti] = decoded_audio;
	}
}

const find_closest_in_index_to =
	n => bundle_index.slice(0, -1).reduce((acc, v, i, arr) => Math.abs(n - v[0]) < Math.abs(n - arr[acc][0]) ? i : acc, 0);

async function play(midi_note_value) {
	const closesti = find_closest_in_index_to(midi_note_value);
	const semitransp = midi_note_value - bundle_index[closesti][0];
	// console.log(`playing ${midi_note_value} using ${bundle_index[closesti][0]} transposed ${semitransp}`);

	if (!decoded_cache[closesti]) {
		console.log("Decoding right before playing", closesti);
		const bundle_pos = bundle_index[closesti][1];
		const bundle_end = bundle_index[closesti + 1][1];
		const decoded_audio = await ctx.decodeAudioData(bundle.slice(bundle_pos, bundle_end));
		decoded_cache[closesti] = decoded_audio;
	}

	const src = ctx.createBufferSource();
	src.buffer = decoded_cache[closesti];
	// If more sophisticated pitch shifting is needed
	// https://github.com/Tonejs/Tone.js/blob/dev/Tone/effect/PitchShift.ts
	// if (semitransp != 0) src.playbackRate.value = Math.pow(2, semitransp / 12);
	if (semitransp != 0) src.detune.value = semitransp * 100;

	const gain = new GainNode(ctx);
	src.connect(gain);
	gain.connect(ctx.destination);
	src.start();
	return { src, gain };
}
