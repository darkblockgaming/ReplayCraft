import { Player } from "@minecraft/server";

export function removeEntities(player: Player, replayEntity:boolean,) {
	const dimension = player.dimension;
	let types: string[]
	if(replayEntity){
		types = ["dbg:replayentity_steve", "dbg:replayentity_alex"];
	}else
	{
		types = ["dbg:replayentity_steve", "dbg:replayentity_alex","dbg:rccampos"]
	}
	

	for (const type of types) {
		const entities = dimension.getEntities({ type });
		for (const entity of entities) {
			entity.remove();
		}
	}
}