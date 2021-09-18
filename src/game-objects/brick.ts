import { Coordinate } from "../Math/coordinate";

/**
 * Brick
 */
export class Brick {
    start: Coordinate;
    width: number;
    height: number;
    status: number;
    colour: string;

    constructor(
        startCoordinate: Coordinate,
        width: number,
        height: number,
        colour: string
    ) {
        this.start = startCoordinate;
        this.width = width;
        this.height = height;
        this.status = 1;
        this.colour = colour
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.rect(this.start.x, this.start.y, this.width, this.height);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }

    destroy() {
        this.status = 0;
    }

    revive() {
        this.status = 1;
    }
}