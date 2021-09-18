import { Text } from "../game-objects/text";
import { globals } from "../globals";
import { Coordinate } from "../Math/coordinate";
import { StateBase } from "./StateBase";


export class StartScreen extends StateBase {
    private title: Text;
    private instruction: Text;

    constructor() {
        super();
        this.title = new Text(new Coordinate(globals.canvas.width / 2, (globals.canvas.height / 2) - 10), "Sengal Psycho");
        this.instruction = new Text(new Coordinate(globals.canvas.width / 2, globals.canvas.height - 50), "Press space to start");

        this.title.font = "60px VT323";
        this.title.alignment = "center";
        this.instruction.font = "20px VT323";
        this.instruction.alignment = "center";
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.title.draw(ctx);
        this.instruction.draw(ctx);
    }

    update() { }
}