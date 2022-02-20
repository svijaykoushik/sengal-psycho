import { globals } from "./globals";
import { World } from "./world";



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e: KeyboardEvent) {
    if (e.code === "ArrowRight") {
        globals.rightPressed = true;
    } else if (e.code === "ArrowLeft") {
        globals.leftPressed = true;
    }
}

function keyUpHandler(e: KeyboardEvent) {
    if (e.code === "ArrowRight") {
        globals.rightPressed = false;
    } else if (e.code === "ArrowLeft") {
        globals.leftPressed = false;
    } else if (
        e.code === " " ||
        e.code === "Spacebar" ||
        e.code === "Space"
    ) {
        const spacePressedEvt = new CustomEvent("onSpacePressed");
        console.log("keyUpHandler(): \"onSpacePressed\" event dispatched");
        globals.canvas.dispatchEvent(spacePressedEvt);
    }
}

function mouseMoveHandler(e: MouseEvent) {
    const relativeX = e.clientX - globals.canvas.offsetLeft;
    const relativeY = e.clientY - globals.canvas.offsetTop;
    globals.mousePos.x = relativeX;
    globals.mousePos.y = relativeY;
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