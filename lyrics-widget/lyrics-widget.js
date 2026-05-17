// ==PREPROCESSOR==
// @name "Fullscreen Lyrics"
// @author "scarbles"
// @contributors "marc2003"
// @import "lodash"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\common.js"
// @import "%fb2k_component_path%samples\js\panel.js"
// @import "%fb2k_component_path%custom\images-blur.js"
// ==/PREPROCESSOR==

// Use and distibute this script freely as you see fit. To get it to work,
// make sure you've added the `images-blur.js` script to your %AppData%
// folder, as described on Github. Then, go to (Ctrl+F) every line labeled:
//
//     ***USER INPUT NEEDED***
//
// and change the information accordingly.

// ***USER INPUT NEEDED***
// Set your resolution here
var resolution = 1080;
var monitor_orientation = "portrait"  // "landscape" or "portrait"
// ***USER INPUT END***

var res_factor = resolution/1080;

if (monitor_orientation == "landscape") {
	var line_limit_factor = 0.6;
} else {
	var line_limit_factor = 1;
}

var stopped = true;
var hide_clutter = false;
var show_special_buttons = false;

var numlines;
var lyrics_now;
var scroll_text = "";
var start = 0;
update_lyrics();

var panel = new _panel();
var images = new _images();

var ww = 0, wh = 0;

var colours = {
	light : RGB(240, 240, 240),
	dark : RGB(0, 0, 0),
};

var panel = new _panel();

panel.item_focus_change();

function on_mouse_wheel(delta) {
	if (delta < 0) {
		start = start + 1;
	} else {
		start = start - 1;
	}
	update_lyrics();
	window.Repaint();
}

function on_metadb_changed(handles, fromhook) {
	if (fromhook)
		return;

	images.metadb_changed();
	update_lyrics();
}

function update_lyrics() {
	lyrics1 = fb.TitleFormat('[%UnsyncedLyrics%]')
	lyrics2 = fb.TitleFormat('[%Unsynced Lyrics%]')

	if (lyrics1.Eval() > lyrics2.Eval()) {
		lyrics = lyrics1.Eval()
	} else {
		lyrics = lyrics2.Eval()
	}
	
	numlines = lyrics.split(/\r\n|\r|\n/).length;
	
	if (monitor_orientation == "landscape") {
		if (start > (numlines - 25)) {
			start = numlines - 25
		}
		if (start < 0) {
			start = 0
		}
		lyrics_now = lyrics,
		delimiter = '\n',
		tokens = lyrics.split(delimiter).slice(start, start+24),
		lyrics_now = tokens.join(delimiter);
	}
	if (monitor_orientation == "portrait") {
		if (start > (numlines - 40)) {
			start = numlines - 40
		}
		if (start < 0) {
			start = 0
		}
		
		lyrics_now = lyrics,
			delimiter = '\n',
			tokens = lyrics.split(delimiter).slice(start, start+39),
			lyrics_now = tokens.join(delimiter);
	}
}

function on_paint(gr) {
	// Display image of album art
	panel.paint(gr);
	images.paint(gr);
	update_lyrics();
	
	if (numlines <= 30*line_limit_factor) {
		fontsize = 14*res_factor
	} else if (numlines > 40*line_limit_factor) {
		fontsize = 12*res_factor
	} else {
		fontsize = 13*res_factor
	}
	font = CreateFontString("Segoe UI", fontsize, 700)
	
	gr.WriteText(lyrics_now, font, colours.dark, 0.05*ww, wh*0.05, 0.9*ww, wh*0.90, 2, 2);
}

function on_playback_dynamic_info_track(type) {
	if (type == 0) {
		images.playback_new_track();
	}
}

function on_playback_new_track() {
	panel.item_focus_change();
	images.playback_new_track();
	update_lyrics();
	stopped = false;
	window.Repaint();
}

function on_playback_starting() {
	panel.item_focus_change();
	images.playback_new_track();
	update_lyrics();
	stopped = false;
	window.Repaint();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
	stopped = true;
	update_lyrics();
	window.Repaint();
}

function on_size() {
	panel.size();
	wh = window.Height;
	ww = window.Width;
}