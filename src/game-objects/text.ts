import { Coordinate } from "../Math/coordinate";
import { globals } from "../globals";

/**
 * Text component in the game
 */
export class Text {
    private pos: Coordinate;
    private text: string;
    font: string;
    alignment: CanvasTextAlign;
    private colour: string;
    constructor(position: Coordinate, text: string) {
        this.pos = position;
        this.text = text;
        this.font = globals.font;
        this.alignment = "start";
        this.colour = globals.colour;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = this.alignment;
        ctx.font = this.font;
        ctx.fillStyle = this.colour;
        ctx.fillText(this.text, this.pos.x, this.pos.y);
    }

    update(text: string) {
        this.text = text;
    }
}