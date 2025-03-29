import {Player} from "@minecraft/server";
import { ReplayCraft2F } from "../ui/replayCraft2F";
import { ReplayCraft2D } from "../ui/replayCraft2D";
import { ReplayCraft2E } from "../ui/replayCraft2E";
import { ReplayCraft2C } from "../ui/replayCraft2C";
import { ReplayCraft2B } from "../ui/replayCraft2B";
import { ReplayCraft2A } from "../ui/replayCraft2A";


export class ReplayStateMachine {
    state: string;
    states: { [key: string]: (player: Player) => void };

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
    handleRecStartRep(player: Player) {
        ReplayCraft2F(player);
    }
    handleViewStartRep(player: Player) {
        ReplayCraft2D(player);
    }
    handleRecCompleted(player: Player) {
        ReplayCraft2F(player);
    }
    handleRecCamSetup(player: Player) {
        ReplayCraft2E(player);
    }
    handleRecSaved(player: Player) {
        ReplayCraft2D(player);
    }
    handleRecPaused(player: Player) {
        ReplayCraft2C(player);
    }
    handleRecPending(player: Player) {
        ReplayCraft2B(player);
    }
    handleDefault(player: Player) {
        ReplayCraft2A(player);
    }
    setState(newState: string) {
        if (this.states[newState]) {
            this.state = newState;
        } else {
            this.state = "default";
        }
    }
    handleEvent(player: Player) {
        if (this.states[this.state]) {
            this.states[this.state](player);
        } else {
            this.handleDefault(player);
        }
    }
}