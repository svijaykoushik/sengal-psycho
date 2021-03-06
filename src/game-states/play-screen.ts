import { Ball } from "../game-objects/ball";
import { Brick } from "../game-objects/brick";
import { Explosion } from "../game-objects/explosion";
import { Level } from "../game-objects/level";
import { Paddle } from "../game-objects/paddle";
import { globals } from "../globals";
import { Coordinate } from "../Math";
import { Vector } from "../Math";
import { Text } from "../game-objects/text";
import { StateBase } from "./StateBase";


/**
 * Game Play
 */
export class PlayScreen extends StateBase {
    private score: Text;
    private lives: Text;
    private explosions: Explosion[];
    private levels: Level[];
    private ball: Ball;
    private paddle: Paddle;
    private currentLevel: number;
    private currentCombo: number;
    private prevCombo: number;
    private initialBallSpeed: Vector;
    private maxBallSpeed: number;

    constructor() {
        super();
        this.score = new Text(new Coordinate(8, 20), "Score: ");
        this.lives = new Text(new Coordinate(globals.canvas.width - 70, 20), "Lives: ");
        this.explosions = [];
        this.levels = [];

        for (var i = 0; i < globals.levelLayouts.length; i++) {
            var l = new Level(globals.levelLayouts[i], globals.brickOffsetTop, globals.brickOffsetLeft, globals.brickPadding, globals.canvas.width - (2 * globals.brickOffsetLeft), (globals.canvas.height - globals.brickOffsetTop) / 2);
            this.levels.push(l);
        }

        this.ball = new Ball(new Coordinate(globals.x, globals.y), globals.ballRadius);
        this.paddle = new Paddle(new Coordinate(globals.paddleX, globals.canvas.height - globals.paddleHeight), globals.paddleWidth, globals.paddleHeight);
        this.currentLevel = 0;
        this.currentCombo = 0;
        this.prevCombo = this.currentCombo;
        this.initialBallSpeed = new Vector(globals.dx, globals.dy);
        this.maxBallSpeed = 4;

        globals.canvas.addEventListener("onPlayerLoose", e => this.onPlayerLooseHandler(e as CustomEvent), false);
        globals.canvas.addEventListener("onPlayerWin", e => this.onPlayerWinHandler(e as CustomEvent), false);
        globals.canvas.addEventListener("onBallCollidesBrick", e => this.ballCollidesBrickHandler(e as CustomEvent), false);
        globals.canvas.addEventListener("onLevelComplete", e => this.levelCompleteHandler(), false);
        globals.canvas.addEventListener("onBallCollidesPaddle", e => this.onBallCollidesPaddleHandler(e as CustomEvent), false);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.levels[this.currentLevel].draw(ctx);
        this.ball.draw(ctx);
        this.paddle.draw(ctx);
        this.score.draw(ctx);
        this.lives.draw(ctx);
    }

    collisionDetection() {
        let b, CDTuple;
        for (var i = 0; i < this.levels[this.currentLevel].bricks.length; i++) {
            b = this.levels[this.currentLevel].bricks[i];
            if (b.status == 1 || b.status == -1) {
                CDTuple = this.checkCollision(this.ball, b);
                if (CDTuple.hasCollided) {

                    /* creating and dispatching custom event*/
                    const ballCollidesBrick = new CustomEvent<BallCollidesBrickEvent>("onBallCollidesBrick", {
                        detail: {
                            brick: b,
                            direction: CDTuple.direction
                        }
                    });
                    globals.canvas.dispatchEvent(ballCollidesBrick);
                }
            }
        }
        const paddleBallCDTuple = this.checkCollision(this.ball, this.paddle);
        if (paddleBallCDTuple.hasCollided) {
            const ballCollidesPaddle = new CustomEvent<BallCollidesPaddleEvent>("onBallCollidesPaddle", {
                detail: {
                    direction: paddleBallCDTuple.direction
                }
            });
            globals.canvas.dispatchEvent(ballCollidesPaddle);
        }
    }

