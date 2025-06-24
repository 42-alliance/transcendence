import { Games, UserData } from "../../types.js";
import { GetUserByName } from "../../User/getUserByName.js";
import { getUserInfos } from "../../User/me.js";
import { nbGames, nbLosses, nbRagequits, nbWins } from "../../utils.js";
import AView from "../AView.js";
import { createUserCard } from "../userCard/userCard.js";
import { navigateTo } from "../viewManager.js";

export default class extends AView {
	constructor() {
		super();
		this.setTitle("Dragon Pong");
	}

	async getHtml() {
		try {
			const response = await fetch("/src/Views/User/User.html");
			if (!response.ok) {
				throw new Error(
					`Failed to load HTML file: ${response.statusText}`
				);
			}
			// Get the :username param from the URL
			return await response.text();
		} catch (error) {
			console.error(error);
			return `<p>Error loading content</p>`;
		}
	}
}

export function timeAgo(dateInput: string | Date, locale: string = "en"): string {
	const date =
		typeof dateInput === "string" ? new Date(dateInput) : dateInput;
	const now = new Date();
	const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // en secondes

	// Valeurs en secondes pour chaque unité
	const times: { name: Intl.RelativeTimeFormatUnit; sec: number }[] = [
		{ name: "year", sec: 31536000 },
		{ name: "month", sec: 2592000 },
		{ name: "day", sec: 86400 },
		{ name: "hour", sec: 3600 },
		{ name: "minute", sec: 60 },
		{ name: "second", sec: 1 },
	];

	for (const t of times) {
		const value = Math.floor(diff / t.sec);
		if (value > 0) {
			// Le -value pour “il y a …”
			const rtf = new Intl.RelativeTimeFormat(locale, {
				numeric: "auto",
			});
			return rtf.format(-value, t.name);
		}
	}
	// Just now, moins d’une seconde
	return locale === "fr" ? "à l’instant" : "just now";
}

function renderGameHistory(
	user: UserData,
	historyList: Games[],
	targetId = "game-history-list"
) {
	const ul = document.getElementById(targetId);
	if (!ul) return;
	ul.innerHTML = ""; // reset

	if (!historyList || historyList.length === 0) {
		ul.innerHTML = `<li><div class="text-gray-500 italic">Aucune partie jouée.</div></li>`;
		return;
	}

	const userId = user.id;

	historyList.forEach(game => {
		const isWin = game.winner === userId;
		const isRagequit = game.status === "ragequit";
		const opponent = game.player1Id === userId ? game.player2 : game.player1;
		const opponentPic = opponent.picture || "/assets/default.jpeg";

		let colorClass = "bg-red-400";
		let label = "Defeat";
		let scoreColorClass = "text-red-400";

		if (isWin) {
			colorClass = "bg-green-400";
			label = "Victory";
			scoreColorClass = "text-green-400";
		} else if (isRagequit) {
			colorClass = "bg-gray-400";
			label = "Ragequit";
			scoreColorClass = "text-gray-400";
		}

		const myScore = game.player1Id === userId ? game.score1 : game.score2;
		const oppScore = game.player1Id === userId ? game.score2 : game.score1;

		const li = document.createElement("li");
		li.className = "list-none";
		li.innerHTML = `
			<div class="flex items-center gap-3">
				<span class="w-2.5 h-2.5 rounded-full ${colorClass}"></span>
				<span class="font-semibold ${scoreColorClass}">${label}</span>
				<div class="flex items-center gap-2 ml-2">
					<span class="text-white font-bold">${myScore}</span>
					<span class="text-gray-500 font-semibold">-</span>
					<span class="${scoreColorClass} font-bold">${oppScore}</span>
				</div>
				<a href="/${opponent.name}" 
					class="text-gray-400 flex items-center gap-2 hover:text-gray-200 transition-colors ml-4"
					data-link>
					vs 
					<b class="ml-1 text-white group-hover:text-gray-200 transition-colors">${opponent.name}</b>
					<img src="${opponentPic}" alt="photo ${opponent.name}" class="w-8 h-8 rounded-full border-2 border-[#1a1826] shadow" />
				</a>
				<span class="ml-auto text-sm text-gray-500">${timeAgo(game.finished_at)}</span>
			</div>
		`;
		ul.appendChild(li);
	});
}

