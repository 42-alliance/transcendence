export class FontHelper {
    static readonly MIGHTY_SOULY_FONT = "'Mighty Souly', Arial, sans-serif";
    static readonly SCORE_FONT_SIZE = '35px';
    static readonly TITLE_FONT_SIZE = '50px';
    static readonly TEXT_FONT_SIZE = '20px';
    static readonly BUTTON_FONT_SIZE = '40px';
    
    static applyMightySoulyFont(element: HTMLElement, size: string = '16px') {
        element.style.fontFamily = this.MIGHTY_SOULY_FONT;
        element.style.fontSize = size;
    }
    
    static getScoreFont(): string {
        return `${this.SCORE_FONT_SIZE} ${this.MIGHTY_SOULY_FONT}`;
    }

    static loadFonts(): Promise<void> {
        return document.fonts.load(`${this.SCORE_FONT_SIZE} ${this.MIGHTY_SOULY_FONT}`).then(() => {});
    }
}