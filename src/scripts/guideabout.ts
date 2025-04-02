import { Player } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

export function guideAbout(player: Player) {
    const aboutForm = new ui.ActionFormData()
        .title("§9ReplayCraft Cinematic Menu Info")
        .button("Okay!")
        .body(`This is Cinematic Menu of ReplayCraft, which you can access using an "§gStick§r" named "§gCinematic§r".

As the name suggests, it's packed with options to help you create amazing cinematic shots of your Minecraft world. The feature is stable and works smoothly, making it easy to use.

You can add position frames to create a path for the camera to follow, and tweak various camera settings like ease, timing, and more.

\n`);
    return new Promise((resolve, reject) => {
        aboutForm.show(player).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}




export function rcInfo(player: Player) { //Info Replay Start Menu 
    const aboutForm = new ui.ActionFormData()
        .title("§9Important Info [Must Read]")
        .button("Okay!")
        .body(`This is the Replay Menu of ReplayCraft, accessible using a §gStick§r named §gReplay§r.

The Replay Menu is a newly added feature in ReplayCraft v2, allowing you to record player movements in the background and replay them to create cinematic scenes.

Simply start the recording, build or do whatever you want, and everything will be recorded in the background. Afterward, you can set up cinematic camera paths to create stunning visuals of the replay. There are plenty of features available, which you can find in the §gKey Features§r menu.

§6Note:-§r§b The cinematic menu/mechanic of ReplayCraft is stable, but the Replay menu/mechanic is new and not yet fully capable of recording everything.

It works best for recording while you're building, and its main purpose for now is to capture your building process in the background, which it does wonderfully.

Rest assured, I will continue improving it, and who knows - one day it might be powerful enough to record entire gameplay. For now, though, it excels when you're focused on building.§r

Thank you for downloading & using ReplayCraft!
- §6DarkBlock Gaming

\n`);
    return new Promise((resolve, reject) => {
        aboutForm.show(player).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export function keyFeatures(player: Player) {
	const aboutForm = new ui.ActionFormData()
        .title("§9ReplayCraft Replay Menu Info")
        .button("Okay!")
        .body(`Here are some key features of the ReplayCraft v2.0.0 replay menu.

§2§lKey Features List -§r
- Option to preview your recording.
- Multiple preview types.
- Different replay modes.
- Custom names for replay players.
- Custom skins for replay players.
- Variety of camera types.
- Adjustable replay speed.
- Unlimited playbacks.
- Easy camera setup.
- And much more...

§2§lKey Features Explained -§r
You can preview your replay/recording immediately after capturing it.

There are different preview types, such as Default and Ghost Preview. In Ghost Preview, the player is invisible, and blocks are placed automatically, creating a cool visual effect.

You can give the replay entity any custom name, including your own, or even disable the name entirely.

Built-in options let you select different skins for the replay player, like Steve or Alex. You can also add up to 4 custom skins by putting your skins the the ReplayCraft resource pack.

Various camera types are available, such as Free Cam and Cinematic, with more options planned for future updates.

You can adjust the replay/preview speed to make your replays even cooler, a feature that really stands out.

Replays and previews can be played back an infinite number of times.

The cinematic camera setup is incredibly easy, and you can see everything visually as you set it up.

There are many more features to discover while using this add-on.

\n`);
    return new Promise((resolve, reject) => {
        aboutForm.show(player).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}
