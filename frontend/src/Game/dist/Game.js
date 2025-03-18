/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Game.ts":
/*!*********************!*\
  !*** ./src/Game.ts ***!
  \*********************/
/***/ (() => {

eval("\n// \nfunction render() {\n    fetch('/ws/game/matchmaking', {\n        method: 'GET',\n        headers: { 'Authorization': localStorage.getItem('token') || '' }\n    })\n        .then(response => response.json())\n        .then(data => {\n        if (data.success) {\n            const socket = new WebSocket('ws://localhost:8790');\n            socket.onopen = () => {\n                socket.send(JSON.stringify({ type: 'auth', token: localStorage.getItem('token') }));\n            };\n            socket.onmessage = (event) => {\n                const message = JSON.parse(event.data);\n                if (message.type === 'auth_success') {\n                    console.log(\"Authentification réussie, jeu prêt.\");\n                }\n                else if (message.type === 'auth_failed') {\n                    console.error(\"Authentification échouée, déconnexion...\");\n                    socket.close();\n                }\n            };\n        }\n    });\n}\n//animate loop\nrender();\n\n\n//# sourceURL=webpack://game/./src/Game.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/Game.ts"]();
/******/ 	
/******/ })()
;