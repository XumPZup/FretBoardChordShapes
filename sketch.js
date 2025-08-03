let w = window.innerWidth;
w -= w/100;
let h = window.innerHeight;
let W; // Length of the shortest side of the screen
let neck; // Neck object
let neck_w, neck_h; // Width and height of the neck
let neck_frets = 21

let neck_direction = 1;
let strings_direction = 1;
let tuning = 'standard';
let offset = 0;
let overlay, neck_direction_box, strings_direction_box, neck_size_input, neck_frets_input, note_select, chord_select, tuning_select, close_button, update_button, show_menu_button;


function setup() {
	noLoop();
	w = int(w/100) * 100;
	h = int(h/100) * 100;
	if (w < h){
		W = w;
	}else{
		W = h;
	}
	const container = document.getElementById('canvas-container');
	const c = createCanvas(w, h);
	c.parent(container);
	load_inputs();
	background(0);
	stroke(255);
	
	neck_w = w / 1.1;
	neck_h = W / 5;	
	offset = h/3;

	neck_size_input.value = neck_h;
	update_neck();
}


function update_neck() {
	tuning = tuning_select.value;
	note = note_select.value;
	chord = chord_select.value;
	neck_h = int(neck_size_input.value);
	neck_frets = int(neck_frets_input.value);

	neck_direction_box.checked ? neck_direction = -1 : neck_direction = 1;
	strings_direction_box.checked ? strings_direction = -1 : strings_direction = 1;
	// Initialize neck
	neck = new Neck(tuning, neck_frets);
	// Draw neck
	let neck_info = neck.draw_neck(neck_w, neck_h, W, offset, neck_direction, strings_direction);
	let x = neck_info[0];
	let y = neck_info[1];
	let h_space = neck_info[2];
	let v_space = neck_info[3] * neck_direction;
	// Display shape
	neck.display_shape(note + ' ' + chord, x, y, h_space, v_space, W/40);
	draw_legend(y);

	textSize(W/20);
	text(note + chord, w/2, y - W/10);
}


function load_inputs() {
	overlay = document.getElementById('overlay-interface');

	// Inputs and checkboxes
	let inputs = overlay.getElementsByTagName('input');
	neck_direction_box = inputs[0];
	strings_direction_box = inputs[1];
	neck_size_input = inputs[2];
	neck_frets_input = inputs[3];
	
	// Selects
	let selects = overlay.getElementsByTagName('select');
	tuning_select = selects[0];
	note_select = selects[1];
	chord_select = selects[2];
	
	// Buttons
	let buttons = overlay.getElementsByTagName('button');
	close_button = buttons[0];
	update_button = buttons[1];

	// Show menu
	show_menu_button = document.getElementById('overlay-menu');

	// Update neck event
	update_button.addEventListener('click', update_neck);
	// Clse menu event
	close_button.addEventListener('click', () => {
		overlay.style.display = 'none';
		show_menu_button.style.display = 'block';
	});
	// Show menu envent
	show_menu_button.addEventListener('click', () => {
		show_menu_button.style.display = 'None';
		overlay.style.display = 'block';
	});
}



function draw_legend(y) {
	let x0 = W/20;
	let y0 = y - W/5
	let texts = ['1st', '3rd', '5th', '7th', '6th or 13th', '9th', '11th', 'Passing tones'];
	let tones = [0, 2, 4, 6, 5, 1, 3, 100];
	textSize(W/60);
	noStroke();
	// Draw colors correspondents to the tones
	tones.forEach((k, i) => {
		if (i == 4) {
			y0 = y - W/5;
			x0 += W/10;
		}
		fill(TonesColors[k][0], TonesColors[k][1], TonesColors[k][2])
		ellipse(x0, y0, W / 40)
		fill(255);
		text(texts[i], x0 + W/40, y0+W/120);
		y0 += W/30;
	});
	/*
	fill(255);
	textSize(W/20);
	text('Tap here to show and hide the menu', W/20, h/2 - W/3)*/
}


function mouseClicked() {
	if (mouseY < h / 2 && mouseX < w / 2) {
		overlay.style.display == 'none' ? overlay.style.display = 'block' : overlay.style.display = 'none';
	}
}
