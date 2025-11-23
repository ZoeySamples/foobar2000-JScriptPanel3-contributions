// ==PREPROCESSOR==
// @name "1080p Vertical Playback Widget"
// @author "marc2003"
// @contributors "scarbles"
// @import "lodash"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\common.js"
// @import "%fb2k_component_path%samples\js\seekbar.js"
// @import "%fb2k_component_path%samples\js\panel.js"
// @import "%fb2k_component_path%custom\playback-widget.js"
// ==/PREPROCESSOR==

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
	big : CreateFontString("Segoe UI", 11.5, 700),
	small : CreateFontString("Segoe UI", 9, 700),
	tiny : CreateFontString("Segoe UI", 8, 700),
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

var show_volume = false;
var ww = 0, wh = 0;
var time_passed = 0;

var button_size = 54;

var panel = new _panel();
var buttons = new _buttons();
var bs = _scale(0.6*button_size);

// Set the folder name to be the location of your playback icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\playback_widget\\";
var img = utils.LoadImage(folder_name + "previous.png");
var previous_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "play.png");
var play_img = get_button_image(img, 0.8*bs, bs);
var img = utils.LoadImage(folder_name + "pause.png");
var pause_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "next.png");
var next_img = get_button_image(img, 0.8*bs, bs);

var img = utils.LoadImage(folder_name + "shuffle_off.png");
var shuffle_off_img = get_button_image(img, 0.8*bs, bs);
var img = utils.LoadImage(folder_name + "shuffle_on.png");
var shuffle_on_img = get_button_image(img, 0.8*bs, bs);

// Set the folder name to be the location of your special icons
var folder_name = "D:\\Pictures\\foobar2000 icons\\layout_buttons\\";
var img = utils.LoadImage(folder_name + "monitor1_dark.png");
var switch_monitor = get_button_image(img, 34*(16/13), 34);

var img = utils.LoadImage(folder_name + "fullscreen.png");
var fullscreen = get_button_image(img, 38, 38);

var is_shuffled = false;

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
			});//, 'Previous');
	
	if (!stopped && !fb.IsPaused) {
		this.buttons.playpause = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Play or pause");
			});//, 'Pause');
    }
	else {
		this.buttons.playpause = new _button(button_pos.x + button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Play or pause");
			});//, 'Play');
    }
	
	this.buttons.next = new _button(button_pos.x + 2*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Next");
			});//, 'Next');
	
	if (is_shuffled) {
		this.buttons.shuffle = new _button(button_pos.x + 3*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Default");
			});//, 'Unshuffle');
    }
	else {
		this.buttons.shuffle = new _button(button_pos.x + 3*button_pos.space, button_pos.y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Shuffle (tracks)");
			});//, 'Shuffle');
    }
	
	this.buttons.switch_monitor = new _button(monitor_x, monitor_y, monitor_w, monitor_h, {}, null, function () {
		fb.RunMainMenuCommand("View/Layout/Browse (1440)");
		});//, 'Switch to 1080p layout');

	this.buttons.fullscreen = new _button(fullscreen_x, fullscreen_y, fullscreen_w, fullscreen_h, {}, null, function () {
		fb.RunMainMenuCommand("View/Layout/Now Playing (1080)");
		});//, 'Switch to Fullscreen layout');
	
	/*
	// When timer starts after hitting special button key, show special buttons
	// until the time runs out (any buttons you want to put here. If they are already
	// defined above, then you will have to move those lines of code down here.
	if (show_special_buttons) {
		this.buttons.switch_monitor = new _button(monitor_x, monitor_y, monitor_w, monitor_h, {}, null, function () {
			fb.RunMainMenuCommand("View/Layout/Browse (1440)");
			});//, 'Switch to 1080p layout');
	} else {
		// When timer runs out, hide special buttons
		delete this.buttons.switch_monitor;
	}
	*/
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
}

