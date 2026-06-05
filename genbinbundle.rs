// Salamander taken from: https://github.com/Tonejs/audio/tree/master/salamander

use std::fs;

fn main() {
	let dir = fs::read_dir("./salamander").unwrap();
	let mut list = Vec::new();

	for f in dir {
		let f = f.unwrap();

		let filename = f.file_name().into_string().unwrap();
		let octaveindex = filename.bytes().position(|c| c.is_ascii_digit()).unwrap();
		let octave = filename.as_bytes()[octaveindex] - b'0';
		let note_name = &filename[0..octaveindex];
		let note_value = match note_name {
			"C" => 0, "A" => 9,
			"Ds" => 3, "Fs" => 6,
			_ => unreachable!(),
		} + ((octave + 1) * 12);

		list.push((note_value, f.path()));
	}

	list.sort_by_key(|x| x.0);

	let mut bin = Vec::new();
	let index = list.into_iter().map(|(note_value, path)| {
		let ret = (note_value, bin.len());
		bin.extend_from_slice(&fs::read(path).unwrap());
		ret
	}).collect::<Vec<_>>();

	let mut indexjson = "[\n".to_string();
	for (n, p) in index {
		indexjson += &format!("[{n}, {p}],\n");
	}
	indexjson += &format!("[\"EOS\", {}]\n", bin.len());
	indexjson += "]";

	fs::write("salindex.json", indexjson).unwrap();
	fs::write("public/salbin.bin", bin).unwrap();
}
