export default {
	preset: "ts-jest/presets/default-esm", // Ensure TS is compiled as ESM
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"], // Treat .ts files as ES Modules
	 // Ensure Jest recognizes TS
	 testTimeout: 30000, // Set test timeout to 30 seconds
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
  