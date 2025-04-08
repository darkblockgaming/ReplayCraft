import { Block, Player } from "@minecraft/server";
import { SharedVariables } from "../main";

export function saveDoorParts1(block: Block, player: Player) {
	const isUpper = block.permutation.getState("upper_block_bit");
	if (!isUpper) {
		const lowerPart = {
			location: block.location,
			typeId: block.typeId,
			states: block.permutation.getAllStates()
		};
		const upperPartLocation = {
			x: block.location.x,
			y: block.location.y + 1,
			z: block.location.z
		};
		const upperPartBlock = block.dimension.getBlock(upperPartLocation);
		const upperPart = {
			location: upperPartLocation,
			typeId: upperPartBlock.typeId,
			states: upperPartBlock.permutation.getAllStates()
		};
		const playerData = SharedVariables.replayBData1Map.get(player.id);
		playerData.dbgBlockData1[SharedVariables.dbgRecTime] = {
			lowerPart,
			upperPart
		};
	}
}