function renderWinLossStats(user: UserData, targetId = "win-loss-graphic") {
	const container = document.getElementById(targetId);
	if (!container) return;

	if (!user.games || !user.id) return;

	const games = user.games;
	const total = games.length;
	const wins = nbWins(games, user.id);
	const ragequits = nbRagequits(games, user.id);
	const losses = nbLosses(games, user.id) - ragequits;
	const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

	container.innerHTML = `
		<div class="flex flex-col items-center gap-2">
			<div class="flex gap-4">
				<div class="flex flex-col items-center">
					<span class="text-green-400 font-bold text-lg">${wins}</span>
					<span class="text-xs text-gray-400">Wins</span>
				</div>
				<div class="flex flex-col items-center">
					<span class="text-red-400 font-bold text-lg">${losses}</span>
					<span class="text-xs text-gray-400">Losses</span>
				</div>
				<div class="flex flex-col items-center">
					<span class="text-gray-400 font-bold text-lg">${ragequits}</span>
					<span class="text-xs text-gray-400">Ragequits</span>
				</div>
			</div>
			<div class="w-full mt-2">
				<div class="relative h-4 bg-gray-700 rounded-full overflow-hidden">
					<div class="absolute left-0 top-0 h-4 bg-green-400" style="width: ${winrate}%;"></div>
					<div class="absolute right-0 top-0 h-4 bg-red-400" style="width: ${100 - winrate}%;"></div>
				</div>
				<div class="text-center text-xs text-gray-300 mt-1">Winrate: <span class="font-bold">${winrate}%</span></div>
			</div>
		</div>
	`;
}

function renderCommonFriends(user: UserData, targetId = "show-common-friend") {
	const container = document.getElementById(targetId);
	if (!container) return;

	container.innerHTML = ""; // reset

	if (!user.common_friends || user.common_friends.length === 0) {
		container.innerHTML = `<div class="text-gray-500 italic">Aucun ami commun.</div>`;
		return;
	}

	user.common_friends.forEach(friend => {
		const div = createFriendCard(friend);
		container.appendChild(div);
	});
}

function createFriendCard(friend: any): HTMLDivElement {
	const div = document.createElement("div");
	div.className =
		"relative flex flex-col items-center bg-gradient-to-b from-[#232345] via-[#2e2e5e] to-[#191a2c] rounded-2xl shadow-xl p-0 min-h-[260px] w-[180px] max-w-[220px] transition-transform hover:-translate-y-1 hover:scale-105 duration-200 border border-[#35357a] group cursor-pointer overflow-hidden parallax-card";

	div.innerHTML = getFriendCardInnerHTML(friend);

	div.onclick = () => {
		setTimeout(() => {
			navigateTo(`/${friend.name}`);
		}, 100);
	};

	setupParallaxEffect(div);

	return div;
}

function getFriendCardInnerHTML(friend: any): string {
	return `
		<div class="w-full h-24 bg-cover bg-center parallax-banner" style="background-image: url('${friend.banner || "/assets/default_banner.jpeg"}');"></div>
		<div class="flex flex-col items-center -mt-8 w-full px-4 pb-4">
			<img src="${friend.picture || "/assets/default.jpeg"}" alt="${friend.name} image"
				class="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-purple-400 transition-all duration-200" />
			<h4 class="mt-2 text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors w-full text-center">${friend.name}</h4>
			<span class="mt-1 text-xs px-3 py-1 rounded bg-[#35357a]/60 text-gray-200 group-hover:bg-purple-500/70 transition-colors w-fit">${friend.status ? friend.status : ""}</span>
		</div>
		<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
			<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm1 5h-2v6h6v-2h-4V7z"/></svg>
		</div>
	`;
}

function setupParallaxEffect(div: HTMLDivElement) {
	let animationFrame: number | null = null;
	let lastX = 0, lastY = 0;

	const handleParallax = (x: number, y: number) => {
		const rect = div.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * 10;
		const rotateY = ((x - centerX) / centerX) * 10;
		div.style.transform = `perspective(600px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

		const banner = div.querySelector(".parallax-banner") as HTMLElement;
		if (banner) {
			const bannerMoveX = ((x - centerX) / centerX) * 8;
			const bannerMoveY = ((y - centerY) / centerY) * 8;
			banner.style.backgroundPosition = `calc(50% + ${bannerMoveX}px) calc(50% + ${bannerMoveY}px)`;
		}
	};

	div.addEventListener("mousemove", (e) => {
		const rect = div.getBoundingClientRect();
		lastX = e.clientX - rect.left;
		lastY = e.clientY - rect.top;
		if (animationFrame === null) {
			animationFrame = requestAnimationFrame(() => {
				handleParallax(lastX, lastY);
				animationFrame = null;
			});
		}
	});

	div.addEventListener("mouseleave", () => {
		div.style.transform = "";
		const banner = div.querySelector(".parallax-banner") as HTMLElement;
		if (banner) {
			banner.style.backgroundPosition = "";
		}
	});
}

export async function showUserProfile(username?: string) {
	if (!username) return;

	const user = await GetUserByName(username);
	if (!user || !user.games) return;

	const test = document.getElementById("user-card-panel");
	if (!test) return;

	createUserCard(test, user);

	renderCommonFriends(user, "show-common-friend");

	const game_play_div = document.getElementById("user-match-count");
	if (!game_play_div) return;
	game_play_div.innerHTML = nbGames(user.games).toString();

	renderGameHistory(user, user.games, "game-history-list");
	renderWinLossStats(user);
}
