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
    ctx.strokeStyle = "#948f8fff";
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
  private overlayAlpha = 0.35; // intensité de l'assombrissement
  private handleServerState = (e: Event) => {
    if (!this.playersReady || !this.canvas) return;
    const data = (e as CustomEvent).detail;
    // Attendu: data.width, data.height, data.paddle1.y, data.paddle2.y
    if (data.width && data.height) {
      this.serverFieldWidth = data.width;
      this.serverFieldHeight = data.height;
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
          "/src/Views/Game/pong_assets/pong_background3.png"
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
}
