/**
 * GLOBALS
 */
var canvas = document.getElementById("myCanvas"),
  ctx = canvas.getContext("2d"),
  colour = "#0095DD",
  font = "16px VT323",
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
  spacePressed = false,
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
    spacePressed = true;
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
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

/****************************************************/
/*****************GAME STATES***********************/
/**************************************************/

class StartScreen {
  constructor() {
    this.title = new Text(canvas.width / 2, (canvas.height / 2) - 10, "Sengal Psycho");
    this.instruction = new Text(canvas.width / 2, canvas.height - 50, "Press space to start");

    this.title.font = "40px VT323";
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

    this.title.font = "40px VT323";
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
  }
}

class EndScreen {
  constructor() {
    this.title = new Text(canvas.width / 2, 50, "Congratulations!");
    this.score = new Text(canvas.width / 2, canvas.height / 2 + 30, "Score: " + score);
    this.instruction = new Text(canvas.width / 2, canvas.height - 50, "Press space to quit");

    this.title.font = "40px VT323";
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
    this.lives = new Text(canvas.width - 65, 20, "Lives: ");
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
          dy = -dy;
          b.destroy();
          score++;
          destroyCount++;
          if (destroyCount == brickRowCount * brickColumnCount) {
            gameOver = true;
            win = true;
            this.resetLevel();
          }
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
          gameOver = true;
          win = false;
          this.resetLevel();
          lives = 3;
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
  }

  draw() {
    this.stateManager.CurrentState.obj.draw();
  }

  update() {
    if (spacePressed) {
      console.log("World.update(): The current state is " + this.stateManager.CurrentState.name);
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
      spacePressed = false;
    }

    if ("update" in this.stateManager.CurrentState.obj) {
      this.stateManager.CurrentState.obj.update();
    }

    if (!document.hasFocus() && this.stateManager.CurrentState.name == "Play") {
      this.stateManager.makeTransition("Paused");
    }

    if (gameOver) {
      this.stateManager.makeTransition("End");
      gameOver = false;
    }
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

