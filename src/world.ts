import { EndScreen } from "./game-states/end-screen";
import { PauseScreen } from "./game-states/pause-screen";
import { PlayScreen } from "./game-states/play-screen";
import { StartScreen } from "./game-states/start-screen";
import { globals } from "./globals";
import { StateManager } from "./state-manager";


export class World {
    private stateManager: StateManager;
    private beginMode: StartScreen;
    private playMode: PlayScreen;
    private pauseMode: PauseScreen;
    private endMode: EndScreen;
    constructor(canvas: HTMLCanvasElement) {
        this.stateManager = new StateManager();
        this.beginMode = new StartScreen();
        this.playMode = new PlayScreen();
        this.pauseMode = new PauseScreen(canvas);
        this.endMode = new EndScreen(canvas);

        this.stateManager.addState("Open", this.beginMode);
        this.stateManager.addState("Play", this.playMode);
        this.stateManager.addState("Paused", this.pauseMode);
        this.stateManager.addState("End", this.endMode);

        this.stateManager.StartState = "Open";


        globals.canvas.addEventListener("onPlayerWin", e => this.onPlayerWinHandler(e as CustomEvent), false);
        globals.canvas.addEventListener("onPlayerLoose", e => this.onPlayerLooseHandler(e as CustomEvent), false);
        globals.canvas.addEventListener("onSpacePressed", e => this.spacePressedHandler(), false);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.stateManager.CurrentState.obj.draw(ctx);
    }

    update() {
        if ("update" in this.stateManager.CurrentState.obj) {
            this.stateManager.CurrentState.obj.update();
        }

        if (!document.hasFocus() && this.stateManager.CurrentState.name == "Play") {
            this.stateManager.makeTransition("Paused");
        }
    }

    onPlayerWinHandler(e: CustomEvent) {
        console.log("World.onWinningHangler(): \"onWinning\" Event handled");
        console.log("World.onWinningHangler(): " + e.detail.message);
        this.stateManager.makeTransition("End");
    }

    onPlayerLooseHandler(e: CustomEvent) {
        console.log("World.onWinningHangler(): \"onWinning\" Event handled");
        console.log("World.onWinningHangler(): " + e.detail.message);
        this.stateManager.makeTransition("End");
    }

    spacePressedHandler() {
        console.log("World.spacePressedHandler(): The current state is " + this.stateManager.CurrentState.name);
        switch (this.stateManager.CurrentState.name) {
            case "Open":
                this.stateManager.makeTransition("Play");
                break;
            case "Play":
                this.stateManager.makeTransition("Paused");
                break;
            case "Paused":
                this.stateManager.makeTransition("Play");
                break;
            case "End":
                this.stateManager.makeTransition("Open");
                break;
            default:
                this.stateManager.makeTransition("Open");
                break;
        }
        console.log("World.spacePressedHandler(): The updated current state is " + this.stateManager.CurrentState.name);
    }
}