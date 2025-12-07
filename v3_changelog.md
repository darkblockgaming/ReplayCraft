# **ReplayCraft v3.0.0 Changelog**

---

---

# **Replay Changes 🎥**

---

"Replay Menu Chnages"

---

# **Cinematic Changes 📸**

---

# **Cinematic Menu Changes**

---

## **Constant Speed Upgrade**

- In older versions, speed changed based on the distance between frames, causing speed to vary between different camera points.
- In this version, speed is consistent across the entire path, giving smoother and more reliable motion.

## **Entity-based Frames**

- Frame particles have been replaced with an entity-based frame system that shows both the **position** and **facing direction** of each frame.  
  This greatly improves clarity when building complex cinematic paths.

## **New Cinematic Types**

- The existing **Path Cinematic** type has been heavily improved, and new cinematic types have been added:
    - Path Cinematic
    - Panoramic Cinematic (New)
    - Orbital Cinematic (New)

## **New UI Flow System**

- The UI system has been reorganized. Instead of one cluttered UI, a new **Multi-UI** flow system has been added.
- Everything now begins with a main menu. Based on your selections and cinematic type, new UIs appear, making the workflow simpler and more intuitive.

---

## **More about UI-flow and new Cinematics**

### 1. **Cinematic Type Selection Menu**

- This is the first menu. Here:
    - You choose what kind of cinematic you want to create:
    - Each type has its own dedicated menus.
    - You must give your cinematic a **unique name** so it can be saved permanently.

- You can also **Load** and **Delete** previously saved cinematic setups.

---

### 2. **Path Cinematic Menus**

The Path Cinematic now uses a new **multi-menu system**, making it easier to use and simpler to expand in the future.

#### Camera Path Creation Menu

Used for building and adjusting the camera path.

- **Add & manage frames:**
    - Place frames (camera points) to define the path.
    - A dedicated **Manage Frames** submenu allows you to:
        - Remove all frames
        - Remove the last (most recent) frame
        - Selectively remove any frame (advanced option)
        - More editing tools planned for future versions

- **Preview cinematic:**  
  Quickly test your path and make adjustments before final playback.

- **Frame settings:**  
  Currently includes **preview speed**, with more options coming later.

#### Camera Playback Menu

This is the final menu for camera playback and similar options.

- **Camera Settings:**
    - **Camera Speed:**
        - Previously, speed depended on the time between frames, which changed based on distance.
        - It now uses a **constant movement speed**, giving consistent motion along the entire path.
        - The unit of speed is **blocks/second**.

    - **Easing:**  
      Controls how the camera accelerates and slows between points.

    - **Rotation Modes:**
        - Focus on a specific player
        - Custom X/Y rotation
        - Use rotation saved in each frame (default)

---

### 3. **Panoramic Cinematic Menu (New)**

A brand new cinematic type for smooth rotational/panoramic shots.

- **Anchor Point Placement:**  
  Place a center point where the camera gets fixed and rotates.

- **Rotation Direction:**  
  Choose clockwise or anticlockwise rotation.

- **Rotation Speed:**  
  Rotation speed can be customized in Rotations-Per-Minute (RPM).

---

### 4. **Orbital Cinematic Menu (New)**

A more dynamic version of panoramic shots, ideal for character or build showcases.

- **Focus Point Placement:**  
  The camera automatically stays focused on this point and rotates around it following a customizable orbit.

- **Rotation Direction:**  
  Choose clockwise or anticlockwise rotation.

- **Camera Offset:**  
  Move the camera up or down from the focus point (while maintaining the focus).

- **Camera Radius:**  
  Move the camera closer or farther from the focus point to control the orbit size.

- **Orbit Speed:**  
  Fully adjustable.

---

Overall, the new cinematic system is cleaner, easier to navigate, and more powerful. With path placement, panoramic, and orbital cinematic types, you can now create a wider range of shots with better control and a more intuitive UI.

---
