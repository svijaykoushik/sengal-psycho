/**
 * GLOBALS
 */
var canvas = document.getElementById("myCanvas"),
  ctx = canvas.getContext("2d"),
  colour = "#0095DD",
  font = "20px VT323",
  ballRadius = 10,
  x = canvas.width / 2,
  y = canvas.height - 30,
  dx = 2,
  dy = -2,
  paddleHeight = 10,
  paddleWidth = 75,
  paddleX = (canvas.width - paddleWidth) / 2,
  rightPressed = false,
  leftPressed = false,
  brickRowCount = 5,
  brickColumnCount = 3,
  brickWidth = 75,
  brickHeight = 20,
  brickPadding = 10,
  brickOffsetTop = 30,
  brickOffsetLeft = 30,
  score = 0,
  lives = 3,
  gameOver = false,
  win = false,
  destroyCount = 0,
  frameId = 0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  } else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  } else if (e.keyCode == 37) {
    leftPressed = false;
  } else if (e.keyCode == 32) {
    const spacePressedEvt = new CustomEvent("onSpacePressed");
    console.log("keyUpHandler(): \"onSpacePressed\" event dispatched");
    canvas.dispatchEvent(spacePressedEvt);
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}
/**
 *Helper class
 */
class Helper {
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }
}

/**
 * Simple state manager
 */
class StateManager {
  constructor() {
    this.states = {};
    this.startState = null;
    this.currentState = null;
    this.endState = null;
  }

  addState(name, stateObj) {
    if (!(name in this.states)) {
      this.states[name] = {
        name: name,
        obj: stateObj
      };
      console.log("addState(): new state " + name + " added");
    } else {
      console.warn("addState(): new state " + name + "was not added");
    }
  }

  set StartState(name) {
    if (name in this.states) {
      this.startState = this.states[name];
      this.currentState = this.states[name];
    } else {
      console.warn("StartState(): Invalid state name " + name);
      console.warn(this.states);
      console.warn(name in this.states);
    }
  }

  get CurrentState() {
    return this.currentState;
  }

  set CurrentState(name) {
    if (name in this.states) {
      this.currentState = this.states[name];
    } else {
      console.warn("CurrentState(): Invalid state name " + name);
    }
  }

  makeTransition(nextStateName) {
    if (nextStateName in this.states) {
      this.currentState = this.states[nextStateName];
    } else {
      console.warn("Invalid state name " + name);
    }
  }
}

/**
 * Ball
 */
class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.r = radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}

/**
 * Paddle
 */
class Paddle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
  }

  move(paddleX) {
    this.x = paddleX;
  }
}

/**
 * Brick
 */
class Brick {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.status = 1;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
  }

  destroy() {
    this.status = 0;
  }

  revive() {
    this.status = 1;
  }
}

/**
 * Level
 **/
class Level {
  constructor(rowCount, columnCount, brickWidth, brickHeight, topOffset, leftOffset, padding) {
    this.bricks = [];
    for (var c = 0; c < columnCount; c++) {
      for (var r = 0; r < rowCount; r++) {
        var brickX = (r * (brickWidth + padding)) + leftOffset;
        var brickY = (c * (brickHeight + padding)) + topOffset;
        this.bricks.push(new Brick(brickX, brickY, brickWidth, brickHeight));
      }
    }
  }

  draw() {
    for (var i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].status == 1) {
        this.bricks[i].draw();
      }
    }
  }

  reset() {
    for (var i = 0; i < this.bricks.length; i++) {
      this.bricks[i].revive();
    }
  }
}

/**
 * Text component in the game
 */
class Text {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.font = font;
    this.alignment = "start";
    this.colour = colour;
  }

  draw() {
    ctx.textAlign = this.alignment;
    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.fillText(this.text, this.x, this.y);
  }

  update(text) {
    this.text = text;
  }
}

/**
 *Brick Particles
 */
class BrickParticles {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.angle = Helper.random(0, Math.PI * 2); // choose an angle between 0 to 360
    this.speed = Helper.random(1, 10);
    this.friction = 0.95;
    this.gravity = 2;
    this.red = colour.red;
    this.green = colour.green;
    this.blue = colour.blue;
    this.alpha = 1;
    this.decay = Helper.random(0.015, 0.03);
    this.side = Helper.random(2, brickHeight / Math.sqrt(2));
  }

  draw(context) {
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.side, this.y + this.side);
    context.lineTo(this.x, this.y + 2 * this.side);
    context.lineTo(this.x - this.side, this.y + this.side);
    context.fillStyle = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
    context.closePath();
    context.fill();
  }
  update() {
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;

    this.alpha -= this.decay;
  }
}
/**
 * Particle Explosion system
 */

