<p align="center">
  <img src="assets/replaycraft-text-logo.webp" alt="ReplayCraft Text & Icon Logo" />
</p>

<p align="center">
<b>ReplayCraft</b> is a powerful Minecraft Bedrock Edition add-on that enables players to record and replay their in-game actions, similar to the popular ReplayMod for Java Edition. Whether you want to capture your best builds, or create cinematic replays, ReplayCraft makes it easy to record, play back, and analyze gameplay directly within Minecraft Bedrock Edition.
</p>
<p align="center">
ReplayCraft now utilizes the <b>2.0.0-Beta server</b> and <b>2.0.0-Beta server-ui APIs</b>, enhancing compatibility and performance for Minecraft Bedrock.
</p>

---

## ⬇️ 2.1.0-beta Changelog

## 🚀 Key Changes
- Complete Codebase Restructure:
We’ve restructured the entire codebase from a single large file into modular components. This not only improves performance but also makes future development and maintenance significantly easier.

- Migration to TypeScript:
ReplayCraft is now written in TypeScript, enabling better tooling, type safety, and reliability across the project.

- Open Source under GPL-3.0:
ReplayCraft is now open source! The project is licensed under the GPL-3.0, allowing the community to contribute and extend the project freely.

## ✨ New Features
- Big Build Mode:
ReplayCraft can now record and replay structures that exceed the currently loaded chunk area. This is perfect for large-scale builds that span far beyond your visible range.

- Persistent Storage:
Replays are now saved in a database, enabling players to pause and resume replay sessions across multiple game sessions.

- Multi-Session Support:
Players can now manage multiple replays. When creating a new session, you’ll be prompted to name it. Later, you can browse and select any saved session to resume or playback.

- HUD Toggle Setting:
A new setting allows you to toggle HUD elements on or off during replay playback, giving more control over your visual experience.

- Improved Compatibility:
We've replaced actionbar feedback with chat-based messages. This change improves compatibility with other Minecraft Bedrock Add-Ons and ensures a smoother user experience.

---

## ⬇️ Download

# [Download v2.1.0-beta](https://darkblockgaming.github.io/addons/replaycraft/)
### For Minecraft Bedrock 1.21.7x only 

---

## ✅ Installation

