import { ReplayCraft2A } from "../functions/ui/ReplayCraft2A";
import { ReplayCraft2B } from "../functions/ui/ReplayCraft2B";
import { ReplayCraft2C } from "../functions/ui/ReplayCraft2C";
import { ReplayCraft2D } from "../functions/ui/ReplayCraft2D";
import { ReplayCraft2E } from "../functions/ui/ReplayCraft2E";
import { ReplayCraft2F } from "../functions/ui/ReplayCraft2F";


export class ReplayStateMachine {
    constructor() {
        this.state = "default";
        this.states = {
            "recStartRep": this.handleRecStartRep.bind(this),
            "viewStartRep": this.handleViewStartRep.bind(this),
            "recCompleted": this.handleRecCompleted.bind(this),
            "recCamSetup": this.handleRecCamSetup.bind(this),
            "recSaved": this.handleRecSaved.bind(this),
            "recPaused": this.handleRecPaused.bind(this),
            "recPending": this.handleRecPending.bind(this),
            "default": this.handleDefault.bind(this)
        };
    }
    handleRecStartRep(player) {
        ReplayCraft2F(player);
    }
    handleViewStartRep(player) {
        ReplayCraft2D(player);
    }
    handleRecCompleted(player) {
        ReplayCraft2F(player);
    }
    handleRecCamSetup(player) {
        ReplayCraft2E(player);
    }
    handleRecSaved(player) {
        ReplayCraft2D(player);
    }
    handleRecPaused(player) {
        ReplayCraft2C(player);
    }
    handleRecPending(player) {
        ReplayCraft2B(player);
    }
    handleDefault(player) {
        ReplayCraft2A(player);
    }
    setState(newState) {
        if (this.states[newState]) {
            console.log(`[ReplayStateMachine] Changing state from "${this.state}" to "${newState}"`);
            this.state = newState;
        } else {
            console.log(`[ReplayStateMachine] Invalid state "${newState}", defaulting to "default"`);
            this.state = "default";
        }
    }
    handleEvent(player) {
        console.log(`[ReplayStateMachine] Handling event for state: "${this.state}"`);
        
        if (this.states[this.state]) {
            this.states[this.state](player);
        } else {
            console.log(`[ReplayStateMachine] State "${this.state}" is invalid, using default state.`);
            this.handleDefault(player);
        }
    }
    
}