class Explosion {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.particles = [];
    this.particleCount = 30;
    this.completed = false;
    while (this.particleCount--) {
      this.particles.push(new BrickParticles(this.x, this.y, this.colour));
    }
  }

  draw(context) {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(context);
    }
  }
  update() {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
      if (this.particles[i].alpha <= this.particles[i].decay) {
        this.particles.splice(i, 1);
      }
    }
    if (this.particles.length == 0) {
      this.completed = true;
    }
  }

  get HasFaded() {
    return this.completed;
  }
}


/****************************************************/
/*****************GAME STATES***********************/
/**************************************************/

class StartScreen {
  constructor() {
    this.title = new Text(canvas.width / 2, (canvas.height / 2) - 10, "Sengal Psycho");
    this.instruction = new Text(canvas.width / 2, canvas.height - 50, "Press space to start");

    this.title.font = "60px VT323";
    this.title.alignment = "center";
    this.instruction.font = "20px VT323";
    this.instruction.alignment = "center";
  }

  draw() {
    this.title.draw();
    this.instruction.draw();
  }
}

class PauseScreen {
  constructor() {
    this.title = new Text(canvas.width / 2, (canvas.height / 2) - 10, "Paused!");
    this.score = new Text(canvas.width / 2, canvas.height / 2 + 30, "Score: " + score);
    this.instruction = new Text(canvas.width / 2, canvas.height - 50, "Press space to resume");

    this.title.font = "60px VT323";
    this.title.alignment = "center";
    this.score.alignment = "center";
    this.instruction.font = "24px VT323";
    this.instruction.alignment = "center";
  }

  draw() {
    this.title.draw();
    this.score.draw();
    this.instruction.draw();
  }

  update() {
    this.score.update("Score: " + score);
  }
}

class EndScreen {
  constructor() {
    this.title = new Text(canvas.width / 2, 50, "Congratulations!");
    this.score = new Text(canvas.width / 2, canvas.height / 2 + 30, "Score: " + score);
    this.instruction = new Text(canvas.width / 2, canvas.height - 50, "Press space to quit");

    this.title.font = "60px VT323";
    this.title.alignment = "center";
    this.score.alignment = "center";
    this.instruction.font = "20px VT323";
    this.instruction.alignment = "center";
  }

  draw() {
    this.title.draw();
    this.score.draw();
    this.instruction.draw();
  }

  update() {
    this.score.update("Score: " + score);
    if (win == false) {
      this.title.update("Game Over");
    } else {
      this.title.update("Congratulations!");
    }
  }
}

/**
 * Game Play
 */
class PlayScreen {
  constructor() {
    this.ball = new Ball(x, y, ballRadius);
    this.paddle = new Paddle(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    this.level = new Level(brickRowCount, brickColumnCount, brickWidth, brickHeight, brickOffsetTop, brickOffsetLeft, brickPadding);
    this.score = new Text(8, 20, "Score: ");
    this.lives = new Text(canvas.width - 70, 20, "Lives: ");
    this.explosions = [];

    canvas.addEventListener("onPlayerLoose", e => this.onPlayerLooseHandler(e), false);
    canvas.addEventListener("onPlayerWin", e => this.onPlayerWinHandler(e), false);
    canvas.addEventListener("onBallCollidesBrick", e => this.ballCollidesBrickHandler(e), false);
  }

  draw() {
    this.level.draw();
    this.ball.draw();
    this.paddle.draw();
    this.score.draw();
    this.lives.draw();
  }

  collisionDetection() {
    for (var i = 0; i < this.level.bricks.length; i++) {
      var b = this.level.bricks[i];
      if (b.status == 1) {
        if (this.ball.x > b.x && this.ball.x < b.x + b.width && this.ball.y > b.y && this.ball.y < b.y + b.height) {
          /* creating and dispatching custom event*/
          const ballCollidesBrick = new CustomEvent("onBallCollidesBrick", {
            detail: {
              brick: b
            }
          });
          canvas.dispatchEvent(ballCollidesBrick);
        }
      }
    }
  }

  update() {
    this.collisionDetection();
    if (this.ball.x + dx > canvas.width - this.ball.r || this.ball.x + dx < this.ball.r) {
      dx = -dx;
    }
    if (this.ball.y + dy < this.ball.r) {
      dy = -dy;
    } else if (this.ball.y + dy > canvas.height - this.ball.r) {
      if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
        dy = -dy;
      } else {
        lives--;
        if (!lives) {
          /* creating and dispatching custom event*/
          const onPlayerLooseEvt = new CustomEvent("onPlayerLoose", {
            detail: {
              eventName: "onPlayerLoose",
              message: "Ha! Ha! You Loose!"
            }
          });
          console.log("PlayScreen.update(): \"onPlayerLoose\" Event dispatched");
          canvas.dispatchEvent(onPlayerLooseEvt);

        } else {
          this.ball.x = canvas.width / 2;
          this.ball.y = canvas.height - 30;
          dx = 3;
          dy = -3;
          this.paddle.x = (canvas.width - paddleWidth) / 2;
        }
      }
    }

    if (rightPressed && this.paddle.x < canvas.width - this.paddle.width) {
      paddleX += 7;
    } else if (leftPressed && this.paddle.x > 0) {
      paddleX -= 7;
    }

    this.paddle.move(paddleX);

    this.ball.move(dx, dy);

    this.score.update("Score: " + score);

    this.lives.update("Lives: " + lives);

    for (var i = 0; i < this.explosions.length; i++) {
      this.explosions[i].draw(ctx);
      this.explosions[i].update();

      if (this.explosions[i].HasFaded) {
        this.explosions.splice(i, 1);
      }
    }
    if (this.isLevelClear()) {
      dx = 0;
      dy = 0;
      if (this.explosions.length < 1) {
       /* creating and dispatching custom event*/
        const onPlayerWinEvt = new CustomEvent("onPlayerWin", {
          detail: {
            message: "Congratulations! YOU WON"
          }
        });
        console.log("PlayScreen.update(): \"onPlayerWin\" Event dispatched");
        canvas.dispatchEvent(onPlayerWinEvt);
      }
    }
  }

