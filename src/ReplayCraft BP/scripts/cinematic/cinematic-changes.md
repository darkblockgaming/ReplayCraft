
---

# Cinematic Menu Changes

The cinematic system has been completely restructured. Instead of one large, cluttered menu, it is now split into a **multi-UI flow**, making it much easier to understand, use, and manage.

### 1. **Camera Path Creation Menu**

This menu is used for building and adjusting the camera path.

* **Add & manage frames:** Place frames (camera points) to define the path. A new **Manage Frames** submenu lets you:

  * Remove all frames
  * Remove the last (most recent) frame
  * Selectively remove any frame (new advanced option)
  * Future versions will expand this menu with more editing features.

* **Preview cinematic:** Get a rough preview of how your cinematic will look and make adjustments before final playback.

* **Frame settings:** Currently allows you to set the **preview speed**. More frame-level options will be added later.

---

### 2. **Camera Playback Menu**

Once you have placed at least **two frames**, you can switch to playback. Here, the camera follows the path you built.

* **Camera Settings:**

  * **Camera Speed (Blocks per Second):**
    In older versions, speed was indirectly controlled by setting the *time it took to travel between two points*. This meant the actual speed varied depending on the distance between frames.

    Now, speed is defined as a **constant movement rate in blocks per second**. This ensures smooth and professional-looking motion, no matter how close or far apart your frames are.

    * Default: **0.8 blocks/sec**
    * Fully customizable by the player.

  * **Easing:** Choose how the camera accelerates and decelerates when moving between points.

  * **Rotation Modes:**

    * Focus on a specific player
    * Use a custom X/Y rotation
    * Default mode (camera follows the saved rotation of each frame)

---

## Other Improvements

* **Entity-based Frames:**
  Previously, frames were represented by particles. These have been replaced by entities that show both the **position** and **facing direction** of each frame. This makes it much easier to visualize the cinematic path and orientation.

* **Constant Speed Upgrade:**

  * Old System → Variable speeds, since travel time was fixed but distances varied.

  * New System → Constant speed across the whole path, measured in **blocks per second**, giving a smoother and more professional cinematic experience.

---

✨ Overall, the new cinematic menu is cleaner, easier to use, and produces higher-quality results thanks to constant speed playback and better frame visualization.

---

