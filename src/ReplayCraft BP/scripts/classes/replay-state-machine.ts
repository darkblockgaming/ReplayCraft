import { Player } from "@minecraft/server";
import { ReplayCraft2F } from "../ui/replaycraft-replay-menu";
import { ReplayCraft2D } from "../ui/replaycraft-preview-menu";
import { uiReplayCraftMainMenu } from "../ui/replaycraft-main-menu";
import { ReplayCraft2B } from "../ui/replaycraft-recording-menu";
import { ReplayCraft2C } from "../ui/replaycraft-pause-menu";
import { ReplayCraft2E } from "../ui/replaycraft-camera-menu";
import { saveToDB } from "../functions/replayControls/save-to-database";
import { respawnCameraEntities } from "../functions/camera/camera-load-from-database";
import { removeEntities } from "../functions/remove-entities";
import { PlayerReplaySession } from "../data/replay-player-session";

type ReplayState = "recStartRep" | "viewStartRep" | "recCompleted" | "recCamSetup" | "recSaved" | "recPaused" | "recPending" | "editingCameraPos" | "default";

type ReplayHandler = (player: Player, data?: unknown) => void;

export class ReplayStateMachine {
    public state: ReplayState;
    private nextData?: unknown;
    public states: Record<ReplayState, ReplayHandler>;

    constructor(private session: PlayerReplaySession) {
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
        uiReplayCraftMainMenu(player);
    }

    private handleEditingCameraPos(player: Player): void {
        const camIndex = this.session.currentEditingCamIndex;
        if (camIndex === -1) {
            player.sendMessage("§cNo camera point selected to edit.");
            if (this.session.soundCue) {
                player.playSound("note.bass");
            }
            return;
        }

        this.session.replayCamPos[camIndex].position = player.getHeadLocation();
        this.session.replayCamRot[camIndex].rotation = player.getRotation();
        this.session.currentEditingCamIndex = -1;

        saveToDB(player, this.session); // Optional: pass `this.session` if needed
        removeEntities(player, false);
        respawnCameraEntities(player);

        player.sendMessage(`§4[ReplayCraft] §fCamera point ${camIndex + 1} updated successfully.`);
        if (this.session.soundCue) {
            player.playSound("random.orb");
        }

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
            this.nextData = undefined;
        } else {
            this.handleDefault(player);
        }
    }
}
