// ==PREPROCESSOR==
// @name "Fullscreen Widget"
// @author "scarbles"
// @contributors "marc2003"
// @import "lodash"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\common.js"
// @import "%fb2k_component_path%samples\js\seekbar.js"
// @import "%fb2k_component_path%samples\js\panel.js"
// @import "%fb2k_component_path%custom\images-smaller-art.js"
// ==/PREPROCESSOR==

// Use and distibute this script freely as you see fit. To get it to work,
// make sure you've added the `images-smaller-art.js` script to your %AppData%
// folder, as described on Github. Then, go to (Ctrl+F) every line labeled:
//
//     ***USER INPUT NEEDED***
//
// and change the information accordingly.

// ***USER INPUT NEEDED***
// Set your resolution here
var resolution = 1080;
var monitor_orientation = "landscape"  // "landscape" or "portrait"
// ***USER INPUT END***

var res_factor = resolution/1000;
if (monitor_orientation == "portrait") {
	var v_factor = 0.92;
	res_factor = res_factor*1.4
} else {
	var v_factor = 1.0;
}

var stopped = true;
var show_special_buttons = false;

var tfo = {
	playback_time : fb.TitleFormat('[%playback_time%]'),
	length : fb.TitleFormat('$if2(%length%,LIVE)'),
};

var info = {
	artist : fb.TitleFormat('[%artist%]'),
	title : fb.TitleFormat('[%title%]'),
};

var font = {
	big : CreateFontString("Segoe UI", 15*res_factor, 700),
	small : CreateFontString("Segoe UI", 12*res_factor, 700),
	tiny : CreateFontString("Segoe UI", 10*res_factor, 700),
};

var colours = {
	light : RGB(240, 240, 240),
	dark : RGB(0, 0, 0),
	text_background : RGBA(20, 20, 20, 100),
	text_background_fade : RGBA(20, 20, 20, 0),
	outline : RGBA(250, 250, 250, 40),
	progress1 : RGBA(250, 250, 250, 130),
	progress2 : RGBA(250, 250, 250, 0),
};

var seekbar = new _seekbar(0, 0, 0, 0);
var panel = new _panel();
var images = new _images();

var g_count = 0;
var g_timer_interval, g_timeout;
var g_timer_started = false;

var button_count = 0;
var button_timer_interval, button_timeout;
var button_timer_started = false;
var button_pressed = "none";

var show_volume = false;
var ww = 0, wh = 0;
var time_passed = 0;

var button_size = 72*res_factor;

var panel = new _panel();
var buttons = new _buttons();
var bs = _scale(0.6*button_size);

// ***USER INPUT NEEDED***
// Set the folder name to be the location of your playback icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\";
// ***USER INPUT END***

var img = utils.LoadImage(folder_name + "previous.png");
var previous_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "play.png");
var play_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "pause.png");
var pause_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "next.png");
var next_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "previous_pressed.png"); // Replace with your file location
var previous_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "play_pressed.png"); // Replace with your file location
var play_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "pause_pressed.png"); // Replace with your file location
var pause_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "next_pressed.png"); // Replace with your file location
var next_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "shuffle_off.png");
var shuffle_off_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "shuffle_on.png");
var shuffle_on_img = get_button_image(img, 0.8*bs, bs);

// ***USER INPUT NEEDED***
// Set the folder name to be the location of your special icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\layout_buttons\\";
// ***USER INPUT END***

var img = utils.LoadImage(folder_name + "monitor2_light.png");
var switch_monitor = get_button_image(img, 21.8*res_factor, 36*res_factor);

var img = utils.LoadImage(folder_name + "browse_light.png");
var browse = get_button_image(img, 30*res_factor, 30*res_factor);

// Un-comment the next 2 lines, as well as lines 216-218, if you want to have access to the "Show/Hide Toolbars" feature
//var img = utils.LoadImage(folder_name + "hide_toolbar.png");
//var hide = get_button_image(img, 27*res_factor, 27*res_factor);

