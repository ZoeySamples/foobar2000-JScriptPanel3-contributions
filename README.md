## Overview
Here is where I will upload some scripts I've made for JScript Panel 3 in
foobar2000. The source code for each script is in its own subfolder with
the necessary source media to make it work. I have also included a copy of
the version of JScript Panel 3 that I use, since the project has been
abandoned.

I use the 64-bit version of foobar2000. I'm not sure if these scripts will
work in the 32-bit version.

## Requirements
[(Foobar2000 (64-bit))](https://www.foobar2000.org/windows)
[Popup Panels component](https://www.foobar2000.org/components/view/foo_popup_panels)
[Columns UI component](https://www.foobar2000.org/components/view/foo_ui_columns)
[JScript Panel 3 component, also included in this directory](https://web.archive.org/web/20241208095928/https://jscript-panel.github.io/docs/)

## How to Use My Widgets
1. Go into the desired subfolder and read any readme files.
2. JScript Panel 3 will use sample scripts from a folder stored in your AppData. Some of these files are referenced in my scripts, as well as some custom scripts. To make sure the widgets run, you'll have to go into your jscript_panel3 subfolder:Type %AppData% into your File Explorer Window. Then, click on foobar2000-v2 > user-components-64x > foo_jscript_panel3. Make a new folder, called `custom`. This is where you will copy and paste my support files.
3. Copy any .js support files and put those in the custom folder you added to the jscript_panel3 AppData folder.
4.  Copy any necessary media (I have a bunch of custom .png files in my scripts. Feel free to use those or make your own), and place them in a folder of your choosing. You will have to edit the paths of these folders in the widgets' JScript Panel 3 scripts!
5.  Copy the widget .js files and paste them into your JScript Panel 3 panels in your Columns UI layout.
6.  Edit any necessary information in the .js files, such as screen resolution, file paths, and other preferences. All of these settings will be very clearly commented in the .js files, so you should be able to find them if you read the scripts.
