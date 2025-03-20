"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.session = exports.match = void 0;
exports.setupMatchmaking = setupMatchmaking;
var ws_1 = require("ws");
exports.match = {
    //a tab of two interface player
    players: [],
};
exports.session = [];
var queue_local = [];
var queue_online = [];
var i = 0;
exports.wss = new ws_1.WebSocketServer({ port: 8790 });
console.log('Serveur WebSocket lancé sur ws://localhost:8790');
function setupMatchmaking() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Setting up matchmaking');
            exports.wss.on('connection', function (ws) {
                console.log('Nouvelle connexion');
                ws.on('message', function (message) {
                    try {
                        var data_1 = JSON.parse(message.toString());
                        data_1.username = "test" + i;
                        i++;
                        if (data_1.type === 'online') {
                            if (!queue_online.find(function (player) { return player.username === data_1.username; })) {
                                console.log("".concat(data_1.username, " a choisi le mode en ligne et entre dans la file"));
                                queue_online.push({ socket: ws, username: data_1.username, type: 'online' });
                                matchPlayers(queue_online);
                            }
                            else {
                                console.log("".concat(data_1.username, " est d\u00E9j\u00E0 dans la file online."));
                            }
                        }
                        else if (data_1.type === 'local') {
                            if (!queue_local.find(function (player) { return player.username === data_1.username; })) {
                                console.log("".concat(data_1.username, " a choisi le mode local et entre dans la file"));
                                queue_local.push({ socket: ws, username: data_1.username, type: 'local' });
                                matchPlayers(queue_local);
                            }
                            else {
                                console.log("".concat(data_1.username, " est d\u00E9j\u00E0 dans la file locale."));
                            }
                        }
                    }
                    catch (error) {
                        console.error('Erreur de parsing JSON:', error);
                    }
                });
            });
            exports.wss.on('close', function () {
                console.log('Fermeture de la connexion');
            });
            return [2 /*return*/];
        });
    });
}
/**
 * Associe les joueurs par paires pour jouer.
 */
function matchPlayers(queue) {
    while (queue.length >= 2) {
        var player1 = queue.shift();
        if (player1 && player1.type === 'local') {
            console.log("Match trouv\u00E9 : ".concat(player1.username));
            var matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player1.username });
            if (player1.socket.readyState === ws_1.WebSocket.OPEN) {
                player1.socket.send(matchMessage1);
            }
            exports.session.push({ match: { players: [player1] } });
            continue;
        }
        var player2 = queue.shift();
        if (player2 && player2.type === 'local') {
            console.log("Match trouv\u00E9 : ".concat(player2.username));
            var matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player2.username });
            if (player2.socket.readyState === ws_1.WebSocket.OPEN) {
                player2.socket.send(matchMessage1);
            }
            if (player1)
                queue.unshift(player1);
            exports.session.push({ match: { players: [player2] } });
            continue;
        }
        else if (player1 && player2) {
            console.log("Match trouv\u00E9 : ".concat(player1.username, " vs ").concat(player2.username));
            var matchMessage1 = JSON.stringify({ type: 'match_found', opponent: player2.username });
            var matchMessage2 = JSON.stringify({ type: 'match_found', opponent: player1.username });
            if (player1.socket.readyState === ws_1.WebSocket.OPEN) {
                player1.socket.send(matchMessage1);
            }
            if (player2.socket.readyState === ws_1.WebSocket.OPEN) {
                player2.socket.send(matchMessage2);
            }
            exports.session.push({ match: { players: [player1, player2] } });
        }
    }
}
