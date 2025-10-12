// ==PREPROCESSOR==
// @name "Togglable Shuffle Button"
// @author "marc2003"
// @contributors "scarbles"
// @import "lodash"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\common.js"
// @import "%fb2k_component_path%samples\js\panel.js"
// ==/PREPROCESSOR==

var colours = {
	background : RGB(240, 240, 240),
};

//////////////////////////////////////////////////////////////

var panel = new _panel();
var buttons = new _buttons();
var bs = _scale(24);
var is_shuffled = false;
var img = utils.LoadImage("D:\\Pictures\\foobar2000 icons\\shuffle_off.png"); // Replace with your file location
var shuffle_off_img = get_button_image(img, bs)
var img = utils.LoadImage("D:\\Pictures\\foobar2000 icons\\shuffle_on.png"); // Replace with your file location
var shuffle_on_img = get_button_image(img, bs);

function get_button_image(img, size) {
	var src_w = img.Width;
	var src_h = img.Height;
	
	var button_image = utils.CreateImage(40, 40);
	var temp_gr = button_image.GetGraphics();
	temp_gr.DrawImage(img, 0, 0, size, size, 0, 0, src_w, src_h);
	button_image.ReleaseGraphics();
	return button_image;
}

function change_bool(bool) {
	return !bool;
}

buttons.update = function () {
	var x = 0;
    var y = Math.round((panel.h - bs) / 2);
	
	if (is_shuffled) {
		this.buttons.shuffle = new _button(x, y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Default");
			}, 'Unshuffle');
    }
	else {
		this.buttons.shuffle = new _button(x, y, bs, bs, {}, null, function () {
			fb.RunMainMenuCommand("Playback/Order/Shuffle (tracks)");
			}, 'Shuffle');
    }
}

function on_mouse_lbtn_up(x, y) {
	buttons.lbtn_up(x, y);
}

function on_mouse_leave() {
	buttons.leave();
}

function on_mouse_move(x, y) {
	buttons.move(x, y);
}

function on_paint(gr) {
	var x = 0;
    var y = Math.round((panel.h - bs) / 2);
	gr.Clear(colours.background);
	buttons.paint(gr);
	
	if (!is_shuffled) {
	gr.DrawImage(shuffle_off_img, x, y, shuffle_off_img.Width, shuffle_off_img.Height, 0, 0, shuffle_off_img.Width, shuffle_off_img.Height)
	}
	
	else {
    gr.DrawImage(shuffle_on_img, x, y, shuffle_on_img.Width, shuffle_on_img.Height, 0, 0, shuffle_on_img.Width, shuffle_on_img.Height)
    }
}

function on_playback_order_changed() {	
	is_shuffled = change_bool(is_shuffled)
	buttons.update();
    window.Repaint();
}

function on_size() {
	panel.size();
	buttons.update();
}
