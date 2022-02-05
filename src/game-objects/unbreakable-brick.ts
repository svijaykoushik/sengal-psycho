import { Coordinate } from "../Math";
import { Brick } from "./brick";


/**
 * Unbreakable Brick
 */
export class UnbreakableBrick extends Brick {
    constructor(
        startCoordinate: Coordinate,
        width: number,
        height: number
    ) {
        super(startCoordinate, width, height, "#de9400");
        this.status = -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.rect(this.start.x, this.start.y, this.width, this.height);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.rect(this.start.x + 2.5, this.start.y + 2.5, this.width - 5, this.height - 5);
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}