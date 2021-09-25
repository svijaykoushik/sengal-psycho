import { globals } from "../globals";
import { Coordinate } from "../Math/coordinate";
import { Vector } from "../Math/vector";


/**
 * Paddle
 */
export class Paddle {
    start: Coordinate;
    width: number;
    height: number;
    constructor(
        startCoordinate: Coordinate,
        width: number,
        height: number
    ) {
        this.start = startCoordinate;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.rect(this.start.x, this.start.y, this.width, this.height);
        ctx.fillStyle = globals.colour;
        ctx.fill();
        ctx.closePath();
    }

    move(paddleX: Coordinate) {
        this.start = paddleX;
    }
}