// ==PREPROCESSOR==
// @name "Playback Widget"
// @author "scarbles"
// @contributors "marc2003"
// @import "lodash"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\common.js"
// @import "%fb2k_component_path%samples\js\seekbar.js"
// @import "%fb2k_component_path%samples\js\panel.js"
// @import "%fb2k_component_path%custom\playback-widget.js"
// ==/PREPROCESSOR==

// Use and distibute this script freely as you see fit. To get it to work,
// make sure you've added the `playback-widget.js` script to your %AppData%
// folder, as described on Github. Then, go to (Ctrl+F) every line labeled:
//
//     ***USER INPUT NEEDED***
//
// and change the information accordingly.


// ***USER INPUT NEEDED***
// Edit these to fit your computer specs
var resolution = 1080;
var monitor_orientation = "landscape";  // "landscape" or "portrait"
// ***USER INPUT END***

var res_factor = (((resolution/1080)-1)/1.5)+1;
if (monitor_orientation == "portrait") {
	var orientation_factor = 0.72;
} else if (monitor_orientation == "landscape") {
	var orientation_factor = 1;
}

var stopped = true;
var show_hidden_buttons = false;

var tfo = {
	playback_time : fb.TitleFormat('[%playback_time%]'),
	length : fb.TitleFormat('$if2(%length%,LIVE)'),
};

var info = {
	artist : fb.TitleFormat('[%artist%]'),
	title : fb.TitleFormat('[%title%]'),
};

var font = {
	big : CreateFontString("Segoe UI", 11.5*res_factor, 700),
	small : CreateFontString("Segoe UI", 9*res_factor, 700),
	tiny : CreateFontString("Segoe UI", 8.5*res_factor, 700),
};

var colours = {
	light : RGB(240, 240, 240),
	dark : RGB(0, 0, 0),
	text_background : RGBA(250, 250, 250, 100),
	text_background_fade : RGBA(250, 250, 250, 0),
	outline : RGBA(64, 64, 64, 80),
	progress1 : RGBA(128, 128, 128, 40),
	progress2 : RGBA(128, 128, 128, 200),
	highlight : RGBA(240, 240, 240, 180),
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

var drag = false;
var show_volume = false;
var ww = 0, wh = 0;
var time_passed = 0;

var is_shuffled = false;
fb.RunMainMenuCommand("Playback/Order/Default");

var button_size = 54*res_factor;

var buttons = new _buttons();
var bs = _scale(0.6*button_size);

// ***USER INPUT NEEDED***
// Set the folder name to be the location of your playback icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\";
// ***USER INPUT END***

var img = utils.LoadImage(folder_name + "previous.png"); // Replace with your file location
var previous_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "play.png"); // Replace with your file location
var play_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "pause.png"); // Replace with your file location
var pause_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "next.png"); // Replace with your file location
var next_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "previous_pressed.png"); // Replace with your file location
var previous_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "play_pressed.png"); // Replace with your file location
var play_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "pause_pressed.png"); // Replace with your file location
var pause_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "next_pressed.png"); // Replace with your file location
var next_img_pressed = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "shuffle_off.png"); // Replace with your file location
var shuffle_off_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "shuffle_on.png"); // Replace with your file location
var shuffle_on_img = get_button_image(img, 0.8*bs, bs);

// ***USER INPUT NEEDED***
// Set the folder name to be the location of your special icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\layout_buttons\\";
// ***USER INPUT END***

var img = utils.LoadImage(folder_name + "monitor2_dark.png"); // Replace with your file location
var switch_monitor = get_button_image(img, 24*res_factor, 39*res_factor);

var img = utils.LoadImage(folder_name + "fullscreen.png"); // Replace with your file location
var fullscreen = get_button_image(img, 33*res_factor, 33*res_factor);

