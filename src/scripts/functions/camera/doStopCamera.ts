
import { Player, system } from "@minecraft/server";
import { SharedVariables } from "../../main";
export function doStopCamera(player: Player) {
	player.camera.clear();
	//player.runCommand(`camera @s clear`);

	const timeOut1Id = SharedVariables.repCamTout1Map.get(player.id);
	timeOut1Id.forEach((timeOut1Id: number) => {
		system.clearRun(timeOut1Id);
	});
	SharedVariables.repCamTout1Map.delete(player.id);

	const timeOut2Id = SharedVariables. repCamTout2Map.get(player.id);
	timeOut2Id.forEach((timeOut2Id: number) => {
		system.clearRun(timeOut2Id);
	});
	SharedVariables.repCamTout2Map.delete(player.id);
}