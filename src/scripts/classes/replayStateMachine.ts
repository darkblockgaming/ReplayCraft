import { Player } from "@minecraft/server";
import { ReplayCraft2F } from "../ui/replayCraft2F";
import { ReplayCraft2D } from "../ui/replayCraft2D";
import { ReplayCraft2A } from "../ui/replayCraft2A";
import { ReplayCraft2B } from "../ui/replayCraft2B";
import { ReplayCraft2C } from "../ui/replayCraft2C";
import { ReplayCraft2E } from "../ui/replayCraft2E";
import { SharedVariables } from "../main";
import { saveToDB } from "../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../functions/camera/camera-load-from-database";
import { removeEntities } from "../functions/removeEntities";

type ReplayState = 
    | "recStartRep"
    | "viewStartRep"
    | "recCompleted"
    | "recCamSetup"
    | "recSaved"
    | "recPaused"
    | "recPending"
    |"editingCameraPos"
    | "default";

// Updated function signature to support optional extra data
type ReplayHandler = (player: Player, data?: unknown) => void;

export class ReplayStateMachine {
    public state: ReplayState;
    private nextData?: unknown;
    public states: Record<ReplayState, ReplayHandler>;

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
            editingCameraPos: this.handleEditingCameraPos.bind(this),
            default: this.handleDefault.bind(this),
        };
    }

    private handleRecStartRep(player: Player): void {
        ReplayCraft2F(player);
    }

    private handleViewStartRep(player: Player): void {
        ReplayCraft2D(player);
    }

    private handleRecCompleted(player: Player, data?: unknown): void {
        if (data === true) {
            ReplayCraft2E(player);
        } else {
            ReplayCraft2F(player);
        }
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
    private handleEditingCameraPos(player: Player): void {
        const camIndex = SharedVariables.currentEditingCamIndex;
        if (camIndex === -1) {
            player.sendMessage("§cNo camera point selected to edit.");
            if (SharedVariables.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }
    
        SharedVariables.replayCamPos[camIndex].position = player.getHeadLocation();
        SharedVariables.replayCamRot[camIndex].rotation = player.getRotation();
        SharedVariables.currentEditingCamIndex = -1;
        saveToDB(player);
        removeEntities(player, false);
        respawnCameraEntities(player);
    
        player.sendMessage(`§4[ReplayCraft] §fCamera point ${camIndex + 1} updated successfully.`);
        if (SharedVariables.soundCue) {
            player.playSound("random.orb");
        }
        
        // Return to default UI or a setup state if needed
        this.setState("recCamSetup");
        this.handleEvent(player);
    }

    public setState(newState: string, data?: unknown): void {
        if (this.states[newState as ReplayState]) {
            this.state = newState as ReplayState;
            this.nextData = data;
        } else {
            this.state = "default";
            this.nextData = undefined;
        }
    }

    public handleEvent(player: Player): void {
        const handler = this.states[this.state];
        if (handler) {
            handler(player, this.nextData);
            this.nextData = undefined; // clear after use
        } else {
            this.handleDefault(player);
        }
    }
}
