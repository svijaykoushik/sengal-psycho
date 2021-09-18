import { Brick } from "./brick";
import { Coordinate } from "../Math/coordinate";
import { globals } from "../globals";
import { UnbreakableBrick } from "./unbreakable-brick";

/**
 * Level
 **/
export class Level {
    bricks: Brick[];
    lifeCount: number;
    columnCount: number;
    rowCount: number;

    constructor(
        tileData: number[][],
        topOffset: number,
        leftOffset: number,
        padding: number,
        width: number,
        height: number
    ) {
        //console.log("Level(" + tileData + ", " + topOffset + ", " + leftOffset + ", " + padding + ", " + width + ", " + height);
        this.bricks = [];
        this.lifeCount = 0;
        this.columnCount = tileData.length;
        this.rowCount = tileData[0].length;
        globals.brickWidth = (width / this.rowCount) - padding;
        globals.brickHeight = (height / this.columnCount) - padding;
        /*brickWidth = width / this.rowCount;
        brickHeight = height/ this.columnCount;*/
        //console.log("Level.leftOffset/Level.rowCount= "+ofLeft);
        for (var c = 0; c < this.columnCount; c++) {
            for (var r = 0; r < this.rowCount; r++) {
                if (tileData[c][r] != 0) {
                    var brickX = (r * (globals.brickWidth + padding)) + leftOffset;
                    var brickY = (c * (globals.brickHeight + padding)) + topOffset;
                    /*var brickX = (r * brickWidth) + leftOffset;
                    var brickY = (c * brickHeight) + topOffset;*/
                    if (tileData[c][r] == 1) {
                        this.bricks.push(new UnbreakableBrick(new Coordinate(brickX, brickY), globals.brickWidth, globals.brickHeight))
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
                        this.bricks.push(new Brick(new Coordinate(brickX, brickY), globals.brickWidth, globals.brickHeight, colour));
                        this.lifeCount++;
                    }
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (var i = 0; i < this.bricks.length; i++) {
            if (this.bricks[i].status == 1 || this.bricks[i].status == -1) {
                this.bricks[i].draw(ctx);
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