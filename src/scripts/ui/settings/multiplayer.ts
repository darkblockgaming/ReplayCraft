import { Player, world } from "@minecraft/server";
import { SharedVariables } from "../../data/replay-player-session";
import * as ui from "@minecraft/server-ui";

export function multiPlayersett(player: Player) {
    const session = SharedVariables.playerSessions.get(player.id);
    if (!session) {
        player.sendMessage(`§c[ReplayCraft] Error: No replay session found for you.`);
        return;
    }
    const availablePlayers = world.getPlayers();
    if (availablePlayers.length === 1) {
        session.multiPlayers = [];
        session.multiPlayers.push(player);
        if (session.textPrompt) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.no.other.players.available",
                    },
                ],
            });
        }
        player.playSound("note.bass");
        return;
    }
    const playerNames = availablePlayers.map((p, index) => `${index + 1}. ${p.name}`).join("\n"); // Add index before name

    const replaySettingsForm = new ui.ModalFormData()
        .title("dbg.rc1.title.multiplayer.settings")
        .toggle(`dbg.rc1.toggle.multiplayer.replay`, { defaultValue: session.multiToggle })
        .slider(`\nAvailable Players\n${playerNames}\n\nSelected Players`, 1, availablePlayers.length, {
            valueStep: 1,
            defaultValue: 1,
        });

    replaySettingsForm.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.please.click.submit",
                    },
                ],
            });
            player.playSound("note.bass");
            return;
        }
        if (response.formValues[1] === 1) {
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.you.have.to.select.multiple.players",
                    },
                ],
            });
            player.playSound("note.bass");
            return;
        }
        session.multiToggle = Boolean(response.formValues[0]);
        if (session.multiToggle === true) {
            session.multiPlayers = [];
            const selectedNumber = response.formValues[1];
            for (let i = 0; i < Number(selectedNumber); i++) {
                session.multiPlayers.push(availablePlayers[i]);
            }
            player.sendMessage(`§4[ReplayCraft] Â§aAdded ${selectedNumber} players to multiplayer replay.`);
            player.playSound("note.pling");
        }
        if (session.multiToggle === false) {
            session.multiPlayers = [];
            session.multiPlayers.push(player);
            player.sendMessage({
                rawtext: [
                    {
                        translate: "dbg.rc1.mes.multiplayer.replay.is.off",
                    },
                ],
            });
        }
    });
}