  resetLevel() {
    this.level.reset();
    this.ball.x = canvas.width / 2;
    this.ball.y = canvas.height - 30;
    dx = 3;
    dy = -3;
    this.paddle.x = (canvas.width - paddleWidth) / 2;
    destroyCount = 0;
  }

  onPlayerLooseHandler(e) {
    console.log("PlayScreen.onPlayerLooseHandler(): \"" + e.detail.eventName + "\" Event handled");
    win = false;
    this.resetLevel();
    lives = 3;
  }

  onPlayerWinHandler(e) {
    console.log("PlayScreen.onWinningHangler(): \"onWinning\" Event handled");
    //win = true;
    this.resetLevel();
  }

  ballCollidesBrickHandler(e) {
    //console.log("PlayScreen.ballCollidesBrickHandle(): \"onballCollidesBrick\" Event handler");
    this.explosions.push(new Explosion(e.detail.brick.x, e.detail.brick.y, colour));
    dy = -dy;
    e.detail.brick.destroy();
    score++;
    destroyCount++;
    if (this.isLevelClear()) {
      win = true;
      /*const onPlayerWinEvt = new CustomEvent("onPlayerWin", {
        detail: {
          message: "Congratulations! YOU WON"
        }
      });
      console.log("PlayScreen.ballCollidesBrickHandle(): \"onPlayerWin\" Event dispatched");
      canvas.dispatchEvent(onPlayerWinEvt);*/
    }
  }
  
  isLevelClear(){
   return destroyCount == brickRowCount * brickColumnCount;
  }
}

/****************************************************/
/*************END GAME STATES***********************/
/**************************************************/
class World {
  constructor() {
    this.stateManager = new StateManager();
    this.beginMode = new StartScreen();
    this.playMode = new PlayScreen();
    this.pauseMode = new PauseScreen();
    this.endMode = new EndScreen();

    this.stateManager.addState("Open", this.beginMode);
    this.stateManager.addState("Play", this.playMode);
    this.stateManager.addState("Paused", this.pauseMode);
    this.stateManager.addState("End", this.endMode);

    this.stateManager.StartState = "Open";


    canvas.addEventListener("onPlayerWin", e => this.onPlayerWinHandler(e), false);
    canvas.addEventListener("onPlayerLoose", e => this.onPlayerLooseHandler(e), false);
    canvas.addEventListener("onSpacePressed", e => this.spacePressedHandler(), false);
  }

  draw() {
    this.stateManager.CurrentState.obj.draw();
  }

  update() {
    if ("update" in this.stateManager.CurrentState.obj) {
      this.stateManager.CurrentState.obj.update();
    }

    if (!document.hasFocus() && this.stateManager.CurrentState.name == "Play") {
      this.stateManager.makeTransition("Paused");
    }
  }

  onPlayerWinHandler(e) {
    console.log("World.onWinningHangler(): \"onWinning\" Event handled");
    console.log("World.onWinningHangler(): " + e.detail.message);
    this.stateManager.makeTransition("End");
  }

  onPlayerLooseHandler(e) {
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

/**
 * Render the game and start the game loop
 */
var simpleBreakout = new World();

function renderFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  simpleBreakout.draw();
  simpleBreakout.update();
  requestAnimationFrame(renderFrame);
}

renderFrame();