panel.item_focus_change();

var is_shuffled = false;
var hide_clutter = false;
var show_lyrics = false;
fb.RunMainMenuCommand("View/Popup panels/Hide all panels")
fb.RunMainMenuCommand("Playback/Order/Default");
//var show_keypress = "";

function get_button_image(img, size_x, size_y) {
	var src_w = img.Width;
	var src_h = img.Height;
	
	var button_image = utils.CreateImage(size_x, size_y);
	var temp_gr = button_image.GetGraphics();
	temp_gr.DrawImage(img, 0, 0, size_x, size_y, 0, 0, src_w, src_h);
	button_image.ReleaseGraphics();
	return button_image;
}

buttons.update = function () {
	this.buttons.previous = new _button(button_pos.x, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Previous");
			button_pressed = "previous";
			});
	
	if (!stopped && !fb.IsPaused) {
		delete this.buttons.play;
		this.buttons.playpause = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Play or pause");
			button_pressed = "pause";
			});
    }
	else {
		delete this.buttons.pause;
		this.buttons.playpause = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Play or pause");
			button_pressed = "play";
			});
    }
	
	this.buttons.next = new _button(button_pos.x + 2*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Next");
			button_pressed = "next";
			});
	
	if (is_shuffled) {
		this.buttons.shuffle = new _button(button_pos.x + 3*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Default");
			});
    }
	else {
		this.buttons.shuffle = new _button(button_pos.x + 3*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Shuffle (tracks)");
			});
    }
	
	// ***USER INPUT NEEDED***
	// If you want the layout switch buttons to work, you will have to make layouts with the following names:
	// Now Playing (Second Monitor)
	// Browse (Main Monitor)
	// Alternatively, if you're using this JScript Panel on your second monitor, then you might want to name them
	// accordingly, including the `fb.RunMainMenuCommand()` lines.
	//
	// For now, these lines are commented out.
	//
	// ***USER INPUT END***

	//this.buttons.switch_monitor = new _button(monitor_x, monitor_y, monitor_w, monitor_h, {}, null, function () {
	//	fb.RunMainMenuCommand("View/Popup panels/Hide all panels");
	//	fb.RunMainMenuCommand("View/Layout/Now Playing (Second Monitor)");
	//	});

	//this.buttons.browse = new _button(browse_x, browse_y, browse_w, browse_h, {}, null, function () {
	//	fb.RunMainMenuCommand("View/Popup panels/Hide all panels");
	//	fb.RunMainMenuCommand("View/Layout/Browse (Main Monitor)");
	//	});
	
	// Un-comment the next 3 lines, as well as lines 134-135, if you want to have access to the "Show/Hide Toolbars" feature
	//this.buttons.toolbar = new _button(toolbar_x, toolbar_y, toolbar_w, toolbar_h, {}, null, function () {
	//	fb.RunMainMenuCommand("View/Show Toolbars");
	//	});
}

function on_http_request_done(task_id, success, response_text) {
	images.http_request_done(task_id, success, response_text);
}

function on_mouse_lbtn_down(x, y) {
	seekbar.lbtn_down(x, y);
	window.Repaint();
}

function on_mouse_lbtn_up(x, y) {
	seekbar.lbtn_up(x, y);
	buttons.lbtn_up(x, y);
}

function on_mouse_leave() {
	buttons.leave();
}

function on_mouse_wheel(delta) {
	if ((delta > 0)) {
		fb.VolumeUp();
	} else {
		fb.VolumeDown();
	g_count = 0;
	}
}

function on_mouse_move(x, y) {
	seekbar.move(x, y);
	buttons.move(x, y);
	if (stopped || fb.IsPaused) {
		buttons.update();
		window.Repaint();
	}
}

