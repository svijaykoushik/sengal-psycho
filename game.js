/**
 * GLOBALS
 */
var canvas = document.getElementById("myCanvas"),
  ctx = canvas.getContext("2d"),
  colour = "#0095DD",
  font = "20px VT323",
  ballRadius = 7,
  x = canvas.width / 2,
  y = canvas.height - 30,
  dx = 2,
  dy = -2,
  paddleHeight = 7,
  paddleWidth = 75,
  paddleX = (canvas.width - paddleWidth) / 2,
  rightPressed = false,
  leftPressed = false,
  brickRowCount = 5,
  brickColumnCount = 3,
  brickWidth = 75,
  brickHeight = 20,
  brickPadding = 2,
  brickOffsetTop = 30,
  brickOffsetLeft = 15,
  score = 0,
  lives = 3,
  gameOver = false,
  win = false,
  destroyCount = 0,
  lifeCount = 0;

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

  static clamp(val, minVal, maxVal) {
    return Math.max(minVal, Math.min(val, maxVal));
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
 * Vector 2d 
 */
class Vector {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get length() {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  add(vector) {
    return new Vector(this._x + vector.x, this._y + vector.y);
  }

  subract(vector) {
    return new Vector(this._x - vector.x, this._y - vector.y);
  }

  divide(scalar) {
    return new Vector(this._x / scalar, this._y / scalar);
  }

  dotProduct(vector) {
    return this._x * vector.x + this._y * vector.y;
  }

  normalize() {
    var mag = this.length,
      normalizedVector = null;
    if (mag > 0) {
      normalizedVector = this.divide(mag);
    }
    return normalizedVector;
  }

  static clamp(val, min, max) {
    var _x, _y;
    _x = Math.max(min.x, Math.min(val.x, max.x));
    _y = Math.max(min.y, Math.min(val.y, max.y));
    return new Vector(_x, _y);
  }
}

/**
 * Cooridante Vector 2D
 */
class Coordinate extends Vector {
  constructor(x, y) {
    super(x, y)
  }

  distanceTo(coordinate) {
    var xDifference = coordinate.x - this._x;
    var yDifference = coordinate.y - this._y;
    return Math.sqrt(xDifference * xDifference + yDifference * yDifference);
  }
}

/**
 * Ball
 */
class Ball {
  constructor(center, radius) {
    this.center = center;
    this.r = radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
  }

  move(velocity) {
    this.center = this.center.add(velocity);
  }
}

/**
 * Paddle
 */
class Paddle {
  constructor(startCoordinate, width, height) {
    this.start = startCoordinate;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.start.x, this.start.y, this.width, this.height);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
  }

  move(paddleX) {
    this.start = paddleX;
  }
}

/**
 * Brick
 */
class Brick {
  constructor(startCoordinate, width, height, colour) {
    this.start = startCoordinate;
    this.width = width;
    this.height = height;
    this.status = 1;
    this.colour = colour
  }

  draw() {
    ctx.beginPath();
    ctx.rect(this.start.x, this.start.y, this.width, this.height);
    ctx.fillStyle = this.colour;
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
 * Unbreakable Brick
 */
class UnbreakableBrick extends Brick {
  constructor(startCoordinate, width, height) {
    super(startCoordinate, width, height);
    this.status = -1;
    this.colour = "#de9400"; //orange
  }

  draw() {
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

/**
 * Level
 **/
class Level {
  constructor(tileData, topOffset, leftOffset, padding, width, height) {
    //console.log("Level(" + tileData + ", " + topOffset + ", " + leftOffset + ", " + padding + ", " + width + ", " + height);
    this.bricks = [];
    this.lifeCount = 0;
    this.columnCount = tileData.length;
    this.rowCount = tileData[0].length;
    brickWidth = (width / this.rowCount) - padding;
    brickHeight = (height / this.columnCount) - padding;
    /*brickWidth = width / this.rowCount;
    brickHeight = height/ this.columnCount;*/
    //console.log("Level.leftOffset/Level.rowCount= "+ofLeft);
    for (var c = 0; c < this.columnCount; c++) {
      for (var r = 0; r < this.rowCount; r++) {
        if (tileData[c][r] != 0) {
          var brickX = (r * (brickWidth + padding)) + leftOffset;
          var brickY = (c * (brickHeight + padding)) + topOffset;
          /*var brickX = (r * brickWidth) + leftOffset;
          var brickY = (c * brickHeight) + topOffset;*/
          if (tileData[c][r] == 1) {
            this.bricks.push(new UnbreakableBrick(new Coordinate(brickX, brickY), brickWidth, brickHeight))
          } else if (tileData[c][r] > 1) {
            var colour = "";
            switch (tileData[c][r]) {
              case 2:
                colour = "#7600de";
                break;
              case 3:
                colour = "#de0098";
                break;
              case 4:
                colour = "#de0025";
                break;
              case 5:
                colour = "#89de00";
                break;
              default:
                colour = "#0095DD";
            }
            this.bricks.push(new Brick(new Coordinate(brickX, brickY), brickWidth, brickHeight, colour));
            this.lifeCount++;
          }
        }
      }
    }
  }

  draw() {
    for (var i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].status == 1 || this.bricks[i].status == -1) {
        this.bricks[i].draw();
      }
    }
  }

  get LifeCount() {
    return this.lifeCount;
  }

  reviveLevel() {
    for (var i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].status == 0) {
        this.bricks[i].status = 1;
      }
    }
  }
}

/**
 * Text component in the game
 */
class Text {
  constructor(position, text) {
    this.pos = position;
    this.text = text;
    this.font = font;
    this.alignment = "start";
    this.colour = colour;
  }

  draw() {
    ctx.textAlign = this.alignment;
    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.fillText(this.text, this.pos.x, this.pos.y);
  }

  update(text) {
    this.text = text;
  }
}

/**
 *Brick Particles
 */
class BrickParticles {
  constructor(position, colour) {
    this.pos = position;
    this.angle = Helper.random(0, Math.PI * 2); // choose an angle between 0 to 360
    this.speed = Helper.random(1, 10);
    this.friction = 0.95;
    this.gravity = 2;
    /*this.red = colour.red;
    this.green = colour.green;
    this.blue = colour.blue;*/
    this.colour = colour;
    this.alpha = 1;
    this.decay = Helper.random(0.015, 0.03);
    this.side = Helper.random(1, 5);
  }

  draw(context) {
    context.beginPath();
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x + this.side, this.pos.y + this.side);
    context.lineTo(this.pos.x, this.pos.y + 2 * this.side);
    context.lineTo(this.pos.x - this.side, this.pos.y + this.side);
    //context.fillStyle = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
    context.fillStyle = this.colour;
    context.closePath();
    //set the alpha value of the particle to global context
    context.globalAlpha = this.alpha;

    context.fill();
    // reset the global context  alpha to opaque to prevent other component drawings fade away
    context.globalAlpha = 1;
  }
  update() {
    this.speed *= this.friction;
    var x = Math.cos(this.angle) * this.speed;
    var y = Math.sin(this.angle) * this.speed + this.gravity;
    //console.log("BrickParticles.update(): before update position (" + this.pos.x +", "+ this.pos.y+")");
    this.pos = this.pos.add(new Coordinate(x, y));
    // console.log("BrickParticles.update(): position (" + this.pos.x +", "+ this.pos.y+")");
    this.alpha -= this.decay;
  }
}
/**
 * Particle Explosion system
 */