panel.item_focus_change();

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
		this.buttons.pause = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Play or pause");
			button_pressed = "pause";
			});
    }
	else {
		delete this.buttons.pause;
		this.buttons.play = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
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
	// Now Playing (Main Monitor)
	// Browse (Second Monitor)
	// Alternatively, if you're using this JScript Panel on your second monitor, then you might want to name them
	// accordingly, including the `fb.RunMainMenuCommand()` lines.
	//
	// For now, these lines are commented out.
	//
	// ***USER INPUT END***

	//this.buttons.switch_monitor = new _button(monitor_x, monitor_y, monitor_w, monitor_h, {}, null, function () {
	//	fb.RunMainMenuCommand("View/Layout/Browse (Second Monitor)");
	//	});
	//
	//this.buttons.fullscreen = new _button(fullscreen_x, fullscreen_y, fullscreen_w, fullscreen_h, {}, null, function () {
	//	fb.RunMainMenuCommand("View/Layout/Now Playing (Main Monitor)");
	//	});
}

function on_http_request_done(task_id, success, response_text) {
	images.http_request_done(task_id, success, response_text);
}

function on_mouse_lbtn_down(x, y) {
	seekbar.lbtn_down(x, y);
	if ((y > vol_y-0.8*vol_h) && (y < vol_y+1.8*vol_h)
	    && (x >= vol_x-0.15*vol_w) && (x <= vol_x + 1.15*vol_w)) {
		drag = true;
	}
	window.Repaint();
}

