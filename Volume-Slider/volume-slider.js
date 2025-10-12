// ==PREPROCESSOR==
// @name "Volume + Text"
// @author "marc2003"
// @contributor "scarbles"
// @import "%fb2k_component_path%helpers.txt"
// ==/PREPROCESSOR==

// name, pixels, font_weight (400 = normal, 700 = bold)
var font_string = CreateFontString("Segoe UI", 10, 700);
var colours = {
	text : RGB(0, 0, 0),
	background : RGB(240, 240, 240),
	unfilled1 : RGB(210, 210, 210),
	unfilled2 : RGB(160, 160, 160),
	progress1 : RGB(215, 235, 250),
	progress2 : RGB(130, 190, 250),
	slider : RGB(145, 90, 170),
};

var drag = false;
var ww = 0, wh = 0, pad = 0;

function on_mouse_lbtn_down(x, y) {
	drag = true;
}

function on_mouse_lbtn_up(x, y) {
	drag = false;
}

function on_mouse_wheel(delta) {
	if (delta > 0)
		fb.VolumeUp();
	else
		fb.VolumeDown();
}

function on_mouse_move(x, y) {
	if (drag) {
		// Define the left and right points of the volume slider as 0 and 1, accordingly
		var pos = x < left_pad ? 0 : x > ww - right_pad ? 1 : ((x - left_pad) / (ratio*ww));
		fb.Volume = pos2vol(pos);
	}
}

function on_paint(gr) {
	var volume = fb.Volume;
	var pos = ww * vol2pos(volume);
	var txt = volume.toFixed(2) + 'dB';

	gr.Clear(colours.background);
	FillGradientRectangle(gr, left_pad, .36*wh, ratio*pos, .3*wh, 0, colours.progress1, colours.progress2);
	FillGradientRectangle(gr, left_pad + ratio*pos, .36*wh, ratio*(ww - pos), .3*wh, 0, colours.unfilled1, colours.unfilled2);
	gr.DrawRectangle(left_pad, .36*wh, ratio*ww+1, .3*wh, 1.0, colours.unfilled1);
	gr.WriteTextSimple(txt, font_string, RGB(0, 0, 0), 0, 0, left_pad, wh, 2, 2);
	gr.FillEllipse(left_pad + ratio*pos, .51*wh, 4, wh/6, colours.slider);	
}

function on_size() {
	ww = window.Width;
	wh = window.Height;
	left_pad = 90;
	right_pad = 10;
	ratio = (ww - left_pad - right_pad) / ww;
}

function on_volume_change(val) {
	window.Repaint();
}
