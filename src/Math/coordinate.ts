import { Vector } from "./vector";

/**
 * Cooridante Vector 2D
 */
export class Coordinate extends Vector {
    constructor(x: number, y: number) {
        super(x, y)
    }

    distanceTo(coordinate: Coordinate) {
        var xDifference = coordinate.x - this._x;
        var yDifference = coordinate.y - this._y;
        return Math.sqrt(xDifference * xDifference + yDifference * yDifference);
    }
}