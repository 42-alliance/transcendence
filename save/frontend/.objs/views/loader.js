// loader.js
export function showLoader() {
    const loader = document.getElementById('loader');
    const loadingDirectory = "assets/loading/";
    const loadingPaths = [
        { path: loadingDirectory + "gohan.gif", duration: 2720 },
        { path: loadingDirectory + "loading.gif", duration: 3800 },
        { path: loadingDirectory + "freezer_pointing.gif", duration: 1470 },
        { path: loadingDirectory + "broly_goku.gif", duration: 4590 },
        { path: loadingDirectory + "cell_vs_goku.gif", duration: 1960 },
        { path: loadingDirectory + "trunks_cut_freezer.gif", duration: 2170 },
        { path: loadingDirectory + "piccolo.gif", duration: 2000 },
        { path: loadingDirectory + "piccolo_masenko.gif", duration: 4100 },
        { path: loadingDirectory + "gohan_masenko.gif", duration: 5000 },
    ];
    const randomImg = loadingPaths[Math.floor(Math.random() * loadingPaths.length)];
    const imgElement = loader.querySelector('img');
    imgElement.src = randomImg.path;
    loader.classList.add('visible');
    return randomImg.duration;
}
export function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('visible');
}
export function simulateNavigation() {
    const duration = showLoader();
    setTimeout(() => {
        hideLoader();
    }, duration);
}
//# sourceMappingURL=loader.js.map