-- Cinematic Menu Changes

Restructured the old single ui based cluttered cinematic feature/mechanism into a multi ui flow based system.  now it is much easier to understand, use and manage.

the core uis are divided into two seperate uis, camera placement/path creation menu and cameraq playback nenu. the path creation menu contains options to add camera frames and manage them to create a path for the cinematic camera to follow that path. there is a seperate option to manage frames in this menu where you can mamage frame/camera points such as removing all or last/most recently placed frame or a newly added advanced option to selective;y remove any frame in your camera path more options will be added in this manage frames submenu in future versions

in this stage you can also preview and get a reough idea of how your cinmatic will look and make changes to the path accordingly, in this menu you will also find option of frame settinsg which currently only allows you to change preview speed but more features will be added in future versions

after this if you have placed enough frames (2+) then you can move forwrd to the new menu which is camera playback menu

in this menu you will be able to start the camera and camewra will follow the path you have created. here you can find camera settings where you will be able to change or configure stuff related to camera. such as the time it takes the camera to move from one point to point another which directly affetcs the speed of teh camera which is also affected by the distance between two points, you will also be able to chnage the ease of the camera which affects how the spped of the camera chnages throughout its motion between two points. you also have some other optiosn such as to select how camera rotations worjks throughout the cinematic, you can make it focus on a pllayer or set a custom x and y rotation or let it be default which makes the camera follow the rotatons saved in the path for each frame

other important chnages, previously the each frame in a camera path were represented by some customisable particles but has been removed and replaced by much better entity system. now each frame is represented by an entity which also not only represent the position of the frame but also its rotaton or the facing direction of that particular frame making it much easier to visualise where that frame is facing
