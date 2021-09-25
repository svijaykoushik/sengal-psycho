import { globals } from "../globals";
import { Coordinate } from "../Math/coordinate";
import { Vector } from "../Math/vector";

/**
 * Ball
 */
export class Ball {
    center: Coordinate;
    r: number;
    constructor(center: Coordinate, radius: number) {
        this.center = center;
        this.r = radius;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#aa00ff";
        ctx.fill();
        ctx.closePath();
    }

    move(velocity: Vector) {
        this.center = this.center.add(velocity) as Coordinate;
    }
}