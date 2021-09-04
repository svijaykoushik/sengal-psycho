/**
 * GLOBALS
 */
var canvas = document.getElementById("myCanvas"),
  ctx = canvas.getContext("2d"),
  colour = "#0095DD",
  font = "16px Arial",
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
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
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
}

/**
 * Text component in the game
 */
class Text {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
  }

  draw() {
    ctx.font = font;
    ctx.fillStyle = colour;
    ctx.fillText(this.text, this.x, this.y);
  }

  update(text) {
    this.text = text;
  }
}

/**
 * Game World
 */
class World {
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
          b.status = 0;
          score++;
          if (score == brickRowCount * brickColumnCount) {
            alert("YOU WIN, CONGRATS!");
            document.location.reload();
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
          alert("GAME OVER");
          document.location.reload();
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
}


/**
 * Render the game and start the game loop
 */
var simpleBreakout = new World();

function renderFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  simpleBreakout.draw();
  if (document.hasFocus()) {
    simpleBreakout.update();
  }
  requestAnimationFrame(renderFrame);
}

renderFrame();