function on_key_down(k) {
	//images.key_down(k);
	// Hide the butons and extra details by hitting H
	if (k == 72) {
		hide_clutter = !hide_clutter;
		on_size();
		buttons.update();
		window.Repaint();
	}
	if (k == 76) {
		if (!show_lyrics) {
			fb.RunMainMenuCommand("View/Popup panels/Show all panels");
		} else {
			fb.RunMainMenuCommand("View/Popup panels/Hide all panels")
		}
		show_lyrics = !show_lyrics;
	}
	//show_keypress = k;
}

function on_metadb_changed(handles, fromhook) {
	if (fromhook)
		return;

	images.metadb_changed();
}

function run_g_timer(time) {
	timer_over = false;
	if (!g_timer_started) {
		g_count = 0;
		g_timeout = window.SetTimeout(function() {
		}, 2000);
		// Set timer interval to 500 ms
		g_timer_interval = window.SetInterval(function() {
			g_count++;
		}, 500);
		
		g_timer_started = true;
	}
	if (g_count > time) {
		g_count = 0;
		g_timer_started = false;
		timer_over = true;
		window.ClearTimeout(g_timeout);
		window.ClearInterval(g_timer_interval);
	}
	return timer_over;
}

function run_button_timer(time) {
	timer_over = false;
	if (!button_timer_started) {
		button_count = 0;
		button_timeout = window.SetTimeout(function() {
		}, 2000);
		// Set timer interval to 0.1 second
		button_timer_interval = window.SetInterval(function() {
			button_count++;
		}, 100);
		
		button_timer_started = true;
	}
	if (button_count > time) {
		button_count = 0;
		button_timer_started = false;
		timer_over = true;
		window.ClearTimeout(button_timeout);
		window.ClearInterval(button_timer_interval);
	}
	return timer_over;
}

function on_playback_seek() {
	seekbar.playback_seek();
}