    checkCollision(circle: Ball, rectangle: Paddle | Brick) {
        var C, halfExtents, B, D, clampedVal, oppositeHalfExtents, P, _D, collisionDirection = -1,
            tempStatus;
        C = new Coordinate(circle.center.x, circle.center.y);
        halfExtents = new Vector(rectangle.width / 2, rectangle.height / 2);
        B = new Coordinate(rectangle.start.x + halfExtents.x, rectangle.start.y + halfExtents.y);
        D = C.subtract(B);
        oppositeHalfExtents = new Vector(-rectangle.width / 2, -rectangle.height / 2)
        clampedVal = Vector.clamp(D, oppositeHalfExtents, halfExtents);
        P = B.add(clampedVal);
        _D = P.subtract(C);
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

    findDirectionOfCollision(targetVector: Vector) {
        /*
         * Normalized array of vectors pointing to all
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
        if (this.ball.center.x + globals.dx > globals.canvas.width - this.ball.r || this.ball.center.x + globals.dx < this.ball.r) {
            globals.dx = -globals.dx;
            this.resetCombo();
        }
        if (this.ball.center.y + globals.dy < this.ball.r) {
            globals.dy = -globals.dy;
            this.resetCombo();
        } else if (this.ball.center.y + globals.dy > globals.canvas.height - this.ball.r) {
            globals.lives--;
            this.resetCombo();
            if (!globals.lives) {
                //creating and dispatching custom event
                const onPlayerLooseEvt = new CustomEvent<PlayerLooseEvent>("onPlayerLoose", {
                    detail: {
                        eventName: "onPlayerLoose",
                        message: "Ha! Ha! You Loose!"
                    }
                });
                console.log("PlayScreen.update(): \"onPlayerLoose\" Event dispatched");
                globals.canvas.dispatchEvent(onPlayerLooseEvt);

            } else {
                this.ball.center = new Coordinate(globals.canvas.width / 2, globals.canvas.height - 30);
                this.resetBallSpeed();
                this.paddle.start = new Coordinate((globals.canvas.width - globals.paddleWidth) / 2, this.paddle.start.y);
            }
        }

        if (globals.rightPressed && this.paddle.start.x < globals.canvas.width - this.paddle.width) {
            globals.paddleX += 7;
        } else if (globals.leftPressed && this.paddle.start.x > 0) {
            globals.paddleX -= 7;
        } else {

            if (globals.mousePos.x > 0 && globals.mousePos.x < globals.canvas.width) {
                globals.paddleX = globals.mousePos.x - this.paddle.width / 2
            }
            if (globals.paddleX < 0) {
                globals.paddleX = 0;
            }
            if (globals.paddleX + this.paddle.width > globals.canvas.width) {
                globals.paddleX = globals.canvas.width - this.paddle.width;
            }
        }

        if (
            this.currentCombo !== 0 &&
            this.currentCombo % 4 == 0 &&
            this.currentCombo > this.prevCombo &&
            Math.abs(globals.dx) < this.maxBallSpeed &&
            Math.abs(globals.dy) < this.maxBallSpeed
        ) {
            console.log('prevCombo', this.prevCombo);
            console.log('Current combo', this.currentCombo);
            console.log(`Current ball speed (${globals.dx}, ${globals.dy})`);
            this.prevCombo = this.currentCombo;
            globals.dx > 1 ? globals.dx++ : globals.dx--;
            globals.dy > 1 ? globals.dy++ : globals.dy--;
            console.log(`New ball speed (${globals.dx}, ${globals.dy})`);
        }

        this.paddle.move(new Coordinate(globals.paddleX, this.paddle.start.y));

        this.ball.move(new Vector(globals.dx, globals.dy));

        this.score.update("Score: " + globals.score);

        this.lives.update("Lives: " + globals.lives);

        for (var i = 0; i < this.explosions.length; i++) {
            this.explosions[i].draw(globals.ctx);
            this.explosions[i].update();

            if (this.explosions[i].HasFaded) {
                this.explosions.splice(i, 1);
            }
        }
        if (this.isLevelClear()) {
            globals.dx = 0;
            globals.dy = 0;
            if (this.explosions.length < 1) {
                /* creating and dispatching custom event*/
                if (this.levels.length != 0) {
                    const lvlComplete = new CustomEvent("onLevelComplete");
                    console.log("PlayScreen.update(): \"onLevelComplete\" Event dispatched");
                    globals.canvas.dispatchEvent(lvlComplete);
                } else {
                    const onPlayerWinEvt = new CustomEvent("onPlayerWin", {
                        detail: {
                            message: "Congratulations! YOU WON"
                        }
                    });
                    console.log("PlayScreen.update(): \"onPlayerWin\" Event dispatched");
                    globals.canvas.dispatchEvent(onPlayerWinEvt);
                }
            }
        }
        // console.log('Combo', this.combo);
    }

    resetLevel() {
        this.ball.center = new Coordinate(globals.canvas.width / 2, globals.canvas.height - 30);
        this.paddle.start = new Coordinate((globals.canvas.width - globals.paddleWidth) / 2, this.paddle.start.y);
        globals.destroyCount = 0;
    }

    onPlayerLooseHandler(e: CustomEvent) {
        console.log("PlayScreen.onPlayerLooseHandler(): \"" + e.detail.eventName + "\" Event handled");
        globals.win = false;
        this.resetLevel();
        globals.lives = 3;
        this.currentLevel = 0;
        //score = 0;
        this.reviveLevels();
    }

    onPlayerWinHandler(e: CustomEvent) {
        console.log("PlayScreen.onWinningHangler(): \"onWinning\" Event handled");
        this.currentLevel = 0;
        this.resetLevel();
        this.reviveLevels();
    }

    ballCollidesBrickHandler(e: CustomEvent<BallCollidesBrickEvent>) {
        //console.log("PlayScreen.ballCollidesBrickHandle(): e.detail.brick.colour" + e.detail.brick.colour);
        var brick = e.detail.brick;
        var direction = e.detail.direction;
        /*Collision resolution*/
        switch (direction) {
            case Direction.UP:
                globals.dy = -Math.abs(globals.dy);
                break;
            case Direction.RIGHT:
                globals.dx = Math.abs(globals.dx);
                break;
            case Direction.DOWN:
                globals.dy = Math.abs(globals.dy);
                break;
            case Direction.LEFT:
                globals.dx = -Math.abs(globals.dx);
                break;
        }
        if (brick.status == 1) {
            this.explosions.push(new Explosion(new Coordinate(brick.start.x, brick.start.y), brick.colour));
            brick.destroy();
            globals.score++;
            globals.destroyCount++;
        }
        if (this.isLevelClear()) {
            globals.win = true;
        }
        this.currentCombo++;

        //console.log("Life Count: " + this.levels[this.currentLevel].LifeCount + " & Destroy Count: " + destroyCount);
    }

    onBallCollidesPaddleHandler(e: CustomEvent<BallCollidesPaddleEvent>): void {
        switch (e.detail.direction) {
            case Direction.UP:
                globals.dy = -Math.abs(globals.dy);
                break;
            case Direction.RIGHT:
                globals.dx = Math.abs(globals.dx);
                break;
            case Direction.DOWN:
                globals.dy = Math.abs(globals.dy);
                break;
            case Direction.LEFT:
                globals.dx = -Math.abs(globals.dx);
                break;
        }
        this.resetCombo();
        const paddleEndX = this.paddle.start.x + this.paddle.width;
        const paddleMiddleX = ((this.paddle.start.x + paddleEndX) / 2)

        console.log('Paddle', {
            x: this.paddle.start.x,
            width: this.paddle.width,
            middleX: paddleMiddleX
        });

        console.log('Ball', { x: this.ball.center.x });

        let diff = 0;
        const reboundFactor = 0.09;
        if (this.ball.center.x < paddleMiddleX) {


            /*when ball collides with the left part of the paddle
              change the ball direction to left;
            */
            diff = paddleMiddleX - this.ball.center.x;
            globals.dx = -Math.abs(reboundFactor * diff);
            console.log("Ball hit left side of paddle", globals.dx);
        } else if (this.ball.center.x > paddleMiddleX) {

            /*when ball collides with the right part of the paddle
              change the ball direction to right;
            */
            diff = this.ball.center.x - paddleMiddleX;
            globals.dx = Math.abs(reboundFactor * diff);
            console.log("Ball hit right side of paddle", globals.dx);
        }
        else {

            /*when ball collides exactly in the middle of the paddle
              change the ball direction to left or right randomly;
            */
            globals.dx = Math.round(Math.random()) > 0.5 ? Math.abs(globals.dx) : -Math.abs(globals.dx);
            console.log("Ball hit middle of paddle", globals.dx);
        }
    }

    isLevelClear() {
        return globals.destroyCount == this.levels[this.currentLevel].LifeCount;
    }

    levelCompleteHandler() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            this.resetLevel();
        } else {

            /* creating and dispatching custom event*/
            const onPlayerWinEvt = new CustomEvent<PlayerWinEvent>("onPlayerWin", {
                detail: {
                    message: "Congratulations! YOU WON"
                }
            });
            console.log("PlayScreen.update(): \"onPlayerWin\" Event dispatched");
            globals.canvas.dispatchEvent(onPlayerWinEvt);
        }
    }

    reviveLevels() {
        for (var i = 0; i < this.levels.length; i++) {
            var l = this.levels[i];
            l.reviveLevel();
        }
    }

    private resetCombo() {
        this.currentCombo = 0;
    }

    private resetBallSpeed() {
        globals.dx = this.initialBallSpeed.x;
        globals.dy = this.initialBallSpeed.y;
    }
}

interface BallCollidesBrickEvent {
    brick: Brick;
    direction: number;
}

interface BallCollidesPaddleEvent {
    direction: number;
}

interface PlayerWinEvent {
    message: string;
}

interface PlayerLooseEvent extends PlayerWinEvent {
    eventName: string;
}

enum Direction {
    UP = 0,
    LEFT = 1,
    DOWN = 2,
    RIGHT = 3
};
