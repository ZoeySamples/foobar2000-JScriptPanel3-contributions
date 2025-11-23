In order to use these scripts, you'll need to do a few things.

1. Make sure JScript Panel is installed in foobar2000. I have included the
   download to the component on the root directory.
2. Download the icons I've provided, or make your own, and put them in a place
   you can remember*.
3. Download images-smaller-art.js from this folder, and place it in this
   folder:
   - Open Windows Explorer and type "%AppData%" (without quotes) in your
     search bar.
   - go to:
     Roaming\foobar2000-v2\user-components-x64\foo_jscript_panel3\custom\
   - This custom folder will not exist by default in your JScript Panel
     download, so you must add it manually.
4. Copy the code from any of the fullscreen widget scripts into a JScript
   Panel in your instance foobar2000.
5. *Go to the lines in the code that say "var folder_name = " and replace it
   with the path to your icons. There will be two locations you need to
   edit - one with the playback buttons and one for the layout buttons.
6. Go to the lines in the code that correspond to the layout buttons,
   switch_monitor, and browse. These are each linked to a specific layout that
   I created in foobar2000. If you want to link them to a layout that you created,
   then you will have to edit the button's command in the buttons.update function.
   - The buttons work with the line that says: "fb.RunMainMenuCommand(View/Layout/..."
   - This is the line you will need to change to suit your needs. Replace the Layout
     name with one you have in your copy of foobar2000.
   - Alternatively, you can remove the "switch layout" buttons entirely.
7. Press OK, and the widget should be working. You may want to tweak some
   of the parameters to your liking.
