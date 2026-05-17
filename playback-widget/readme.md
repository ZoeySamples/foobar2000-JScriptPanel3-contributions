## Requirements

1. Make sure JScript Panel is installed in foobar2000. I have included the download to the component on the root directory.
2. Download all the support files and place them in the appropriate locations.
3. AppData files will go in your JScript Panel 3 AppData custom folder that you created, as specified in the parent directory.
4. Icons and other image files will go in a location of your choosing.
5. Edit the script to work with your monitor specifications, file locations, and layout names and preferences. (Right click > Configure...) All the lines you will need to edit will be preceded by the commented line: `// ***USER INPUT NEEDED***` and followed by `// ***USER INPUT END***`. Make sure you read each of these lines and edit them as needed.
6. The `Switch monitor` and `Fullscreen` layout switch buttons will not work by default until you edit the script with your personal layout names and un-comment those lines. 
7. For album art to show up, you will need a file in your album folder called `cover.jpg`, as this is how the JScript Panel 3 helper scripts are designed. I suggest using files around 1400p to 2000p, as larger files may cause lag.

## Features

Adapts to user-input resolution and monitor orientation
Subtle blurred album art colors behind panel
Playback button presses have a button-press animation
Use scroll wheel to change volume if hovering over playback widget
Volume level shows briefly on volume change, before vanishing
Click and drag seekbar or volume slider
Ability to switch layouts with the buttons in the corner, if layouts are configured correctly
Shuffle button that toggles appearance when selecting it
Automatically changing fontsize to make room for longer titles
