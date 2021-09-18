import { globals } from "./globals";
import { World } from "./world";



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e: KeyboardEvent) {
    if (e.keyCode == 39) {
        globals.rightPressed = true;
    } else if (e.keyCode == 37) {
        globals.leftPressed = true;
    }
}

function keyUpHandler(e: KeyboardEvent) {
    if (e.keyCode == 39) {
        globals.rightPressed = false;
    } else if (e.keyCode == 37) {
        globals.leftPressed = false;
    } else if (e.keyCode == 32) {
        const spacePressedEvt = new CustomEvent("onSpacePressed");
        console.log("keyUpHandler(): \"onSpacePressed\" event dispatched");
        globals.canvas.dispatchEvent(spacePressedEvt);
    }
}

function mouseMoveHandler(e: MouseEvent) {
    var relativeX = e.clientX - globals.canvas.offsetLeft;
    if (relativeX > 0 && relativeX < globals.canvas.width) {
        globals.paddleX = relativeX - globals.paddleWidth / 2;
    }
}

/**
 * Render the game and start the game loop
 */
var simpleBreakout = new World(globals.canvas);

function renderFrame() {
    globals.ctx.clearRect(0, 0, globals.canvas.width, globals.canvas.height);
    simpleBreakout.draw(globals.ctx);
    simpleBreakout.update();
    requestAnimationFrame(renderFrame);
}

renderFrame();