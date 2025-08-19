import { BaseScreen } from "../components/Screen.js";

// --- Assets & Player --------------------------------------------------
interface GameAssets {
  background: HTMLImageElement;
  pong1: HTMLImageElement;
  pong2: HTMLImageElement;
  ball: HTMLImageElement;
}

class Player {
  private img: HTMLImageElement;
  public x = 0;
  public y = 0; // top-left
  public width = 0;
  public height = 0;
  private readonly targetHeightRatio: number; // fraction of canvas height
  private readonly marginX: number;
  private canvas: HTMLCanvasElement;
  private side: "left" | "right";
  private half?: "left" | "right"; // source cropping
  private cropX = 0;
  private cropY = 0;
  private cropW = 0;
  private cropH = 0;

  constructor(opts: {
    img: HTMLImageElement;
    canvas: HTMLCanvasElement;
    side: "left" | "right";
    targetHeightRatio?: number; // default 0.3
    marginX?: number; // default 40
    half?: "left" | "right"; // if provided, crop that half of the source image
  }) {
    this.img = opts.img;
    this.canvas = opts.canvas;
    this.side = opts.side;
    this.targetHeightRatio = opts.targetHeightRatio ?? 0.3;
    this.marginX = 1;
    this.half = opts.half;
    this.compute();
  }

  private compute() {
    const naturalW = this.img.naturalWidth || 1;
    const naturalH = this.img.naturalHeight || 1;
    // Define crop region
    if (this.half === "left") {
      this.cropX = 0;
      this.cropW = naturalW / 2;
    } else if (this.half === "right") {
      this.cropX = naturalW / 2;
      this.cropW = naturalW / 2;
    } else {
      this.cropX = 0;
      this.cropW = naturalW;
    }
    this.cropY = 0;
    this.cropH = naturalH;
    const desiredH = Math.round(this.canvas.height * this.targetHeightRatio);
    const scale = desiredH / this.cropH;
    this.width = Math.round(this.cropW * scale);
    this.height = desiredH;
    this.y = Math.round((this.canvas.height - this.height) / 2);
    this.x =
      this.side === "left"
        ? this.marginX
        : this.canvas.width - this.marginX - this.width;
  }

  public resize() {
    this.compute();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.width && this.height) {
      // If cropping defined, use 9‑arg drawImage
      ctx.drawImage(
        this.img,
        this.cropX,
        this.cropY,
        this.cropW,
        this.cropH,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = "#f0f";
      ctx.fillRect(this.x, this.y, 50, 150);
    }
    // Debug outline + size text
    ctx.save();
    ctx.strokeStyle = "#000000ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  public setCenterY(serverCenterY: number, serverFieldHeight: number) {
    // Map centre serveur -> top local
    const ratio = serverCenterY / serverFieldHeight;
    const localCenter = ratio * this.canvas.height;
    const newTop = Math.round(localCenter - this.height / 2);
    this.y = Math.min(Math.max(0, newTop), this.canvas.height - this.height);
  }

  public setTopFromServer(
    serverTopY: number,
    serverFieldHeight: number,
    serverPaddleHeight?: number
  ) {
    if (!serverFieldHeight) return;
    const effectiveServerRange = serverFieldHeight - (serverPaddleHeight || 0);
    const availableLocalRange = this.canvas.height - this.height;
    const ratio =
      effectiveServerRange > 0 ? serverTopY / effectiveServerRange : 0;
    const localTop = Math.round(ratio * availableLocalRange);
    this.y = Math.min(Math.max(0, localTop), availableLocalRange);
  }
}

