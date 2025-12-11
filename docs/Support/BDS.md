<img src="Media\logo.webp" alt="ReplayCraft"> </img>

<div>
  <h2>Bedrock Dedicated Servers</h2>
Some of the more advanced in-game debugging commands included with ReplayCraft require the @minecraft/debug-utilities module.
By default, this module is disabled on Bedrock Dedicated Servers (BDS), so you must enable it manually.

!>Note: This change is required for certain ReplayCraft debugging features to work.

## How to Enable @minecraft/debug-utilities
This guide assumes you already have an active BDS instance with all the relevant files. 

### 1. Go to the configuration folder
> config/default/permissions.json
### 2. Open the file
Use any text editor: Notepad, VS Code, nano, etc.
It will look something like this:
> ```
>{
>  "allowed_modules": [
>    "@minecraft/server-gametest",
>    "@minecraft/server",
>    "@minecraft/server-ui",
>    "@minecraft/server-admin",
>    "@minecraft/server-editor"
>  ]
>}
> ```


### 3. Add the Debug Utilities module

Insert the following line inside 

>"@minecraft/debug-utilities"

Your configuration should now look like this:

> ```
>{
>  "allowed_modules": [
>    "@minecraft/server-gametest",
>    "@minecraft/server",
>    "@minecraft/server-ui",
>    "@minecraft/server-admin",
>    "@minecraft/server-editor",
>    "@minecraft/debug-utilities"
>  ]
>}
> ```

### 4. Save the file & restart the server

Once restarted, the module will be active.
</div>

