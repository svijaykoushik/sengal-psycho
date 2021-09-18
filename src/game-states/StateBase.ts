export abstract class StateBase {
    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract update(): void;
}