export class GameScreen extends BaseScreen {
  private template!: string;
  private assets: GameAssets;
  private animationFrameId?: number;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private leftPlayer: Player | null = null;
  private rightPlayer: Player | null = null;
  private backgroundReady = false;
  private playersReady = false;
  private serverFieldHeight = 0;
  private serverFieldWidth = 0;
  private ballReady = false;
  private ballPos: { x: number; y: number; r: number } | null = null;
  private debugCount = 0;
  private overlayEnabled = true;
  private overlayAlpha = 0.1; // intensité de l'assombrissement
  // Score / names state (rendered directly in canvas)
  private scoreData: {
    p1?: number;
    p2?: number;
    p1_name?: string;
    p2_name?: string;
  } = {};
  private scoreAnim: { t: number; p1?: number; p2?: number } = { t: 0 };
  // Ajout pour gestion du résultat
  public showGameFinished(data: any) {
    const resultDiv = document.getElementById("game-result");
    if (!resultDiv) {
      console.error("Game result div not found");
      return;
    }

    // Reset container
    resultDiv.innerHTML = "";
    resultDiv.style.display = "flex";
    resultDiv.classList.add('result-card');
    resultDiv.classList.remove('result-win','result-lose');
    resultDiv.setAttribute('aria-live','polite');

    if (this.canvas) this.canvas.style.display = "none";

    // Current user / outcome
    const gameInstance = (window as any).gameInstance;
    const currentUser = gameInstance?.getUser?.() || {};
    const userId = String(currentUser.id || '');

    const mode = String(data.mode || '').toLowerCase();
    const isLocal = mode === 'local';
    const isIA = mode === 'ia' || mode === 'ai';

    // Winner detection (robust): by id, by name (case-insensitive), then score fallback
    const currentNameNorm = String(currentUser?.name || '').trim().toLowerCase();
    const winnerIdMatch = data.winner != null && String(data.winner) === userId;
    const winnerNameNorm = String(data.winner_name || '').trim().toLowerCase();
    const winnerNameMatch = !!currentNameNorm && currentNameNorm === winnerNameNorm;

    let computedWinner = winnerIdMatch || winnerNameMatch;

    // Fallback via score if provided
    if (!computedWinner && data.score) {
      const p1n = String(data.score.p1_name || '').trim().toLowerCase();
      const p2n = String(data.score.p2_name || '').trim().toLowerCase();
      if (currentNameNorm && (p1n === currentNameNorm || p2n === currentNameNorm)) {
        const myScore = p1n === currentNameNorm ? Number(data.score.p1) : Number(data.score.p2);
        const oppScore = p1n === currentNameNorm ? Number(data.score.p2) : Number(data.score.p1);
        if (!Number.isNaN(myScore) && !Number.isNaN(oppScore)) {
          computedWinner = myScore > oppScore;
        }
      }
    }

    // For local mode, always display winner visuals; otherwise use computed result
    const isWinner = isLocal ? true : computedWinner;

    // Background layer
    const bg = document.createElement('div');
    bg.className = 'result-bg';
    resultDiv.appendChild(bg);

    // Overlay layer
    const overlay = document.createElement('div');
    overlay.className = 'result-overlay';
    resultDiv.appendChild(overlay);

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'result-content';
    resultDiv.appendChild(content);

    // Apply variant
    resultDiv.classList.add(isWinner ? 'result-win' : 'result-lose');

    // Title
    const title = document.createElement("h2");
    title.className = 'result-title';
    if (isLocal) {
      title.textContent = `${data.winner_name || 'Joueur'} wins!`;
    } else {
      title.textContent = isWinner ? "Vous avez gagné !" : "Vous avez perdu !";
    }
    content.appendChild(title);

    // Subtitle (mode / tournament)
    const subtitleParts: string[] = [];
    if (data.mode) subtitleParts.push(String(data.mode).toUpperCase());
    if (data.tournament_name) subtitleParts.push(`Tournoi: ${data.tournament_name}`);
    if (subtitleParts.length) {
      const subtitle = document.createElement('div');
      subtitle.className = 'result-subtitle';
      subtitle.textContent = subtitleParts.join(' • ');
      content.appendChild(subtitle);
    }

    // Message (score + winner name only)
    const message = document.createElement("p");
    if (data.disconnection) {
      message.textContent = `Votre adversaire (${data.disconnected_player}) s'est déconnecté !`;
    } else if (data.score) {
      let base = `Score final: ${data.score.p1} - ${data.score.p2}`;
      if (data.winner_name) base += ` | Gagnant: ${data.winner_name}`;
      message.textContent = base;
    }
    content.appendChild(message);

    // Button
    const button = document.createElement("button");
    button.textContent = "Retourner au lobby";
    button.onclick = () => {
      resultDiv.style.transition = "opacity 0.25s ease";
      resultDiv.style.opacity = "0";
      setTimeout(() => {
        if (this.canvas) {
          this.canvas.style.display = "none";
          const ctx = this.canvas.getContext("2d");
          if (ctx) { ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
        }
        resultDiv.style.display = "none";
        resultDiv.innerHTML = "";
        import("../../GameUI.js").then(({ GameUI }) => GameUI.showLobbyButtons());
        this.playersReady = false;
        this.ballReady = false;
        this.leftPlayer = null;
        this.rightPlayer = null;
        this.ballPos = null;
        this.container.style.display = "none";
        this.container.innerHTML = "";
      }, 250);
    };
    content.appendChild(button);

    // Preload and apply background image on bg layer
    const bgUrl = isWinner
      ? "/src/Views/Game/pong_assets/win.jpeg"
      : "/src/Views/Game/pong_assets/loose.jpg";

    const img = new Image();
    img.onload = () => {
      bg.style.backgroundImage = `url('${bgUrl}')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    };
    img.onerror = () => {
      bg.style.background = isWinner
        ? 'linear-gradient(135deg, rgba(16,185,129,.25), rgba(6,95,70,.35))'
        : 'linear-gradient(135deg, rgba(239,68,68,.25), rgba(127,29,29,.35))';
    };
    img.src = bgUrl;

    setTimeout(() => button.focus(), 50);
  }
  private handleServerState = (e: Event) => {
    if (!this.playersReady || !this.canvas) return;
    const data = (e as CustomEvent).detail;
    // Attendu: data.width, data.height, data.paddle1.y, data.paddle2.y
    if (data.width && data.height) {
      this.serverFieldWidth = data.width;
      this.serverFieldHeight = data.height;
    }
    if (data.score) {
      // Detect score changes for animation scaling
      if (
        typeof data.score.p1 === "number" &&
        data.score.p1 !== this.scoreData.p1
      ) {
        this.scoreAnim.p1 = Date.now();
      }
      if (
        typeof data.score.p2 === "number" &&
        data.score.p2 !== this.scoreData.p2
      ) {
        this.scoreAnim.p2 = Date.now();
      }
      this.scoreData = {
        p1: data.score.p1,
        p2: data.score.p2,
        p1_name: data.score.p1_name || this.scoreData.p1_name,
        p2_name: data.score.p2_name || this.scoreData.p2_name,
      };
    }
    if (this.leftPlayer && data.paddle1?.y != null) {
      this.leftPlayer.setTopFromServer(
        data.paddle1.y,
        this.serverFieldHeight || 1920,
        data.paddle1.height
      );
    }
    if (this.rightPlayer && data.paddle2?.y != null) {
      this.rightPlayer.setTopFromServer(
        data.paddle2.y,
        this.serverFieldHeight || 1920,
        data.paddle2.height
      );
    }
    if (data.ball && this.serverFieldHeight && this.serverFieldWidth) {
      // On suppose que x,y du serveur représentent le centre de la balle
      const sx = data.ball.x;
      const sy = data.ball.y;
      const sr = data.ball.radius ?? data.ball.r ?? 10;
      const cx = (sx / this.serverFieldWidth) * this.canvas.width;
      const cy = (sy / this.serverFieldHeight) * this.canvas.height;
      // Mise à l'échelle du rayon selon l'axe vertical pour garder les proportions
      const scale = this.canvas.height / this.serverFieldHeight;
      const cr = sr * scale;
      this.ballPos = { x: cx, y: cy, r: cr };
      this.ballReady = true;
    }
  };

  constructor() {
    super("game-screen");
    this.assets = {
      background: new Image(),
      pong1: new Image(),
      pong2: new Image(),
      ball: new Image(),
    };
  }
  private async loadTemplate(): Promise<void> {
    const response = await fetch("/src/Views/Game/UI/screens/GameScreen.html");
    this.template = await response.text();
  }

  public async show(): Promise<string> {
    return new Promise(async (resolve) => {
      if (!this.template) await this.loadTemplate();

      this.clearContainer();
      this.container.innerHTML = this.template;

      // CSS dynamique (une seule fois)
      if (!document.querySelector("link[data-game-screen-css]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/Views/Game/UI/screens/GameScreen.css";
        link.setAttribute("data-game-screen-css", "1");
        document.head.appendChild(link);
      }

      this.canvas = this.container.querySelector(
        "#gameCanvas"
      ) as HTMLCanvasElement;
      if (!this.canvas) {
        console.error("GameCanvas not found");
        return;
      }
      this.ctx = this.canvas.getContext("2d");
      if (!this.ctx) {
        console.error("2D context unavailable");
        return;
      }

      // Dimensions sûres
      this.canvas.width = 1920;
      this.canvas.height = 1080;

      const loadImage = (img: HTMLImageElement, src: string) =>
        new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error("Failed to load " + src));
          img.src = src;
        });

      Promise.all([
        loadImage(
          this.assets.background,
          "/src/Views/Game/pong_assets/shenron.webp"
        ),
        loadImage(this.assets.pong1, "/src/Views/Game/pong_assets/pong.png"),
        loadImage(this.assets.pong2, "/src/Views/Game/pong_assets/pong.png"),
        loadImage(this.assets.ball, "/src/Views/Game/pong_assets/ball.png"),
      ])
        .then(() => {
          this.backgroundReady = true;
          this.leftPlayer = new Player({
            img: this.assets.pong1,
            canvas: this.canvas!,
            side: "left",
            half: "right", // utilise moitié droite pour pong1
          });
          this.rightPlayer = new Player({
            img: this.assets.pong2,
            canvas: this.canvas!,
            side: "right",
            half: "left", // utilise moitié gauche pour pong2
          });
          this.playersReady = true;
          // Pré-position balle au centre avant première update
          if (this.canvas) {
            this.ballPos = {
              x: this.canvas.width / 2,
              y: this.canvas.height / 2,
              r: 10,
            };
          }
          this.startLoop();
          // Écoute des updates serveur
          document.addEventListener(
            "game_state_update",
            this.handleServerState as EventListener
          );
          // Initial names from global gameInstance if available
          try {
            const gameInstance: any = (window as any).gameInstance;
            if (gameInstance?.players) {
              const p1 = gameInstance.players[0];
              const p2 = gameInstance.players[1];
              this.scoreData.p1_name = p1?.name || this.scoreData.p1_name;
              this.scoreData.p2_name = p2?.name || this.scoreData.p2_name;
            }
          } catch {
            /* noop */
          }
        })
        .catch((e) => {
          console.error(e);
          this.drawFallback();
        })
        .finally(() => {
          this.container.style.display = "block";
          this.container.style.opacity = "1";
          resolve("game");
        });
    });
  }

  public hide(): void {
    super.hide();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    document.removeEventListener(
      "game_state_update",
      this.handleServerState as EventListener
    );
  }

  private startLoop() {
    const step = () => {
      this.animationFrameId = requestAnimationFrame(step);
      if (!this.ctx || !this.canvas) return;
      // Clear
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Background
      if (this.backgroundReady) {
        this.ctx.drawImage(
          this.assets.background,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
      } else {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      // Overlay pour améliorer visibilité (assombrit légèrement le fond)
      if (this.overlayEnabled) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0,0,0,${this.overlayAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }
      // Players
      if (this.playersReady) {
        this.leftPlayer?.draw(this.ctx);
        this.rightPlayer?.draw(this.ctx);
      }
      // Ball
      if (this.ballReady && this.ballPos) {
        const { x, y, r } = this.ballPos;
        this.ctx.save();
        // Dessin image si disponible (sprite circulaire optionnel), sinon cercle plein
        const img = this.assets.ball;
        if (img && img.complete && img.naturalWidth > 0) {
          // On dessine l'image centrée sur (x,y)
          const d = r * 2;
          this.ctx.drawImage(img, x - r, y - r, d, d);
        } else {
          this.ctx.fillStyle = "#fff";
          this.ctx.beginPath();
          this.ctx.arc(x, y, r, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
      // Scores & names (render lower in canvas)
      this.drawScores();
    };
    step();
  }

  private drawFallback() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px sans-serif";
    this.ctx.fillText("Assets load failed", 20, 30);
  }

  private drawScores() {
    if (!this.ctx || !this.canvas) return;
    const { p1, p2, p1_name, p2_name } = this.scoreData;
    if (p1 == null && p2 == null && !p1_name && !p2_name) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.font = "700 52px Poppins, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const baseYNames = this.canvas.height - 220; // lowered placement
    const baseYScores = this.canvas.height - 120; // scores below names

    // Shadow / glow style for DBZ effect
    const drawGlowText = (
      text: string,
      x: number,
      y: number,
      opts: { gradient?: CanvasGradient; color?: string; scale?: number }
    ) => {
      ctx.save();
      if (opts.scale && opts.scale !== 1) {
        ctx.translate(x, y);
        ctx.scale(opts.scale, opts.scale);
        ctx.translate(-x, -y);
      }
      ctx.fillStyle = opts.color || "#fef9c3";
      if (opts.gradient) ctx.fillStyle = opts.gradient;
      ctx.shadowColor = "rgba(255,180,0,0.8)";
      ctx.shadowBlur = 22;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // Names
    ctx.font = "600 40px Poppins, sans-serif";
    if (p1_name)
      drawGlowText(
        p1_name.toUpperCase(),
        this.canvas.width * 0.25,
        baseYNames,
        { color: "#fef9c3" }
      );
    if (p2_name)
      drawGlowText(
        p2_name.toUpperCase(),
        this.canvas.width * 0.75,
        baseYNames,
        { color: "#fef9c3" }
      );

    // Scores with gradient and scale animation when changed
    ctx.font = "800 100px Poppins, sans-serif";
    const gradLeft = ctx.createLinearGradient(0, 0, 200, 0);
    gradLeft.addColorStop(0, "#f97316");
    gradLeft.addColorStop(0.55, "#facc15");
    gradLeft.addColorStop(1, "#fde047");
    const gradRight = ctx.createLinearGradient(0, 0, 200, 0);
    gradRight.addColorStop(0, "#f97316");
    gradRight.addColorStop(0.55, "#facc15");
    gradRight.addColorStop(1, "#fde047");

    const now = Date.now();
    const scaleFor = (ts?: number) => {
      if (!ts) return 1;
      const dt = (now - ts) / 500; // 0.5s anim
      if (dt >= 1) return 1;
      // simple ease out overshoot
      const peak = 0.3; // 30% bigger
      if (dt < 0.35) return 1 + peak * (dt / 0.35); // grow
      if (dt < 0.55) return 1 + peak * (1 - (dt - 0.35) / 0.2); // shrink back
      return 1; // settle
    };

    if (p1 != null) {
      drawGlowText(String(p1), this.canvas.width * 0.25, baseYScores, {
        gradient: gradLeft,
        scale: scaleFor(this.scoreAnim.p1),
      });
    }
    if (p2 != null) {
      drawGlowText(String(p2), this.canvas.width * 0.75, baseYScores, {
        gradient: gradRight,
        scale: scaleFor(this.scoreAnim.p2),
      });
    }

    ctx.restore();
  }
}
