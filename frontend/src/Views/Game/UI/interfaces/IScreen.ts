export interface IScreen {
    show(): Promise<string>;
    hide(): void;
}