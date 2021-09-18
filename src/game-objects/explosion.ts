import { Coordinate } from "../Math/coordinate";
import { BrickParticles } from "./brick-particles";


/**
 * Particle Explosion system
 */
export class Explosion {
    private pos: Coordinate;
    private colour: string;
    private particles: BrickParticles[];
    private particleCount: number;
    private completed: boolean;

    constructor(position: Coordinate, colour: string) {
        this.pos = position;
        this.colour = colour;
        this.particles = [];
        this.particleCount = 30;
        this.completed = false;
        while (this.particleCount--) {
            this.particles.push(new BrickParticles(this.pos, this.colour));
        }
    }

    draw(context: CanvasRenderingContext2D) {
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