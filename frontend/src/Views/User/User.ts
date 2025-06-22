import { Games, UserData } from "../../types.js";
import { GetUserByName } from "../../User/getUserByName.js";
import { getUserInfos } from "../../User/me.js";
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

function timeAgo(dateInput: string | Date, locale: string = "en"): string {
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

	if (!historyList || !historyList.length) {
		ul.innerHTML = `<li><div class="text-gray-500 italic">Aucune partie jouée.</div></li>`;
		return;
	}

	const userId = user.id;

	historyList.forEach(game => {
		const isWin = game.winner === userId;
		const opponent =
			game.player1Id === userId ? game.player2 : game.player1;

		const colorClass = isWin
			? "bg-green-400"
			: game.status === "ragequit"
			? "bg-gray-400"
			: "bg-red-400";
		const label = isWin
			? "Victory"
			: game.status === "ragequit"
			? "Ragequit"
			: "Défaite";
		const pic = opponent.picture || "/assets/default.jpeg";

		const myScore = game.player1Id === userId ? game.score1 : game.score2;
		const oppScore = game.player1Id === userId ? game.score2 : game.score1;

		const scoreColorClass = isWin
			? "text-green-400"
			: game.status === "ragequit"
			? "text-gray-400"
			: "text-red-400";

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
    data-link>vs 
      <b class="ml-1 text-white group-hover:text-gray-200 transition-colors">${
			opponent.name
		}</b>
      <img src="${pic}" alt="photo ${
			opponent.name
		}" class="w-8 h-8 rounded-full border-2 border-[#1a1826] shadow" />
    </a>
    <span class="ml-auto text-sm text-gray-500">${timeAgo(
		game.finished_at
	)}</span>
  </div>
`;
		ul.appendChild(li);
	});
}

function renderWinLossStats(user: UserData, targetId = "win-loss-graphic") {
	const container = document.getElementById(targetId);
	if (!container) return;

	const games = user.games || [];
	const total = games.length;
	const wins = games.filter(g => g.winner === user.id).length;
	const losses = games.filter(
		g => g.winner !== user.id && g.status !== "ragequit"
	).length;
	const ragequits = games.filter(
		g => g.status === "ragequit" && g.winner !== user.id
	).length;
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
		const div = document.createElement("div");
		div.className =
			"relative flex flex-col items-center bg-gradient-to-b from-[#232345] via-[#2e2e5e] to-[#191a2c] rounded-2xl shadow-xl p-0 min-h-[260px] w-[180px] max-w-[220px] transition-transform hover:-translate-y-1 hover:scale-105 duration-200 border border-[#35357a] group cursor-pointer overflow-hidden";

		div.innerHTML = `
			<div class="w-full h-24 bg-cover bg-center" style="background-image: url('${friend.banner || "/assets/default_banner.jpeg"}');"></div>
			<div class="flex flex-col items-center -mt-8 w-full px-4 pb-4">
				<img src="${friend.picture || "/assets/default.jpeg"}" alt="${friend.name}"
					class="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-purple-400 transition-all duration-200" />
				<h4 class="mt-2 text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors w-full text-center">${friend.name}</h4>
				<span class="mt-1 text-xs px-3 py-1 rounded bg-[#35357a]/60 text-gray-200 group-hover:bg-purple-500/70 transition-colors w-fit">${friend.status ? friend.status : ""}</span>
			</div>
			<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm1 5h-2v6h6v-2h-4V7z"/></svg>
			</div>
		`;
		div.onclick = () => {
			setTimeout(() => {
				navigateTo(`/${friend.name}`);
			}, 100);
		};
		container.appendChild(div);
	});
}

export async function showUserProfile(username?: string) {
	if (!username) return;
	const user = await GetUserByName(username);
	if (!user) return;

	console.log("User profile:", user);

	const test = document.getElementById("user-card-panel");
	if (!test) return;

	createUserCard(test, user);

	renderCommonFriends(user, "show-common-friend");

	const game_play_div = document.getElementById("user-match-count");
	if (!game_play_div) return;
	game_play_div.innerHTML = user.games!.length.toString();

	renderGameHistory(user, user.games!, "game-history-list");
	renderWinLossStats(user);
}
