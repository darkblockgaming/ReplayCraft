import { Player } from "@minecraft/server";

export function removeEntities(player: Player) {
	const dimension = player.dimension;
	const types = ["dbg:replayentity_steve", "dbg:replayentity_alex",  "dbg:rccampos"];

	for (const type of types) {
		const entities = dimension.getEntities({ type });
		for (const entity of entities) {
			entity.remove();
		}
	}
}