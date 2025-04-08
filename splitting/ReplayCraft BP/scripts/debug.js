import { SharedVariables } from "./main";
import { system} from "@minecraft/server";
export function startDebug(){
system.runInterval(() => {
    console.log(JSON.stringify(Object.fromEntries(SharedVariables.replayBDataMap), null, 2));

}, 20);
};
