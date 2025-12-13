<img src="Media\logo.webp" alt="ReplayCraft"> </img>
# Debug Mode
Replaycraft has some commands that are locked behind debug mode. These allow you to debug what issues you maybe facing with Replycraft running in your environment this is mainly used in server environments where you have multiple people connected and possibly using Replaycraft at the same time. Enabling debug mode prints data to the server console by default this is switch off and you must edit the file inside the behavior pack.

!>You may be asked to enable debug mode by one of the developers. 
## Enabling debug mode
To enable debug mode you will need to edit the config.js file, this can be found here: 
>ReplayCraft_BP\scripts\replay\data\util\config.js

Open the file using any text editor: Notepad, VS Code, nano, etc. all options will be disabled by default. The developer may ask you to enable certain flags depending on the issue you are facing but to access the debug slash commands you will need to set these two values to true.
> ```
>devChatCommands: true,
>debugEnabled: true,
> ``` 

Now reboot the server and you should have access to the debug commands. 
## Database UI command
`/database` presents a UI for the database system used by Replaycraft. You can view the overall size for each database as well as explore the data.  
## Listdatabase command
`/listdatabase` prints the given database to the servers console it requires a parameter being the database name which you can find a list here
## Printsessiondata command
`/printsessiondata` prints the session data to the console the session data is a live set of maps that Replycraft uses this data is saved back to the database when saving and pulls from the database when loading a replay. This is how you can see whats happening at a given time with the data.
## Debugmemory command
`/debugmemory` enables a overlay of data this is sent to the action bar and provides realtime data that each addon is using within the scripting engine this can indicate which addon is consuming the 2GB script engine limit. 
