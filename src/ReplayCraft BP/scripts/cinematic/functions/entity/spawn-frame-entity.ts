import { Entity, Player, VanillaEntityIdentifier, Vector2, Vector3 } from "@minecraft/server";
import { CinematicType } from "../../data/types/types";

export function spawnFrameEntity(player: Player, pos: Vector3, rot: Vector2, index: number, cinematicType: CinematicType): Entity {
    const entity = player.dimension.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, pos);

    if (cinematicType === "panoramic") {
        entity.nameTag = `Anchor Point`;
        entity.setProperty("rc:skin", 2);
    } else if (cinematicType === "path_placement") {
        // stable numbering based on index
        entity.nameTag = `Frame: ${index + 1}`;
        entity.setProperty("rc:skin", 1);
    }

    entity.setProperty("rc:rot_x", rot.x);
    entity.setProperty("rc:rot_y", rot.y);
    entity.addTag("cinematicOwner:" + player.id);
    return entity;
}
