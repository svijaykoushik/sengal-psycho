import { Coordinate } from "../Math/coordinate";
import { Helper } from "../Math/helper";


/**
 *Brick Particles
 */
export class BrickParticles {
    private pos: Coordinate;
    private angle: number;
    private speed: number;
    private friction: number;
    private gravity: number;
    private colour: string;
    private side: number;

    alpha: number;
    decay: number;

    constructor(position: Coordinate, colour: string) {
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

    draw(context: CanvasRenderingContext2D) {
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
        this.pos = this.pos.add(new Coordinate(x, y)) as Coordinate;
        // console.log("BrickParticles.update(): position (" + this.pos.x +", "+ this.pos.y+")");
        this.alpha -= this.decay;
    }
}