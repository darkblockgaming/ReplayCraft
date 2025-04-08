
import * as ui from "@minecraft/server-ui";

import { Player } from "@minecraft/server";
import { doSaveReset } from "../functions/replayControls/doSaveReset";
import { deletePro } from "../functions/replayControls/deletePro";

export function cancelRec(player: Player) {
	const replayForm = new ui.ActionFormData()
		.title("dbg.rc1.title.replay.menu")
		.button("dbg.rc1.button.load.build.and.Reset") //0
		.button("dbg.rc1.button.delete.progress") //1
		.body("dbg.rc1.body.made.by.dbg");
	replayForm.show(player).then(result => {
		if (result.canceled) return;
		const actions = {
			0: () => doSaveReset(player),
			1: () => deletePro(player),
		};
		const selectedAction = actions[result.selection as keyof typeof actions];
		if (selectedAction) {
			selectedAction();
		}
	});
}