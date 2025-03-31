
import * as ui from "@minecraft/server-ui";
import { doSaveReset } from "../replayControls/doSaveReset";
import { deletePro } from "../replayControls/deletePro";

export function cancelRec(player) {
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
		const selectedAction = actions[result.selection];
		if (selectedAction) {
			selectedAction();
		}
	});
}