function on_mouse_lbtn_up(x, y) {
	seekbar.lbtn_up(x, y);
	drag = false;
	try {
		buttons.lbtn_up(x, y);
	} catch(error) {
	}
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
	if (drag) {
		// Define the left and right points of the volume slider as 0 and 1, accordingly
		var pos = x < vol_x ? 0 : x > vol_x + vol_w ? 1 : ((x - vol_x) / (vol_w));
		fb.Volume = pos2vol(pos);
		g_count = 0;
		show_volume = true;
	}
	if (stopped || fb.IsPaused) {
		buttons.update();
		window.Repaint();
	}
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
		// Set timer interval to 1 second
		g_timer_interval = window.SetInterval(function() {
			g_count++;
		}, 1000);
		
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
	gr.FillRectangle(wh, 0, ww-wh, wh, colours.highlight);
	
	if (fb.IsPlaying) {
		// Display track and artist info
		FillGradientRectangle(gr, seekbar.x, 0, seekbar.w/2, wh, 1, colours.text_background_fade, colours.text_background);
		FillGradientRectangle(gr, seekbar.x + seekbar.w/2, 0, seekbar.w/2, wh, 1, colours.text_background, colours.text_background_fade);
		song_info = info.artist.Eval() + "  -  " + info.title.Eval();
		
		if (monitor_orientation == "portrait") {
			if (song_info.length > 34) {
				fontsize = 12.5*res_factor - song_info.length/22;
				font.big = CreateFontString("Segoe UI", fontsize, 700)
			}
			gr.WriteText(song_info, font.big, colours.dark, seekbar.x - 0.05*seekbar.w, 0.04*wh, 1.1*seekbar.w, 0.52*wh, 2, 2);
		} else if (monitor_orientation == "landscape") {
			if (song_info.length > 50) {
				fontsize = 12.5*res_factor - song_info.length/30;
				font.big = CreateFontString("Segoe UI", fontsize, 700)
			}
			gr.WriteText(song_info, font.big, colours.dark, seekbar.x-0.2*seekbar.w, 0.05*wh, 1.4*seekbar.w, 0.4*wh, 2, 2);
		}
		
		// Display seekbar info
		gr.DrawRectangle(seekbar.x, seekbar.y, seekbar.w, seekbar.h, 1.5, colours.outline);
		var seekbar_text_pos = {
			left_x : seekbar.x - 106*res_factor,
			right_x : seekbar.x + seekbar.w + 10*res_factor,
			y : seekbar.y-7*res_factor,
		};
		gr.WriteText(tfo.playback_time.Eval(), font.small, colours.dark, seekbar_text_pos.left_x-2, seekbar_text_pos.y+2, 98*res_factor, 100, 1, 0);
		gr.WriteText(tfo.length.Eval(), font.small, colours.dark, seekbar_text_pos.right_x+2, seekbar_text_pos.y+2, 98*res_factor, 100, 0, 0);
	
		if (fb.PlaybackLength > 0) {
			FillGradientRectangle(gr, seekbar.x, seekbar.y, seekbar.pos(), seekbar.h, 0, colours.progress1, colours.progress2);
		}
	}
	
	// Display playback buttons
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
	
	gr.DrawImage(next_button, button_pos.x + 2*button_pos.space, button_pos.y, next_img.Width, next_img.Height, 0, 0, next_img.Width, next_img.Height);
	
	if (!is_shuffled) {
		gr.DrawImage(shuffle_off_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_off_img.Width, shuffle_off_img.Height, 0, 0, shuffle_off_img.Width, shuffle_off_img.Height)
	}
	else {
		gr.DrawImage(shuffle_on_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_on_img.Width, shuffle_on_img.Height, 0, 0, shuffle_on_img.Width, shuffle_on_img.Height)
    }
	
	// Display special buttons
	gr.DrawImage(switch_monitor, monitor_x, monitor_y, monitor_w, monitor_h, 0, 0, monitor_w, monitor_h);	
	gr.DrawImage(fullscreen, fullscreen_x, fullscreen_y, fullscreen_w, fullscreen_h, 0, 0, fullscreen_w, fullscreen_h);
	
	if (show_hidden_buttons && monitor_orientation == "landscape") {
		gr.DrawImage(artwork, artwork_x, artwork_y, artwork_w, artwork_h, 0, 0, artwork_w, artwork_h);
		timer_over =  run_g_timer(8);
		if (timer_over) {
			show_hidden_buttons = false;
			buttons.update();
			window.Repaint();
		}		
	}	
	
	// Display volume if changed
	volume = fb.Volume;
	vol_pos = vol_w*vol2pos(fb.Volume);
	vol_txt = volume.toFixed(2) + 'dB';

	FillGradientRectangle(gr, vol_x, vol_y, vol_pos, vol_h, 0, colours.progress1, colours.progress2);
	gr.DrawRectangle(vol_x, vol_y, vol_w, vol_h, 1.0, colours.outline);
	gr.FillEllipse(vol_x + vol_pos, vol_y+vol_h/2, vol_h/3.4, vol_h/1.9, colours.dark);
	
	if (show_volume) {
		gr.WriteTextSimple(vol_txt, font.tiny, colours.dark, vol_x, 0.2*wh, 90, 0.32*wh, 0, 1);
		
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

function on_volume_change(val) {
	show_volume = true;
	g_count = 0;
	window.Repaint();
}

function on_size() {
	panel.size();

	images.w = panel.w;
	if (monitor_orientation == "landscape") {
		images.h = 66*res_factor;
	} else if (monitor_orientation == "portrait") {
		images.h = 82*res_factor;
	}
	
	wh = window.Height;
	ww = window.Width;
	
	if (monitor_orientation == "landscape") {
		seekbar.x = 0.25*window.Width;
		seekbar.y = 0.60*window.Height;
	} else if (monitor_orientation == "portrait") {
		seekbar.x = 0.34*window.Width;
		seekbar.y = 0.66*window.Height;
	}
	seekbar.w = 0.4*window.Width*Math.sqrt(orientation_factor);
	seekbar.h = 0.17*window.Height;
	
	artwork_x = window.Width - 122*res_factor;
	artwork_y = (window.Height - 32*res_factor)/2;
	artwork_w = 32*res_factor;
	artwork_h = 32*res_factor;

	monitor_x = window.Width - 80*res_factor;
	monitor_y = (window.Height - 38*res_factor)/2;
	monitor_w = 24*res_factor;
	monitor_h = 39*res_factor;
	
	fullscreen_x = window.Width - 47*res_factor;
	fullscreen_y = (window.Height - 33*res_factor)/2;
	fullscreen_w = 33*res_factor;
	fullscreen_h = 33*res_factor;
	
	vol_x = 0.78*window.Width;
	vol_y = 0.56*window.Height;
	vol_w = 0.06*window.Width/orientation_factor;
	vol_h = 0.16*window.Height;
	volume = fb.Volume;
	vol_pos = vol_w*vol2pos(fb.Volume);
	vol_txt = fb.Volume.toFixed(2) + 'dB';
	
	if (monitor_orientation == "landscape") {
		button_pos = {
			x : window.Width*0.052,
			y : (window.Height - button_size)/2 + 2,
			space : bs,
		};
	} else if (monitor_orientation == "portrait") {
		button_pos = {
			x : window.Width*0.092,
			y : (window.Height - button_size)/2 + 2,
			space : .88*bs,
		};
	}
	
	buttons.update();
	images.update();
}