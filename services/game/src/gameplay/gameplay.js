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
exports.GameLoop = GameLoop;
var Matchmaking_js_1 = require("../matchmaking/Matchmaking.js");
var class_js_1 = require("./class.js");
var width = 800;
var height = 600;
var sessions = [];
function HandleMatch() {
    return __awaiter(this, void 0, void 0, function () {
        var paddle_1, paddle_2, ball, game;
        return __generator(this, function (_a) {
            // if a match is added to the session
            if (Matchmaking_js_1.session.length > 0) {
                console.log(Matchmaking_js_1.session);
                console.log("Creating game");
                paddle_1 = new class_js_1.Paddle(10, 10, 100, 20, 10);
                paddle_2 = new class_js_1.Paddle(width - 10, 10, 100, 20, 10);
                ball = new class_js_1.Ball(width / 2, height / 2, 10, 5);
                game = new class_js_1.Game(paddle_1, paddle_2, ball, width, height);
                game.mode = Matchmaking_js_1.session[0].match.players[0].type;
                if (Matchmaking_js_1.session[0].match.players.length === 2) {
                    game.p1.username = Matchmaking_js_1.session[0].match.players[0].username;
                    game.p2.username = Matchmaking_js_1.session[0].match.players[1].username;
                    game.match = Matchmaking_js_1.session[0].match.players[0].username + " vs " + Matchmaking_js_1.session[0].match.players[1].username;
                    game.p1.ws = Matchmaking_js_1.session[0].match.players[0].socket;
                    game.p2.ws = Matchmaking_js_1.session[0].match.players[1].socket;
                    if (game.p1.ws.readyState !== Matchmaking_js_1.wss.close && game.p2.ws.readyState !== Matchmaking_js_1.wss.close) {
                        game.p1.ws.send(JSON.stringify({ type: 'game_start', player: game.p1.username }));
                        game.p2.ws.send(JSON.stringify({ type: 'game_start', player: game.p2.username }));
                    }
                }
                else {
                    game.p1.username = "player1";
                    game.p2.username = "player2";
                    game.p1.ws = Matchmaking_js_1.session[0].match.players[0].socket;
                    game.p2.ws = Matchmaking_js_1.session[0].match.players[0].socket;
                    if (game.p1.ws.readyState !== Matchmaking_js_1.wss.close) {
                        game.p1.ws.send(JSON.stringify({ type: 'game_start', player: game.p1.username }));
                        console.log("Game start message sent to player1");
                    }
                }
                if (game) {
                    console.log("Game created");
                    sessions.push({ game: game });
                    sessions.forEach(function (session) {
                        console.log(session);
                    });
                    Matchmaking_js_1.session.shift();
                }
                else
                    console.error("Error creating game");
            }
            return [2 /*return*/];
        });
    });
}
function UpdateGame() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sessions.forEach(function (session) {
                session.game.update();
                session.game.checkBounds(0, 0, width, height);
                if (session.game.ball.x - session.game.ball.radius < session.game.paddle_1.x + session.game.paddle_1.width &&
                    session.game.ball.y > session.game.paddle_1.y &&
                    session.game.ball.y < session.game.paddle_1.y + session.game.paddle_1.height) {
                    session.game.ball.dx = -session.game.ball.dx;
                }
                if (session.game.ball.x + session.game.ball.radius > session.game.paddle_2.x &&
                    session.game.ball.y > session.game.paddle_2.y &&
                    session.game.ball.y < session.game.paddle_2.y + session.game.paddle_2.height) {
                    session.game.ball.dx = -session.game.ball.dx;
                }
                if (session.game.ball.x - session.game.ball.radius < 0) {
                    session.game.score_p2++;
                    session.game.ball.x = width / 2;
                    session.game.ball.y = height / 2;
                    session.game.ball.dx = -session.game.ball.dx;
                }
                if (session.game.ball.x + session.game.ball.radius > width) {
                    session.game.score_p1++;
                    session.game.ball.x = width / 2;
                    session.game.ball.y = height / 2;
                    session.game.ball.dx = -session.game.ball.dx;
                }
                if (session.game.ball.y - session.game.ball.radius < 0 || session.game.ball.y + session.game.ball.radius > height) {
                    session.game.ball.dy = -session.game.ball.dy;
                }
                if (session.game.score_p1 === 5) {
                    session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
                    session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p1.username }));
                    // sessions.splice(sessions.indexOf(session), 1);
                }
                if (session.game.score_p2 === 5) {
                    session.game.p1.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
                    session.game.p2.ws.send(JSON.stringify({ type: 'game_over', winner: session.game.p2.username }));
                    // sessions.splice(sessions.indexOf(session), 1);
                }
                session.game.sendData();
            });
            return [2 /*return*/];
        });
    });
}
function handleKeyCommand() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            Matchmaking_js_1.wss.on('message', function (message) {
                var data = JSON.parse(message);
                sessions.forEach(function (session) {
                    if (data.type === 'key_command' && data.username === session.game.p1.username) {
                        if (data.key === 'ArrowUp') {
                            session.game.paddle_1.moveUp();
                        }
                        if (data.key === 'ArrowDown') {
                            session.game.paddle_1.moveDown();
                        }
                    }
                    if (data.type === 'key_command' && data.username === session.game.p2.username) {
                        if (data.key === 'ArrowUp') {
                            session.game.paddle_2.moveUp();
                        }
                        if (data.key === 'ArrowDown') {
                            session.game.paddle_2.moveDown();
                        }
                    }
                });
            });
            return [2 /*return*/];
        });
    });
}
function GameLoop() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, HandleMatch()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, UpdateGame()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, handleKeyCommand()];
                case 3:
                    _a.sent();
                    setTimeout(GameLoop, 1000 / 60);
                    return [2 /*return*/];
            }
        });
    });
}
