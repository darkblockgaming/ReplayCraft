import { Player } from "@minecraft/server";

export function removeEntities(player: Player) {
	const dimension = player.dimension;
	const entities1 = dimension.getEntities({
		type: "dbg:replayentity"
	});
	entities1.forEach(entity1 => {
		entity1.remove();
	});
	const entities2 = dimension.getEntities({
		type: "dbg:rccampos"
	});
	entities2.forEach(entity2 => {
		entity2.remove();
	});
}