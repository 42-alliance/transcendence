import { all_sessions, wss } from "../matchmaking/Matchmaking.js";
import { Game, Paddle, Ball } from "./class.js";
import { GameAI, AILevel } from "./ai.js";

let width = 1600; // Default width for game
let height = 800; // Default height for game

export let sessions = new Map<string, Game>();
let gameAIs = new Map<string, GameAI>();
let sessionsToDelete = new Map<string, Game>();
let sessionsToDeleteAI = new Map<string, GameAI>();

import WebSocket from "ws";

function secure_send(ws: WebSocket, message: string) {
	if (ws.readyState !== WebSocket.CLOSED) {
		ws.send(message);
	}
}

// Fonction pour déterminer le niveau de difficulté de l'IA
function getAIDifficultyLevel(username: string): AILevel {
	// Par défaut, utiliser le niveau moyen
	let level = AILevel.MEDIUM;

	// On peut personnaliser le niveau en fonction du nom d'utilisateur ou d'autres paramètres
	if (username.toLowerCase().includes("easy")) {
		level = AILevel.EASY;
	} else if (username.toLowerCase().includes("hard")) {
		level = AILevel.HARD;
	} else if (username.toLowerCase().includes("impossible")) {
		level = AILevel.IMPOSSIBLE;
	}
	return level;
}
function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function HandleMatch() {
	if (all_sessions.length > 0) {
		console.log("Creating game");
		const game = new Game(1600, 800);
		game.mode = all_sessions[0].match.players[0].type;
		game.ia_difficulty =
			all_sessions[0].match.players[0].difficulty || "medium"; // Valeur par défaut si undefined
		game.uuid_room = all_sessions[0].match.uuid_room;
		if (game.mode === "create_inv_game" || game.mode === "join_inv_game")
			game.mode = "random_adversaire"; // Forcer le mode à random_adversaire pour les jeux créés via l'invitation
		console.log(`game.mode === ${game.mode}`);
		switch (game.mode) {
			case "random_adversaire":
				console.log(
					"Game mode: random_adversaire using uuid_room: ",
					all_sessions[0].match.uuid_room
				);
				console.log(all_sessions[0]);
				game.p1.user_id = all_sessions[0].match.players[0].user_id; // Ajouter l'ID utilisateur
				game.p2.user_id = all_sessions[0].match.players[1].user_id; // Ajouter l'ID utilisateur
				game.p1.username = all_sessions[0].match.players[0].username;
				game.p2.username = all_sessions[0].match.players[1].username;
				game.match =
					all_sessions[0].match.players[0].username +
					" vs " +
					all_sessions[0].match.players[1].username;
				game.p1.ws = all_sessions[0].match.players[0].socket;
				game.p2.ws = all_sessions[0].match.players[1].socket;

				game.mapPlayers.set(
					all_sessions[0].match.players[0].user_id,
					game.p1
				);
				game.mapPlayers.set(
					all_sessions[0].match.players[1].user_id,
					game.p2
				);
				if (
					game.p1.ws.readyState !== wss.close &&
					game.p2.ws.readyState !== wss.close
				) {
					game.p1.ws.send(
						JSON.stringify({
							type: "start_animation",
							player: game.p1.username,
							opponent: game.p2.username,
							mode: game.mode,
						})
					);
					game.p2.ws.send(
						JSON.stringify({
							type: "start_animation",
							player: game.p2.username,
							opponent: game.p1.username,
							mode: game.mode,
						})
					);
				}
				// wait 5 seconds before sending the start message
				await delay(4000);
				sessions.set(all_sessions[0].match.uuid_room, game);
				if (
					game.p1.ws.readyState !== wss.close &&
					game.p2.ws.readyState !== wss.close
				) {
					console.log(
						"Game start message sent to both players uuid_room: ",
						all_sessions[0].match.uuid_room
					);
					game.p1.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p1.username,
							uuid_room: all_sessions[0].match.uuid_room,
							dimensions: { width, height },
						})
					);
					game.p2.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p2.username,
							uuid_room: all_sessions[0].match.uuid_room,
							dimensions: { width, height },
						})
					);
					game.started_at = new Date();
					// send start_animation versus
					all_sessions.shift();
				} else {
					sessions.delete(all_sessions[0].match.uuid_room);
					secure_send(
						all_sessions[0].match.players[0].socket,
						JSON.stringify({
							type: "error",
							message: "Error starting game",
						})
					);
					secure_send(
						all_sessions[0].match.players[1].socket,
						JSON.stringify({
							type: "error",
							message: "Error starting game",
						})
					);
					all_sessions.shift();
				}
				setTimeout(() => {}, 1000); //wait 5 seconds before sending the start message
				//wait 5 seconds before sending the start message
				break;
			case "local":
				game.p1.username = "PLAYER_A";
				game.p2.username = "PLAYER_B";
				game.match = "Local game";
				game.mode = "local";
				game.uuid_room = all_sessions[0].match.uuid_room;
				game.p1.ws = all_sessions[0].match.players[0].socket;
				game.p1.user_id = all_sessions[0].match.players[0].user_id; // Ajouter l'ID utilisateur
				sessions.set(all_sessions[0].match.uuid_room, game);
				if (game.p1.ws.readyState !== wss.close) {
					game.p1.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p1.username,
							uuid_room: all_sessions[0].match.uuid_room,
							dimensions: { width, height },
						})
					);
					all_sessions.shift();
					console.log("Game start message sent to player 1");
				} else {
					console.error("Error sending game start message");
					sessions.delete(all_sessions[0].match.uuid_room);
					all_sessions.shift();
				}
				break;
			case "ia":
				console.log(
					"Game mode: ia using uuid_room: ",
					all_sessions[0].match.uuid_room
				);
				game.p1.username = all_sessions[0].match.players[0].username;
				game.p1.user_id = all_sessions[0].match.players[0].user_id; // Ajouter l'ID utilisateur
				const difficulty = getAIDifficultyLevel(game.ia_difficulty);
				let aiName = "IA";
				switch (difficulty) {
					case AILevel.EASY:
						aiName = "IA (Facile)";
						break;
					case AILevel.MEDIUM:
						aiName = "IA (Medium)";
						break;
					case AILevel.HARD:
						aiName = "IA (Difficile)";
						break;
					case AILevel.IMPOSSIBLE:
						aiName = "IA (Impossible)";
						break;
				}
				game.p2.username = aiName;
				game.match = `${game.p1.username} vs ${aiName}`;
				game.mode = "ia";
				game.p1.ws = all_sessions[0].match.players[0].socket;

				sessions.set(all_sessions[0].match.uuid_room, game);

				// Créer une nouvelle instance de GameAI
				const ai = new GameAI(game, difficulty);
				gameAIs.set(all_sessions[0].match.uuid_room, ai);

				if (game.p1.ws.readyState !== wss.close) {
					game.p1.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p1.username,
							opponent: aiName,
							difficulty: difficulty.toString(),
							uuid_room: all_sessions[0].match.uuid_room,
							dimensions: { width, height },
						})
					);
					all_sessions.shift();
					console.log(
						`Game start message sent to playequeuer 1 (vs ${aiName})`
					);
				} else {
					console.error("Error sending game start message");
					sessions.delete(all_sessions[0].match.uuid_room);
					gameAIs.delete(all_sessions[0].match.uuid_room);
					all_sessions.shift();
				}
				break;
			case "tournament":
				game.p1.username = all_sessions[0].match.players[0].username;
				game.p2.username = all_sessions[0].match.players[1].username;
				game.p1.user_id = all_sessions[0].match.players[0].user_id; // Ajouter l'ID utilisateur
				game.p2.user_id = all_sessions[0].match.players[1].user_id; // Ajouter l'ID utilisateur
				game.match =
					all_sessions[0].match.players[0].username +
					" vs " +
					all_sessions[0].match.players[1].username;
				game.p1.ws = all_sessions[0].match.players[0].socket;
				game.p2.ws = all_sessions[0].match.players[1].socket;
				game.mapPlayers.set(
					all_sessions[0].match.players[0].user_id,
					game.p1
				);
				game.mapPlayers.set(
					all_sessions[0].match.players[1].user_id,
					game.p2
				);
				game.uuid_room = all_sessions[0].match.uuid_room;
				game.global_uuid = all_sessions[0].match.global_uuid; // Ajouter l'ID global du tournoi
				game.tour_stat = all_sessions[0].match.tour_stat || ""; // Ajouter l'état du tournoi avec une valeur par défaut
				sessions.set(all_sessions[0].match.uuid_room, game);
				console.log("A game is setting up");
				await delay(4000);
				if (
					game.p1.ws.readyState !== wss.close &&
					game.p2.ws.readyState !== wss.close
				) {
					game.p1.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p1.username,
							uuid_room: all_sessions[0].match.uuid_room,
							global_uuid: all_sessions[0].match.global_uuid,
							dimensions: { width, height },
						})
					);
					game.p2.ws.send(
						JSON.stringify({
							type: "start",
							player: game.p2.username,
							uuid_room: all_sessions[0].match.uuid_room,
							dimensions: { width, height },
						})
					);
					all_sessions.shift();
				} else {
					console.error("Error sending game start message");
					sessions.delete(all_sessions[0].match.uuid_room);
					secure_send(
						all_sessions[0].match.players[0].socket,
						JSON.stringify({
							type: "error",
							message: "Error starting game",
						})
					);
					secure_send(
						all_sessions[0].match.players[1].socket,
						JSON.stringify({
							type: "error",
							message: "Error starting game",
						})
					);
					all_sessions.shift();
				}
				break;
			case "default":
				console.error("Error: no game mode selected");
				all_sessions.shift();
				break;
		}
	}
}