function on_paint(gr) {
	// Display image of album art
	panel.paint(gr);
	images.paint(gr);
	
	// Use this line if you want a quick way to see which keypress corresponds to which
	// integer. You'll have to un-comment the other lines of code with 'show_keypress' in it.
	// Only useful for developing/debugging.
	//gr.WriteText(show_keypress, font.big, colours.light, 100, 100, 100, 100, 2, 2);
	
	if (fb.IsPlaying) {
		// Display track and artist info		
		FillGradientRectangle(gr, 0.25*ww, y_text*v_factor, 0.25*ww, 0.09*wh, 1, colours.text_background_fade, colours.text_background);
		FillGradientRectangle(gr, 0.5*ww, y_text*v_factor, 0.25*ww, 0.09*wh, 1, colours.text_background, colours.text_background_fade);
		gr.WriteText(info.title.Eval(), font.big, colours.dark, 0, y_title, ww-4, h_title+6, 2, 2);
		gr.WriteText(info.artist.Eval(), font.small, colours.dark, 0, y_artist, ww-4, h_artist+6, 2, 2);
		gr.WriteText(info.title.Eval(), font.big, colours.light, 0, y_title, ww, h_title, 2, 2);
		gr.WriteText(info.artist.Eval(), font.small, colours.light, 0, y_artist, ww, h_artist, 2, 2);
		
		// Display seekbar info
		var seekbar_text_pos = {
			left_x : seekbar.x - 88*res_factor,
			right_x : seekbar.x + seekbar.w + 9*res_factor,
			y : seekbar.y-9,
		};
		if (!hide_clutter) {
			gr.WriteText(tfo.playback_time.Eval(), font.tiny, colours.dark, seekbar_text_pos.left_x-2, seekbar_text_pos.y+1, 80*res_factor, seekbar.h+15, 1, 2);
			gr.WriteText(tfo.length.Eval(), font.tiny, colours.dark, seekbar_text_pos.right_x-2, seekbar_text_pos.y+1, 80*res_factor, seekbar.h+15, 0, 2);
			gr.WriteText(tfo.playback_time.Eval(), font.tiny, colours.light, seekbar_text_pos.left_x, seekbar_text_pos.y, 80*res_factor, seekbar.h+15, 1, 2);
			gr.WriteText(tfo.length.Eval(), font.tiny, colours.light, seekbar_text_pos.right_x, seekbar_text_pos.y, 80*res_factor, seekbar.h+15, 0, 2);
		}
		if (fb.PlaybackLength > 0) {
			gr.DrawRectangle(seekbar.x, seekbar.y, seekbar.w, seekbar.h, 1.5, colours.outline);
			FillGradientRectangle(gr, seekbar.x, seekbar.y, seekbar.pos(), seekbar.h, 0, colours.progress1, colours.progress2);
		}
	}
	
	// Display playback buttons
	if (!hide_clutter) {
		buttons.update();
		buttons.paint(gr);
		
		if (button_pressed != "none") {
		button_timer_over = run_button_timer(1);
		if (button_timer_over) {
			button_pressed = "none";
			window.Repaint();
			}
		}
	
		previous_button = previous_img
		pause_button = pause_img
		play_button = play_img
		next_button = next_img
		
		show_normal_playpause = true;
		if (button_pressed == "previous") {
			previous_button = previous_img_pressed
		}
		if (button_pressed == "pause") {
			show_normal_playpause = false;
			pause_button = play_img_pressed
		}
		if (button_pressed == "play") {
			show_normal_playpause = false;
			play_button = pause_img_pressed
		}
		if (button_pressed == "next") {
			next_button = next_img_pressed
		}
	
		gr.DrawImage(previous_button, button_pos.x, button_pos.y, previous_img.Width, previous_img.Height, 0, 0, previous_img.Width, previous_img.Height);
		
		if (!button_timer_started || show_normal_playpause) {
			if (!stopped && !fb.IsPaused) {
				gr.DrawImage(pause_button, button_pos.x + button_pos.space, button_pos.y, pause_img.Width, pause_img.Height, 0, 0, pause_img.Width, pause_img.Height)
			}
			else {
				gr.DrawImage(play_button, button_pos.x + button_pos.space, button_pos.y, play_img.Width, play_img.Height, 0, 0, play_img.Width, play_img.Height)
			}
		} else {
			if (!stopped && !fb.IsPaused) {
				gr.DrawImage(play_button, button_pos.x + button_pos.space, button_pos.y, pause_img.Width, pause_img.Height, 0, 0, pause_img.Width, pause_img.Height)
			}
			else {
				gr.DrawImage(pause_button, button_pos.x + button_pos.space, button_pos.y, play_img.Width, play_img.Height, 0, 0, play_img.Width, play_img.Height)
			}
		}
		
		gr.DrawImage(next_img, button_pos.x + 2*button_pos.space, button_pos.y, next_img.Width, next_img.Height, 0, 0, next_img.Width, next_img.Height);
		
		if (!is_shuffled) {
			gr.DrawImage(shuffle_off_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_off_img.Width, shuffle_off_img.Height, 0, 0, shuffle_off_img.Width, shuffle_off_img.Height)
		}
		else {
			gr.DrawImage(shuffle_on_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_on_img.Width, shuffle_on_img.Height, 0, 0, shuffle_on_img.Width, shuffle_on_img.Height)
		}
		
		// Display layout buttons
		gr.DrawImage(switch_monitor, monitor_x, monitor_y, monitor_w, monitor_h, 0, 0, monitor_w, monitor_h);	
		gr.DrawImage(browse, browse_x, browse_y, browse_w, browse_h, 0, 0, browse_w, browse_h);
		gr.DrawImage(hide, toolbar_x, toolbar_y, toolbar_w, toolbar_h, 0, 0, toolbar_w, toolbar_h);
	}
	
	// Display volume if changed
	if (show_volume) {
		volume = fb.Volume;
		vol_pos = vol_h*vol2pos(fb.Volume);
		vol_txt = volume.toFixed(2) + 'dB';
	
		FillGradientRectangle(gr, vol_x, vol_y + vol_h - vol_pos, vol_w, vol_pos, 0, colours.progress1, colours.progress2);
		gr.DrawRectangle(vol_x, vol_y, vol_w, vol_h, 1.0, colours.outline);
		
		gr.WriteTextSimple(vol_txt, font.tiny, colours.dark, vol_x - 62*res_factor, vol_y-30*res_factor, 120*res_factor + vol_w, 18*res_factor, 2, 1);
		gr.WriteTextSimple(vol_txt, font.tiny, colours.light, vol_x - 60*res_factor, vol_y-30*res_factor, 120*res_factor + vol_w, 18*res_factor, 2, 1);
		
		timer_over = run_g_timer(2);
		if (timer_over) {
			show_volume = false;
			window.Repaint();
		}		
	}
}

