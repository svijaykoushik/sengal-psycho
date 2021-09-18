import { Coordinate } from "../Math/coordinate";
import { globals } from "../globals";
import { Text } from "../game-objects/text";


export class EndScreen {
    private title: Text;
    private score: Text;
    private instruction: Text;

    constructor(canvas: HTMLCanvasElement) {
        this.title = new Text(new Coordinate(canvas.width / 2, 50), "Congratulations!");
        this.score = new Text(new Coordinate(canvas.width / 2, canvas.height / 2 + 30), "Score: " + globals.score);
        this.instruction = new Text(new Coordinate(canvas.width / 2, canvas.height - 50), "Press space to quit");

        this.title.font = "60px VT323";
        this.title.alignment = "center";
        this.score.alignment = "center";
        this.instruction.font = "20px VT323";
        this.instruction.alignment = "center";
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.title.draw(ctx);
        this.score.draw(ctx);
        this.instruction.draw(ctx);
    }

    update() {
        this.score.update("Score: " + globals.score);
        if (globals.win == false) {
            this.title.update("Game Over");
        } else {
            this.title.update("Congratulations!");
        }
    }
}