/**
 * Vector 2d 
 */
export class Vector {

    protected _x: number;
    protected _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    set x(val) {
        this._x = val;
    }

    set y(val) {
        this._y = val;
    }

    get length() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    add(vector: Vector) {
        return new Vector(this._x + vector.x, this._y + vector.y);
    }

    subtract(vector: Vector) {
        return new Vector(this._x - vector.x, this._y - vector.y);
    }

    divide(scalar: number) {
        return new Vector(this._x / scalar, this._y / scalar);
    }

    dotProduct(vector: Vector) {
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

    static clamp(val: Vector, min: Vector, max: Vector) {
        var _x, _y;
        _x = Math.max(min.x, Math.min(val.x, max.x));
        _y = Math.max(min.y, Math.min(val.y, max.y));
        return new Vector(_x, _y);
    }
}