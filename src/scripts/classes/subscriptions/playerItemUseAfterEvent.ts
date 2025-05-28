import { ItemUseAfterEvent, world } from "@minecraft/server";
import { SharedVariables } from "../../main";

function setController(eventData: ItemUseAfterEvent){
    const player = eventData.source;
    
    if (
        eventData.itemStack?.typeId === 'minecraft:stick' &&
        /^(Replay|replay|REPLAY|ReplayCraft2|replaycraft2|REPLAYCRAFT2|Replaycraft2)$/.test(eventData.itemStack.nameTag)
    ) {
        if (player === SharedVariables.dbgRecController || !SharedVariables.dbgRecController) {
            console.warn(`[Replay Init] ${player.name} is setting up as controller.`);

            SharedVariables.multiPlayers.forEach((player) => {
                if (!SharedVariables.replayBDataMap.has(player.id)) {
                    console.warn(`[Replay Init] Initializing data for ${player.name} (${player.id})`);

                    SharedVariables.replayBDataMap.set(player.id, {
                        dbgBlockData: {}
                    });
                    SharedVariables.replayBDataBMap.set(player.id, {
                        dbgBlockDataB: {}
                    });
                    SharedVariables.replayBData1Map.set(player.id, {
                        dbgBlockData1: {}
                    });
                    SharedVariables.replayPosDataMap.set(player.id, {
                        dbgRecPos: []
                    });
                    SharedVariables.replayRotDataMap.set(player.id, {
                        dbgRecRot: []
                    });
                    SharedVariables.replayMDataMap.set(player.id, {
                        isSneaking: [],
        				isSwimming: [],
        				isClimbing: [],
        				isFalling: [],
        				isFlying: [],
        				isGliding: [],
        				isRiding: [],
        				isSprinting: [],
        				isSleeping: []
                    });
                    SharedVariables.replayODataMap.set(player.id, {
                        customEntity: undefined
                    });
                    SharedVariables.replaySDataMap.set(player.id, {
                        weapon1: [],
                        weapon2: [],
                        armor1: [],
                        armor2: [],
                        armor3: [],
                        armor4: []
                    });

                    console.warn(`[Replay Init] Data maps set for ${player.name}`);
                } else {
                    console.log(`[Replay Init] ${player.name} already initialized`);
                }
            });

            SharedVariables.replayStateMachine.handleEvent(player);
        } else {
            player.sendMessage(`${SharedVariables.dbgRecController.name} is controlling the replay.`);
        }
    }
}

const replaycraftItemUseAfterEvent = () => {
    world.afterEvents.itemUse.subscribe(setController);
};

export { replaycraftItemUseAfterEvent }