function on_key_down(k) {
	//images.key_down(k);
	
	// If you press Alt, show the hidden buttons
	if (k == 18) {
		show_hidden_buttons = true;
		g_count = 0;
	}
	buttons.update();
	window.Repaint();
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
		if (song_info.length > 30) {
			fontsize = 12.5 - song_info.length/20;
			font.big = CreateFontString("Segoe UI", fontsize, 700)
		}
		gr.WriteText(song_info, font.big, colours.dark, seekbar.x - 0.2*seekbar.w, 0.08*wh, 1.4*seekbar.w, 0.4*wh, 2, 2);
		
		// Display seekbar info
		gr.DrawRectangle(seekbar.x, seekbar.y, seekbar.w, seekbar.h, 1.5, colours.outline);
		var seekbar_text_pos = {
			left_x : seekbar.x - 112,
			right_x : seekbar.x + seekbar.w + 12,
			y : seekbar.y-5,
		};
		gr.WriteText(tfo.playback_time.Eval(), font.small, colours.dark, seekbar_text_pos.left_x - 2, seekbar_text_pos.y+2, 100, 100, 1, 0);
		gr.WriteText(tfo.length.Eval(), font.small, colours.dark, seekbar_text_pos.right_x + 2, seekbar_text_pos.y+2, 100, 100, 0, 0);
	
		if (fb.PlaybackLength > 0) {
			FillGradientRectangle(gr, seekbar.x, seekbar.y, seekbar.pos(), seekbar.h, 0, colours.progress1, colours.progress2);
		}
	}
	
	// Display playback buttons
	
	buttons.paint(gr);
	gr.DrawImage(previous_img, button_pos.x, button_pos.y, previous_img.Width, previous_img.Height, 0, 0, previous_img.Width, previous_img.Height);
	
	if (!stopped && !fb.IsPaused) {
		gr.DrawImage(pause_img, button_pos.x + button_pos.space, button_pos.y, pause_img.Width, pause_img.Height, 0, 0, pause_img.Width, pause_img.Height)
	}
	else {
		gr.DrawImage(play_img, button_pos.x + button_pos.space, button_pos.y, play_img.Width, play_img.Height, 0, 0, play_img.Width, play_img.Height)
    }
	
	gr.DrawImage(next_img, button_pos.x + 2*button_pos.space, button_pos.y, next_img.Width, next_img.Height, 0, 0, next_img.Width, next_img.Height);
	
	if (!is_shuffled) {
		gr.DrawImage(shuffle_off_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_off_img.Width, shuffle_off_img.Height, 0, 0, shuffle_off_img.Width, shuffle_off_img.Height)
	}
	else {
		gr.DrawImage(shuffle_on_img, button_pos.x + 3*button_pos.space, button_pos.y, shuffle_on_img.Width, shuffle_on_img.Height, 0, 0, shuffle_on_img.Width, shuffle_on_img.Height)
    }
	
	// Display special buttons
	gr.DrawImage(switch_monitor, monitor_x, monitor_y, monitor_w, monitor_h, 0, 0, monitor_w, monitor_h);	
	gr.DrawImage(fullscreen, fullscreen_x, fullscreen_y, fullscreen_w, fullscreen_h, 0, 0, fullscreen_w, fullscreen_h);
	
	/*
	if (show_special_buttons) {
		
		//Place lines of code to display special buttons here
		
		timer_over =  run_g_timer(4);
		if (timer_over) {
			show_special_buttons = false;
			buttons.update();
			window.Repaint();
		}		
	}
	*/
	
	
	// Display volume if changed
	volume = fb.Volume;
	vol_pos = vol_w*vol2pos(fb.Volume);
	vol_txt = volume.toFixed(2) + 'dB';

	FillGradientRectangle(gr, vol_x, vol_y, vol_pos, vol_h, 0, colours.progress1, colours.progress2);
	gr.DrawRectangle(vol_x, vol_y, vol_w, vol_h, 1.0, colours.outline);
	
	if (show_volume) {
		wh = window.Height;
		gr.WriteTextSimple(vol_txt, font.small, colours.dark, vol_x, 0.1*wh, vol_w, 0.7*wh, 1, 2);
		
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
	images.update();
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
	images.h = panel.h;
	wh = window.Height;
	ww = window.Width;
	
	seekbar.x = 0.34*window.Width;
	seekbar.y = 0.6*window.Height;
	seekbar.w = 0.32*window.Width;
	seekbar.h = 0.18*window.Height;
	
	monitor_x = window.Width - 110;
	monitor_y = window.Height - 52;
	monitor_w = 34*(16/13);
	monitor_h = 34;
	
	fullscreen_x = window.Width - 54;
	fullscreen_y = window.Height - 54;
	fullscreen_w = 38;
	fullscreen_h = 38;
	
	vol_x = 0.75*window.Width;
	vol_y = 0.60*window.Height;
	vol_w = 0.1*window.Width;
	vol_h = 0.16*window.Height;
	volume = fb.Volume;
	vol_pos = vol_w*vol2pos(fb.Volume);
	vol_txt = fb.Volume.toFixed(2) + 'dB';
	
	button_pos = {
		x : window.Width*0.082,
		y : (window.Height - button_size)/2 + 2,
		space : 0.88*bs,
	};
	
	buttons.update();
	images.update();
}
