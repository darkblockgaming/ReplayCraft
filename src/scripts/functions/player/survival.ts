import { GameMode, Player } from "@minecraft/server";

export function enableFlight(player: Player) {
    let coordsx = player.location.x;
    let coordsy = player.location.y;
    let coordsz = player.location.z;
    player.addTag("freecamcoords" + coordsx + " " + coordsy + " " + coordsz);
    player.addTag("freecam");
    player.setGameMode(GameMode.spectator);
    player.sendMessage(`§4[ReplayCraft] §fMove to the required position and then type ?add to add a camera point.`);
    return;
}

export function disableFlight(player: Player) {
    player.removeTag("freecam");
    player.setGameMode(GameMode.survival);
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        console.log(tags[i]);
        if (tags[i].startsWith("freecamcoords")) {
            let coordsTag = tags[i];
            console.log("Grabbed Tag: " + coordsTag[i]);
            player.removeTag(coordsTag);
            coordsTag = coordsTag.replace("freecamcoords", "");
            console.log("replaced tag: " + coordsTag);
            const coordsArray = coordsTag.trim().split(" ").map(Number);
            const coordsTagAsVector3 = { x: coordsArray[0], y: coordsArray[1], z: coordsArray[2] };
            player.teleport(coordsTagAsVector3);
            return;
        }
    }
}
