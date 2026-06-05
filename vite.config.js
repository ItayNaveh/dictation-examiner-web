/** @type {import("vite").UserConfig} */
export default {
	build: {
		outDir: "docs",
		modulePreload: { polyfill: false },
		assetsDir: "",
	},
};
