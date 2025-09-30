import { Entity, Player, VanillaEntityIdentifier, Vector2, Vector3 } from "@minecraft/server";

export function spawnFrameEntity(player: Player, pos: Vector3, rot: Vector2, index: number, isFocusPoint: boolean = false): Entity {
    const entity = player.dimension.spawnEntity("dbg:rccampos" as VanillaEntityIdentifier, pos);

    if (isFocusPoint) {
        entity.nameTag = `Focus Point`;
        entity.setProperty("rc:skin", 2);
        entity.setProperty("rc:rot_x", 90);
        entity.setProperty("rc:rot_y", 0);
    } else {
        // stable numbering based on index
        entity.nameTag = `Frame: ${index + 1}`;
        entity.setProperty("rc:skin", 1);
        entity.setProperty("rc:rot_x", rot.x);
        entity.setProperty("rc:rot_y", rot.y);
    }

    entity.addTag("cinematicOwner:" + player.id);
    return entity;
}
