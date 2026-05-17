## Requirements

### [Popup Panels component](https://www.foobar2000.org/components/view/foo_popup_panels)
### [Columns UI component](https://www.foobar2000.org/components/view/foo_ui_columns)

1. Make sure JScript Panel is installed in foobar2000. I have included the download to the component on the root directory.
2. Download the support file and place it in the JScript Panel 3 AppData custom folder that you created, as specified in the parent directory.
3. AppData files will go in your JScript Panel 3 AppData custom folder that you created, as specified in the parent directory.
4. Edit the script to work with your monitor specifications. (Right click > Configure...) All the lines you will need to edit will be preceded by the commented line: `// ***USER INPUT NEEDED***` and followed by `// ***USER INPUT END***`. Make sure you read each of these lines and edit them as needed.
5. For album art to show up, you will need a file in your album folder called `cover.jpg`, as this is how the JScript Panel 3 helper scripts are designed. I suggest using files around 1400p to 2000p, as larger files may cause lag.
6. For lyrics to show up, you must have the lyrics saved in the %UnsyncedLyrics% or %Unsynced Lyrics% metadata field. I use the OpenLyrics component to search and save lyrics automatically. If you do this, it should automatically populate in this widget.

## Features

### Automatically adapts to user-input resolution and monitor orientation
### Blurred album art colors in background
### Ability to scroll through the lyrics when hovering over the popup panel
