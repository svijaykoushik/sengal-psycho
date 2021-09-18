import { StateBase } from "./game-states/StateBase";

/**
 * Simple state manager
 */
export class StateManager {
    private states: any;
    private startState: any;
    private currentState: any;
    private endState: any;
    constructor() {
        this.states = {};
        this.startState = null;
        this.currentState = null;
        this.endState = null;
    }

    addState(name: string, stateObj: StateBase) {
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

    set StartState(name: string) {
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

    makeTransition(nextStateName: string) {
        if (nextStateName in this.states) {
            this.currentState = this.states[nextStateName];
        } else {
            console.warn("Invalid state name " + nextStateName);
        }
    }
}