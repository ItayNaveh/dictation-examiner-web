/** @type {import("vite").UserConfig} */
export default {
	base: "/dictation-examiner-web",
	assetsInclude: ["**/*.bin"],
	build: {
		// modulePreload: { polyfill: false },
		assetsDir: "",
	},
};
