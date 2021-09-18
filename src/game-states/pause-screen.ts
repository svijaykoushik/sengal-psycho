import { Text } from "../game-objects/text";
import { globals } from "../globals";
import { Coordinate } from "../Math/coordinate";
import { StateBase } from "./StateBase";


export class PauseScreen extends StateBase {
    private title: Text;
    private score: Text;
    private instruction: Text;
    constructor() {
        super();
        this.title = new Text(new Coordinate(globals.canvas.width / 2, (globals.canvas.height / 2) - 10), "Paused!");
        this.score = new Text(new Coordinate(globals.canvas.width / 2, globals.canvas.height / 2 + 30), "Score: " + globals.score);
        this.instruction = new Text(new Coordinate(globals.canvas.width / 2, globals.canvas.height - 50), "Press space to resume");

        this.title.font = "60px VT323";
        this.title.alignment = "center";
        this.score.alignment = "center";
        this.instruction.font = "24px VT323";
        this.instruction.alignment = "center";
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.title.draw(ctx);
        this.score.draw(ctx);
        this.instruction.draw(ctx);
    }

    update() {
        this.score.update("Score: " + globals.score);
    }
}