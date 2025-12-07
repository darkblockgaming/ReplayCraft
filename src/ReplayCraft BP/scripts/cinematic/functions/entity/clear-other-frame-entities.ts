import { Player } from "@minecraft/server";

export function clearOtherFrameEntities(player: Player) {
    //get all "dbg:rccampos" entities with tag ("cinematicOwner:" + player.id); and remove em
    
    const tag = "cinematicOwner:" + player.id;
    const entities = player.dimension.getEntities({
        type: "dbg:rccampos",
        tags: [tag]
    });
    for (const entity of entities) {
        entity?.remove();
    }
}