function on_playback_dynamic_info_track(type) {
	if (type == 0) {
		images.playback_new_track();
	}
}

function on_playback_new_track() {
	panel.item_focus_change();
	images.playback_new_track();
	stopped = false;
	buttons.update();
	window.Repaint();
}

function on_playback_starting() {
	panel.item_focus_change();
	images.playback_new_track();
	stopped = false;
	buttons.update();
	window.Repaint();
}

function on_playback_pause() {
	seekbar.playback_seek();
	buttons.update();
	window.Repaint();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
	stopped = true;
	buttons.update();
	window.Repaint();
}

function on_playback_order_changed() {	
	is_shuffled = !is_shuffled
	buttons.update();
    window.Repaint();
}

function on_playback_time() {
	images.playback_time();
	stopped = false;
	window.Repaint();
}

function on_playlist_switch() {
	on_item_focus_change();
}

function on_volume_change(val) {
	show_volume = true;
	g_count = 0;
	window.Repaint();
}

function on_size() {
	panel.size();

	images.w = panel.w*0.72;
	images.h = panel.h*0.72;
	wh = window.Height;
	ww = window.Width;
	
	seekbar.x = 0.15*window.Width;
	seekbar.w = 0.7*window.Width;
	if (hide_clutter) {
		seekbar.y = 0.885*window.Height*v_factor;
		seekbar.h = 0.028*window.Height;
	} else {
		seekbar.y = 0.945*window.Height*v_factor;
		seekbar.h = 0.015*window.Height;
	}	
	
	monitor_x = window.Width - 72*res_factor;
	monitor_y = window.Height - 45*res_factor;
	monitor_w = 21.8*res_factor;
	monitor_h = 36*res_factor;
	
	browse_x = window.Width - 44*res_factor;
	browse_y = window.Height - 44*res_factor;
	browse_w = 30*res_factor;
	browse_h = 30*res_factor;
	
	toolbar_x = window.Width - 36*res_factor;
	toolbar_y = 8*res_factor;
	toolbar_w = 24*res_factor;
	toolbar_h = 24*res_factor;
	
	vol_x = 0.92*window.Width;
	vol_y = 0.40*window.Height;
	if (monitor_orientation == "portrait") {
		vol_w = 0.02*window.Width;
	} else {
		vol_w = 0.008*window.Width;
	}
	vol_h = 0.20*window.Height;
	volume = fb.Volume;
	vol_pos = vol_w*vol2pos(fb.Volume);
	vol_txt = fb.Volume.toFixed(2) + 'dB';
	
	button_pos = {
		x : window.Width/2 - _scale(1.2*button_size) + 7*res_factor,
		y : seekbar.y - 0.090*wh/v_factor,
		space : bs,
	};
	
	if (hide_clutter) {
		y_text = seekbar.y - 0.115*wh;
	} else {
		y_text = seekbar.y - 0.185*wh;
	}
	y_title = y_text*v_factor + 0.005*wh
	y_artist = y_text*v_factor + 0.045*wh
	h_title = 0.038*wh
	h_artist = 0.035*wh

	buttons.update();
}