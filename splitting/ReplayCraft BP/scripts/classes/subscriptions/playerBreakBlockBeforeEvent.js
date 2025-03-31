import { SharedVariables } from "../../main";

//@ts-check
function recordBlocks(event) {
    if (SharedVariables.replayStateMachine.state === "recPending") {
        const {
            player,
            block
        } = event;
        if (!SharedVariables.multiPlayers.includes(player)) return;
        if (block.typeId === "minecraft:bed" || twoPartBlocks.includes(block.type.id)) {
            if (block.typeId === "minecraft:bed") {
                saveBedParts1(block, player);
            } else {
                saveDoorParts1(block, player);
            }
        } else {
            const playerData = SharedVariables.replayBData1Map.get(player.id);
            playerData.dbgBlockData1[SharedVariables.dbgRecTime] = {
                location: block.location,
                typeId: block.typeId,
                states: block.permutation.getAllStates()
            };
            //dbgBlockData1[SharedVariables.dbgRecTime] = { location: block.location, typeId: block.typeId, states: block.permutation.getAllStates() };
        }
    }
};


const replaycraftBreakBlockBeforeEvent = () => {
    world.beforeEvents.playerBreakBlock.subscribe(recordBlocks)
};

export { replaycraftBreakBlockBeforeEvent };