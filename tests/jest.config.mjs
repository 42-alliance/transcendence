export default {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"],
	testTimeout: 60000, // 60s pour éviter les timeouts sur tests lourds
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
	
	// 🏎️ Exécution parallèle optimisée
	maxWorkers: "50%", // Utilise la moitié des cœurs CPU (ajuste si nécessaire)
	maxConcurrency: 5, // Limite le nombre de tests exécutés en même temps (augmente si besoin)
};