class Explosion {
  constructor(position, colour) {
    this.pos = position;
    this.colour = colour;
    this.particles = [];
    this.particleCount = 30;
    this.completed = false;
    while (this.particleCount--) {
      this.particles.push(new BrickParticles(this.pos, this.colour));
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
    this.title = new Text(new Coordinate(canvas.width / 2, (canvas.height / 2) - 10), "Simple Breakout");
    this.instruction = new Text(new Coordinate(canvas.width / 2, canvas.height - 50), "Press space to start");

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
    this.title = new Text(new Coordinate(canvas.width / 2, (canvas.height / 2) - 10), "Paused!");
    this.score = new Text(new Coordinate(canvas.width / 2, canvas.height / 2 + 30), "Score: " + score);
    this.instruction = new Text(new Coordinate(canvas.width / 2, canvas.height - 50), "Press space to resume");

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
    this.title = new Text(new Coordinate(canvas.width / 2, 50), "Congratulations!");
    this.score = new Text(new Coordinate(canvas.width / 2, canvas.height / 2 + 30), "Score: " + score);
    this.instruction = new Text(new Coordinate(canvas.width / 2, canvas.height - 50), "Press space to quit");

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
    this.score = new Text(new Coordinate(8, 20), "Score: ");
    this.lives = new Text(new Coordinate(canvas.width - 70, 20), "Lives: ");
    this.explosions = [];
    this.levels = [];

    for (var i = 0; i < levels.length; i++) {
      var l = new Level(levels[i], brickOffsetTop, brickOffsetLeft, brickPadding, canvas.width - (2 * brickOffsetLeft), (canvas.height - brickOffsetTop) / 2);
      this.levels.push(l);
    }

    this.ball = new Ball(new Coordinate(x, y), ballRadius);
    this.paddle = new Paddle(new Coordinate(paddleX, canvas.height - paddleHeight), paddleWidth, paddleHeight);
    this.currentLevel = 0;

    this.Direction = {
      UP: 0,
      LEFT: 1,
      DOWN: 2,
      RIGHT: 3
    };

    canvas.addEventListener("onPlayerLoose", e => this.onPlayerLooseHandler(e), false);
    canvas.addEventListener("onPlayerWin", e => this.onPlayerWinHandler(e), false);
    canvas.addEventListener("onBallCollidesBrick", e => this.ballCollidesBrickHandler(e), false);
    canvas.addEventListener("onLevelComplete", e => this.levelCompleteHandler(), false);
  }

  draw() {
    this.levels[this.currentLevel].draw();
    this.ball.draw();
    this.paddle.draw();
    this.score.draw();
    this.lives.draw();
  }

  collisionDetection() {
    var b, distC, cornerDistance, xCollision, yCollision, cornerCollision, bCenter, CDTuple;
    for (var i = 0; i < this.levels[this.currentLevel].bricks.length; i++) {
      b = this.levels[this.currentLevel].bricks[i];
      if (b.status == 1 || b.status == -1) {
        CDTuple = this.checkCollision(this.ball, b);
        if (CDTuple.hasCollided) {

          /* creating and dispatching custom event*/
          const ballCollidesBrick = new CustomEvent("onBallCollidesBrick", {
            detail: {
              brick: b,
              direction: CDTuple.direction
            }
          });
          canvas.dispatchEvent(ballCollidesBrick);
        }
      }
    }
  }

  checkCollision(circle, rectangle) {
    var C, halfExtents, B, D, clampedVal, oppositeHalfExtents, P, _D, collisionDirection = -1,
      tempStatus;
    C = new Coordinate(circle.center.x, circle.center.y);
    halfExtents = new Vector(rectangle.width / 2, rectangle.height / 2);
    B = new Coordinate(rectangle.start.x + halfExtents.x, rectangle.start.y + halfExtents.y);
    D = C.subract(B);
    oppositeHalfExtents = new Vector(-rectangle.width / 2, -rectangle.height / 2)
    clampedVal = Vector.clamp(D, oppositeHalfExtents, halfExtents);
    P = B.add(clampedVal);
    _D = P.subract(C);
    tempStatus = _D.length < circle.r;
    /**
     * Determine direction of collision
     */
    if (tempStatus) {
      collisionDirection = this.findDirectionOfCollision(_D);
    }

    return {
      hasCollided: tempStatus,
      direction: collisionDirection
    };
  }

  findDirectionOfCollision(targetVector) {
    /*
     * Normalised array of vectors pointing to all
     * four directions of 2D plane
     */
    var compass = [
      new Vector(0, 1), //up
      new Vector(1, 0), //left
      new Vector(0, -1), //down
      new Vector(-1, 0) //right
    ];

    var max = 0,
      bestMatch = -1,
      dotProduct = null,
      normalizedTarget = targetVector.normalize();

    if (normalizedTarget == null) {
      return bestMatch;
    }

    for (var i = 0; i < compass.length; i++) {
      dotProduct = normalizedTarget.dotProduct(compass[i]);
      if (dotProduct > max) {
        max = dotProduct;
        bestMatch = i;
      }
    }
    return bestMatch;
  }

  update() {
    this.collisionDetection();
    if (this.ball.center.x + dx > canvas.width - this.ball.r || this.ball.center.x + dx < this.ball.r) {
      dx = -dx;
    }
    if (this.ball.center.y + dy < this.ball.r) {
      dy = -dy;
    } else if (this.ball.center.y + dy > canvas.height - this.ball.r) {
      if (this.ball.center.x > this.paddle.start.x && this.ball.center.x < this.paddle.start.x + this.paddle.width) {
        dy = -Math.abs(dy);
      } else {
        lives--;
        if (!lives) {
          //creating and dispatching custom event
          const onPlayerLooseEvt = new CustomEvent("onPlayerLoose", {
            detail: {
              eventName: "onPlayerLoose",
              message: "Ha! Ha! You Loose!"
            }
          });
          console.log("PlayScreen.update(): \"onPlayerLoose\" Event dispatched");
          canvas.dispatchEvent(onPlayerLooseEvt);

        } else {
          this.ball.center = new Coordinate(canvas.width / 2, canvas.height - 30);
          dx = 3;
          dy = -3;
          this.paddle.start = new Coordinate((canvas.width - paddleWidth) / 2, this.paddle.start.y);
        }
      }
    }

    if (rightPressed && this.paddle.start.x < canvas.width - this.paddle.width) {
      paddleX += 7;
    } else if (leftPressed && this.paddle.start.x > 0) {
      paddleX -= 7;
    }

    this.paddle.move(new Vector(paddleX, this.paddle.start.y));

    this.ball.move(new Vector(dx, dy));

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
        if (this.levels.length != 0) {
          const lvlComplete = new CustomEvent("onLevelComplete");
          console.log("PlayScreen.update(): \"onLevelComplete\" Event dispatched");
          canvas.dispatchEvent(lvlComplete);
        } else {
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
  }

  resetLevel() {
    this.ball.center = new Coordinate(canvas.width / 2, canvas.height - 30);
    dx = 3;
    dy = -3;
    this.paddle.start = new Coordinate((canvas.width - paddleWidth) / 2, this.paddle.start.y);
    destroyCount = 0;
  }

  onPlayerLooseHandler(e) {
    console.log("PlayScreen.onPlayerLooseHandler(): \"" + e.detail.eventName + "\" Event handled");
    win = false;
    this.resetLevel();
    lives = 3;
    this.currentLevel = 0;
    //score = 0;
    this.reviveLevels();
  }

  onPlayerWinHandler(e) {
    console.log("PlayScreen.onWinningHangler(): \"onWinning\" Event handled");
    this.currentLevel = 0;
    this.resetLevel();
    this.reviveLevels();
  }

  ballCollidesBrickHandler(e) {
    //console.log("PlayScreen.ballCollidesBrickHandle(): e.detail.brick.colour" + e.detail.brick.colour);
    var brick = e.detail.brick;
    var direction = e.detail.direction;
    /*Collision resolution*/
    switch (direction) {
      case this.Direction.UP:
        dy = -Math.abs(dy);
        break;
      case this.Direction.RIGHT:
        dx = Math.abs(dx);
        break;
      case this.Direction.DOWN:
        dy = Math.abs(dy);
        break;
      case this.Direction.LEFT:
        dx = -Math.abs(dx);
        break;
    }
    if (brick.status == 1) {
      this.explosions.push(new Explosion(new Coordinate(brick.start.x, brick.start.y), brick.colour));
      brick.destroy();
      score++;
      destroyCount++;
    }
    if (this.isLevelClear()) {
      win = true;
    }

    //console.log("Life Count: " + this.levels[this.currentLevel].LifeCount + " & Destroy Count: " + destroyCount);
  }

  isLevelClear() {
    return destroyCount == this.levels[this.currentLevel].LifeCount;
  }

  levelCompleteHandler() {
    if (this.currentLevel < this.levels.length) {
      this.currentLevel++;
      this.resetLevel();
    } else {

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

  reviveLevels() {
    for (var i = 0; i < this.levels.length; i++) {
      var l = this.levels[i];
      l.reviveLevel();
    }
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
