export default {
	preset: "ts-jest/presets/default-esm", // Ensure TS is compiled as ESM
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"], // Treat .ts files as ES Modules
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Ensure Jest recognizes TS
	transform: {
	  "^.+\\.tsx?$": [
		"ts-jest",
		{
		  useESM: true,
		},
	  ],
	},
	collectCoverageFrom: ["services/**/*.ts"],
	modulePathIgnorePatterns: ["<rootDir>/.objs"],
  };
  