1. [Download](https://darkblockgaming.github.io/addons/replaycraft/) the latest **ReplayCraft `.mcaddon`** file.  
2. Open the file with **Minecraft Bedrock Edition** to install the add-on.  
3. In your world settings, enable **Experimental Features**, including:  
   - **Beta APIs**  
4. Make sure both the **Behavior Pack** and the **Resource Pack** are applied to your world.  

---

## 📚 ReplayCraft Documentation

After installing and activating the **ReplayCraft** add-on, open your Minecraft world and type `?rc` in the chat.  
You will receive **two important tools**:

## 1. **Replay Stick** 🎬 
Grants access to the full **Replay System**, including **recording**, **previewing**, and **camera setup**.

This system is broken down into **four core menus** which themselves may contain multiple menus:


### 🎮 A. Replay Menu
![Replay Menu Screenshot](<assets/screenshots/replay-menu.webp>)

This is the **starting point** for every replay.

#### **Start Recording**
- Begin recording your gameplay and building actions.
- Some actions (like certain block or entity interactions) aren't supported yet but will be in future updates.

#### **Name Your Recording**
![Name Recording Screenshot](<assets/screenshots/name-recording.webp>)
- You must name your recording when starting.
- Recordings are **saved permanently** and accessible even after closing the world/server.

#### **Multiplayer Support**
![Multiplayer Support Screenshot](<assets/screenshots/multiplayer-support.webp>)
- Enable multiplayer mode.
- Select which players to include — only their movements will be recorded.

#### **Load/Delete Recordings**
- **Load** any previously saved recording.
![Load Screenshot](<assets/screenshots/load-rec.webp>)
- **Delete** recordings you no longer need.
![Delete Screenshot](<assets/screenshots/delete-rec.webp>)

#### **Recording Controls**
- **Pause** and **resume** recording anytime.  
- **Save** when you're done to move forward.  
- **Cancel** recording if needed:  
  - Cancel and **keep** all placed/broken blocks.  
  - Cancel and **revert** everything to its original state.


### 🔍 B. Preview Menu  
![Preview Menu Screenshot](<assets/screenshots/preview-menu.webp>)

After saving your recording:

- Automatically enters a **Preview Mode** — replay plays without any cinematic camera so you can freely walk around and inspect.
- From here, you can:  
  - **Cancel** the recording.  
  - **Load** a different saved recording.


### 🎥 C. Camera Setup Menu  
![Camera Setup Menu Screenshot](<assets/screenshots/camera-setup-menu.webp>)

Once satisfied with your preview:

- Enter the **Camera Setup Menu**.
- Choose how to load frames:
  - Every tick (20 ticks = 1 second).
  ![Load Frame Tick Screenshot](<assets/screenshots/load-frame-tick.webp>)
  - Every second.
  ![Load Frame Sec Screenshot](<assets/screenshots/load-frame-sec.webp>)

#### **Placing Cameras**
- Add camera points at specific frames to form a smooth, cinematic path.
- Minimum **two camera points on two different frames** required.
- Visible camera markers help during setup.

#### **Camera Setup Options**
- **Save** the camera setup for future use.
- **Load** a saved setup for the current recording.
- Click **Proceed Further** once your camera path is ready.


### 🎞️ D. Final Replay Menu  
![Final Replay Menu Screenshot](<assets/screenshots/final-replay-menu.webp>)

This is the **final step** where your full cinematic replay comes to life.

#### **Start Replay**
- Begin the final playback with your full camera setup.
- For the best visuals:
  - Press `F1` to hide the HUD.
  - Use your device’s screen recording tools.

#### **Options & Controls**
- **Stop Replay** anytime.
- **Replay Settings** menu includes:
  - Camera type (cinematic, focus cam, etc.)
  - Camera easing styles
  - Player skin and name options
- **Go Back** to camera setup if you want to fix anything.
- **Load** another saved recording if needed.

#### **Preserve or Clear Build**
![Preserve Clear Screenshot](<assets/screenshots/preserve-clear.webp>)
After the replay:
- You can **preserve** the build you made.
- Or **clear** it completely and restore the original state.


### ⚙️ Replay Settings Overview  
![Replay Settings Screenshot](<assets/screenshots/replay-settings.webp>)

Powerful features to enhance your cinematic experience:

- **Camera Types**:
  - **Cinematic (Default):** Smooth path movement.
  - **Focus Cam:** Lock onto and follow a specific player from one position.
  - More camera types will be added in future versions.

- **Easing Styles:**
  - Change how smoothly the camera moves.
  - Includes linear, ease-in, ease-out, and more.

- **Skins & Names:**
  - Set **custom skins and names** for replayed players.
  - Currently, only one skin shared across all.
  - Place custom skins inside:  
    `resource_pack/textures/entity/custom_skins`
  ![Custom Skins Screenshot](<assets/screenshots/custom-skins.webp>)

> **Note:** This system is continuously evolving — stay tuned for updates and new features.

---

## 2. **Cinematic Stick** 📽️ 
This tool gives you access to a **standalone cinematic system** that works during **live gameplay** — no recording required.


### 🎥 Cinematic Menu Overview  
![Cinematic Menu Screenshot](<assets/screenshots/cinematic-menu.webp>)

Use this when you just want to create stunning camera paths **on the fly** — great for trailers, intros, or cutscenes.

#### **How It Works**
- In your **live world**, start placing camera points anywhere you want using the stick.
- The system will automatically build a smooth path between them.
- When ready, click **Start Camera** and the camera will follow the entire path.

#### **Camera Timing & Movement**  
- Customize the **time it takes** to move from one point to another.
- You can make fast cuts or slow cinematic pans depending on your style.

#### **Fully Customizable**
![Camera Settings Screenshot](<assets/screenshots/cinematic-settings.webp>)
- Choose from a wide range of camera settings:
  - Easing styles
  - Movement speed
  - Focus types
  - and much more!

#### **Camera Point Management**  
- Easily **add**, **remove**, or **adjust** camera points anytime.
- Full control over the entire timeline.

#### **Saved Automatically**
- Every camera frame and setting is saved **permanently** — even if you leave the world or reload.
- You can reuse, modify, or delete setups at any time.

---

## 🌐 Community Discord  
### Need assistance or have questions? Join our community on [Discord](https://discord.gg/zdG9Xwzudt).