async function UpdateGame() {
	// Vider les Maps de sessions à supprimer du cycle précédent
	sessionsToDelete.clear();
	sessionsToDeleteAI.clear();

	// Vérifier les sessions et marquer celles à supprimer
	sessions.forEach((session, uuid) => {
		session.update();
		session.checkBounds();
		session.sendData();

		// Si la partie est terminée, ajouter à la liste des sessions à supprimer
		if (session.check_end()) {
			console.log(`Game ${uuid} finished, marking for deletion`);
			sessionsToDelete.set(uuid, session);

			// Si c'est une partie contre l'IA, marquer l'IA pour suppression aussi
			if (session.mode === "ia" && gameAIs.has(uuid)) {
				sessionsToDeleteAI.set(uuid, gameAIs.get(uuid)!);
			}
		}
	});

	// Supprimer les sessions marquées
	sessionsToDelete.forEach((session, uuid) => {
		sessions.delete(uuid);
		console.log(`Game session ${uuid} has been removed`);
	});

	// Supprimer les IA marquées
	sessionsToDeleteAI.forEach((ai, uuid) => {
		gameAIs.delete(uuid);
		console.log(`AI instance for game ${uuid} has been removed`);
	});
}
wss.on("connection", ws => {
	// Store key states for each player to track changes
	const playerKeyStates = new Map<string, any>();

	ws.on("message", (message: string) => {
		// console.log("Received message from client:", message);
		try {
			let data = JSON.parse(message);
			console.log(data.type);
			if (
				data.type === "key_command" &&
				data.uuid_room &&
				sessions.has(data.uuid_room)
			) {
				const session = sessions.get(data.uuid_room);
				console.log("Received key state:", data.key_state);
				if (!session) return;

				// Store current key states for this player
				playerKeyStates.set(data.user_id, data.key_state);

				if (session.mode === "local") {
					// Apply continuous movement for player 1
					if (data.key_state.ArrowUp) {
						session.p1.paddle.move(
							"up",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).ArrowUp
						);
					}
					if (data.key_state.ArrowDown) {
						session.p1.paddle.move(
							"down",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).ArrowDown
						);
					}

					// Apply continuous movement for player 2
					if (data.key_state.w) {
						session.p2.paddle.move(
							"up",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).z
						);
					}
					if (data.key_state.s) {
						session.p2.paddle.move(
							"down",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).s
						);
					}
				} else if (
					session.mode === "random_adversaire" ||
					session.mode === "tournament"
				) {
					const player = session.mapPlayers.get(data.user_id);
					if (player) {
						if (data.key_state.w) {
							player.paddle.move(
								"up",
								() =>
									playerKeyStates.has(data.user_id) &&
									playerKeyStates.get(data.user_id).z
							);
						}
						if (data.key_state.s) {
							player.paddle.move(
								"down",
								() =>
									playerKeyStates.has(data.user_id) &&
									playerKeyStates.get(data.user_id).s
							);
						}
						if (data.key_state.ArrowUp) {
							player.paddle.move(
								"up",
								() =>
									playerKeyStates.has(data.user_id) &&
									playerKeyStates.get(data.user_id).ArrowUp
							);
						}
						if (data.key_state.ArrowDown) {
							player.paddle.move(
								"down",
								() =>
									playerKeyStates.has(data.user_id) &&
									playerKeyStates.get(data.user_id).ArrowDown
							);
						}
						console.log("Player paddle moved:", player.username);
					}
				} else if (session.mode === "ia") {
					if (data.key_state.ArrowUp) {
						session.p1.paddle.move(
							"up",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).ArrowUp
						);
					}
					if (data.key_state.ArrowDown) {
						session.p1.paddle.move(
							"down",
							() =>
								playerKeyStates.has(data.user_id) &&
								playerKeyStates.get(data.user_id).ArrowDown
						);
					}
				} else {
					console.error("Unknown game mode:", session.mode);
				}
			}
		} catch (error) {
			console.error("Erreur de traitement du message:", error);
		}
	});

	// Clean up key states when connection closes
	ws.on("close", () => {
		// Find and remove any key states for this connection
		playerKeyStates.forEach((_, userId) => {
			playerKeyStates.delete(userId);
		});
	});
});

// Remplacer la fonction foreachIaGame par une version qui utilise notre nouvelle IA
async function updateAI() {
	gameAIs.forEach((ai, uuid_room) => {
		// Ne pas mettre à jour l'IA si la session est marquée pour suppression
		if (sessions.has(uuid_room) && !sessionsToDelete.has(uuid_room)) {
			// Mettre à jour l'IA
			if (ai.check_end_game()) {
				console.log(`Game ${uuid_room} is finished, not updating AI`);
				sessionsToDeleteAI.set(uuid_room, ai);
				sessions.delete(uuid_room);
				gameAIs.delete(uuid_room);
				return;
			}
			ai.update();
		}
	});
}

export async function GameLoop() {
	await HandleMatch();
	await UpdateGame();
	await updateAI(); // Remplacer foreachIaGame par updateAI
	setTimeout(GameLoop, 1000 / 120);
}
