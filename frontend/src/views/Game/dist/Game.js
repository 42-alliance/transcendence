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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\nlet username = 'Test'; // Placeholder for username\nconst canvas = document.getElementById(\"game-canvas\");\nif (canvas == null) {\n    console.error(\"Impossible de récupérer le canvas\");\n}\nconst ctx = canvas ? canvas.getContext(\"2d\") : null;\nlet stat = \"loading\";\nlet video = null; // Declare video outside of the drawing function\nfunction drawingLoadingPage() {\n    if (!ctx)\n        return;\n    if (canvas == null)\n        return;\n    // Create video element only once\n    if (!video) {\n        video = document.createElement(\"video\");\n        video.src = \"./asset/waiting.mp4\"; // Make sure the path is correct\n        video.loop = true;\n        video.autoplay = true;\n        video.muted = true;\n        video.style.filter = \"blur(20px)\";\n        video.play(); // Start playing\n    }\n    // Set canvas size\n    canvas.width = 1200;\n    canvas.height = 700;\n    let textX = -300; // Start position of text\n    let textSpeed = 2; // Speed of text movement\n    let text = \"WAITING FOR OPPONENT\";\n    let period = \".\";\n    let i = 0;\n    setInterval(() => {\n        if (i < 3) {\n            text += period;\n            i++;\n        }\n        else {\n            text = \"WAITING FOR OPPONENT\";\n            i = 0;\n        }\n    }, 500);\n    function animate() {\n        if (canvas == null)\n            return;\n        if (ctx == null)\n            return;\n        if (video == null)\n            return;\n        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas\n        ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the video on canvas\n        ctx.font = \"bold 72px Arial, Helvetica, sans-serif\";\n        const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height - 50);\n        gradient.addColorStop(0, '#E93240');\n        gradient.addColorStop(1, '#EE4B2B');\n        ctx.shadowColor = \"rgba(0, 0, 0, 0.5)\";\n        ctx.shadowBlur = 10;\n        ctx.shadowOffsetX = 5;\n        ctx.shadowOffsetY = 5;\n        ctx.textAlign = \"center\";\n        ctx.textBaseline = \"middle\";\n        ctx.fillStyle = gradient;\n        ctx.fillText(text, textX, canvas.height - 100);\n        textX = canvas.width / 2; // Update text position\n        requestAnimationFrame(animate); // Loop animation\n    }\n    // Start animation when the video is ready\n    video.onloadeddata = () => {\n        if (stat === \"loading\")\n            animate();\n    };\n}\nfunction render() {\n    connectWebSocket();\n    drawingLoadingPage();\n}\nfunction renderGame() {\n    // Check if WebGL is supported\n    if (!window.BABYLON || !window.BABYLON.Engine.isSupported()) {\n        console.error(\"WebGL not supported\");\n        alert(\"WebGL is not supported by your browser or environment.\");\n        return;\n    }\n    // Create the engine and scene when the game starts\n    if (canvas == null)\n        return;\n    const engine = new window.BABYLON.Engine(canvas, true);\n    const scene = new window.BABYLON.Scene(engine);\n    // Create the camera\n    const camera = new window.BABYLON.ArcRotateCamera(\"camera1\", Math.PI / 2, Math.PI / 4, 10, new window.BABYLON.Vector3.Zero(), scene);\n    camera.attachControl(canvas, true);\n    // Create a light\n    const light = new window.BABYLON.HemisphericLight(\"light1\", new window.BABYLON.Vector3.Up(), scene);\n    // Create a sphere\n    const sphere = window.BABYLON.MeshBuilder.CreateSphere(\"sphere\", { diameter: 2 }, scene);\n    engine.runRenderLoop(() => {\n        scene.render();\n    });\n}\nfunction connectWebSocket() {\n    const socket = new WebSocket(\"ws://localhost:8790\");\n    socket.onopen = () => {\n        socket.send(JSON.stringify({ type: 'online', username: username }));\n    };\n    socket.onerror = (error) => {\n        console.error('Erreur WebSocket:', error);\n    };\n    socket.onmessage = (event) => {\n        const data = JSON.parse(event.data);\n        if (data.type === 'match_found') {\n            stat = \"game\";\n            console.log('Match trouvé, affichage du jeu');\n            // Stop the video and clear the canvas\n            if (video) {\n                video.pause(); // Pause the video\n                video.currentTime = 0; // Reset video to the beginning\n            }\n            if (ctx && canvas) {\n                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas\n                renderGame(); // Show the game display\n            }\n        }\n    };\n}\nrender();\n\n\n\n//# sourceURL=webpack://game/./src/Game.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/Game.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;