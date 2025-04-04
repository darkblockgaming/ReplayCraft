import { Player } from "@minecraft/server";
import { ReplayCraft2F } from "../ui/replayCraft2F";
import { ReplayCraft2D } from "../ui/replayCraft2D";
import { ReplayCraft2A } from "../ui/replayCraft2A";
import { ReplayCraft2B } from "../ui/replayCraft2B";
import { ReplayCraft2C } from "../ui/replayCraft2C";
import { ReplayCraft2E } from "../ui/replayCraft2E";


type ReplayState = 
    | "recStartRep"
    | "viewStartRep"
    | "recCompleted"
    | "recCamSetup"
    | "recSaved"
    | "recPaused"
    | "recPending"
    | "default";

export class ReplayStateMachine {
    public state: ReplayState;
    public states: Record<ReplayState, (player: Player) => void>;

    constructor() {
        this.state = "default";
        this.states = {
            recStartRep: this.handleRecStartRep.bind(this),
            viewStartRep: this.handleViewStartRep.bind(this),
            recCompleted: this.handleRecCompleted.bind(this),
            recCamSetup: this.handleRecCamSetup.bind(this),
            recSaved: this.handleRecSaved.bind(this),
            recPaused: this.handleRecPaused.bind(this),
            recPending: this.handleRecPending.bind(this),
            default: this.handleDefault.bind(this),
        };
    }

    private handleRecStartRep(player: Player): void {
        ReplayCraft2F(player);
    }

    private handleViewStartRep(player: Player): void {
        ReplayCraft2D(player);
    }

    private handleRecCompleted(player: Player): void {
        ReplayCraft2F(player);
    }

    private handleRecCamSetup(player: Player): void {
        ReplayCraft2E(player);
    }

    private handleRecSaved(player: Player): void {
        ReplayCraft2D(player);
    }

    private handleRecPaused(player: Player): void {
        ReplayCraft2C(player);
    }

    private handleRecPending(player: Player): void {
        ReplayCraft2B(player);
    }

    private handleDefault(player: Player): void {
        ReplayCraft2A(player);
    }

    public setState(newState: string): void {
        if (this.states[newState as ReplayState]) {
            this.state = newState as ReplayState;
        } else {
            this.state = "default";
        }
    }

    public handleEvent(player: Player): void {
        if (this.states[this.state]) {
            this.states[this.state](player);
        } else {
            this.handleDefault(player);
        }
    }
}
