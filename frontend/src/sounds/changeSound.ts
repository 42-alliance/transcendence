const songs: { title: string; path: string }[] = [
	{ title: "Vegeta Sacrifice", path: "assets/sounds/vegeta_sacrifice.mp3" },
	{ title: "Perfect Cell", path: "assets/sounds/Perfect_Cell.mp3" },
	{ title: "Ultra Instinct", path: "assets/sounds/Ultra_Instinct.mp3" },
	{ title: "Limit-Break x Survivor", path: "assets/sounds/Limit-Break_x_Survivor.mp3" },
];

let currentSongIndex = 0;

function updateSongTitle(titleElement: HTMLSpanElement, songIndex: number) {
	titleElement.textContent = songs[songIndex].title;
}

function togglePlayPause(audioPlayer: HTMLAudioElement, playPauseButton: HTMLButtonElement) {
	if (audioPlayer.paused) {
		audioPlayer.play();
		playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
	} else {
		audioPlayer.pause();
		playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
	}
}

function changeSong(audioPlayer: HTMLAudioElement, playPauseButton: HTMLButtonElement, titleElement: HTMLSpanElement, direction: number) {
	currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
	audioPlayer.src = songs[currentSongIndex].path;
	audioPlayer.play();
	playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
	updateSongTitle(titleElement, currentSongIndex);
}

export function setupSoundListener() {
	const soundBar = document.getElementById("sound-bar");
	if (!soundBar) return;

	const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement | null;
	const playPauseButton = document.getElementById("play-pause") as HTMLButtonElement | null;
	const volumeSlider = document.getElementById("volume-slider") as HTMLInputElement | null;
	const nextSongButton = document.getElementById("next-song") as HTMLButtonElement | null;
	const prevSongButton = document.getElementById("prev-song") as HTMLButtonElement | null;
	const songTitle = document.getElementById("song-title") as HTMLSpanElement | null;

	if (!audioPlayer || !playPauseButton || !volumeSlider || !nextSongButton || !prevSongButton || !songTitle) return;
	
	updateSongTitle(songTitle, currentSongIndex);

	playPauseButton.addEventListener("click", () => togglePlayPause(audioPlayer, playPauseButton));
	nextSongButton.addEventListener("click", () => changeSong(audioPlayer, playPauseButton, songTitle, 1));
	prevSongButton.addEventListener("click", () => changeSong(audioPlayer, playPauseButton, songTitle, -1));

	volumeSlider.addEventListener("input", (e: Event) => {
		const target = e.target as HTMLInputElement;
		audioPlayer.volume = parseFloat(target.value);
	});
}
