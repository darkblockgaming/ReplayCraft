<img src="Media\logo.webp" alt="ReplayCraft">

!> This documentation could change with any version. So be sure to check it once in a while.

ReplayCraft is a Minecraft Bedrock Edition addon that enables players to record, replay, and create cinematic sequences of in-game actions such as block placement, adjustments, and destruction. Designed with content creators and collaborative builders in mind, ReplayCraft provides a powerful toolset to capture builds and showcase them in dynamic, multiplayer-supported replays.

### Key Features
- Block Event Recording
ReplayCraft captures player interactions such as:

- Block placement

- Block adjustments (e.g. rotation, orientation)

- Block destruction

### Cinematic Camera Control
Players can define camera points to guide a cinematic camera path during replay. These points can be used to simulate flyovers, zooms, and pans for a polished video capture.

### Multiplayer Support
Replays can record and render actions from multiple players, preserving collaborative builds and shared experiences.

### Single Operator Control
While multiplayer is supported, control of the replay playback and camera positioning is limited to a single player at a time to prevent conflicts.

### Session Storage
All replay data is stored in a persistent database, allowing sessions to be saved, reloaded, and replayed later.

### Build Playback Workflow
During replay:

- 1. Blocks from the original session are removed.

- 2. A specialized playback entity replaces them one-by-one in recorded order.

- 3. This simulates the build happening in real-time, ideal for screen recording and content creation.

