import { WebSocketState } from './WebSocketState.js';
import { GameRenderer } from './GameRenderer.js';

export class AnimationController {
    private state: WebSocketState;

    constructor(state: WebSocketState) {
        this.state = state;
    }

    startAnimation(): void {
        this.state.setLastRender(performance.now());
        this.animate();
    }

    stopAnimation(): void {
        const frameId = this.state.getFrameId();
        if (frameId) {
            cancelAnimationFrame(frameId);
            this.state.setFrameId(null);
        }
    }

    private animate = (timestamp: number = 0) => {
        if (!this.state.getRunningState()) return;
        
        const elapsed = timestamp - this.state.getLastRender();
        if (elapsed > this.state.getFrameInterval()) {
            this.state.setLastRender(timestamp - (elapsed % this.state.getFrameInterval()));
            GameRenderer.renderGame(this.state.getGameState());
        }
        
        const frameId = requestAnimationFrame(this.animate);
        this.state.setFrameId(frameId);
    }
}