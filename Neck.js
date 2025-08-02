const T = 2; // Tone
const sT = 1; // Semitone

const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

let TonesColors = {
	0 : [255, 0, 0], // 1st red
	2 : [255, 100, 0], // 3rd orange
	4 : [255, 255, 0], // 5th yellow
	6 : [255, 0, 255], // 7th purple
	// Other chord tones are blue
	5 : [0, 255, 255],  // 6th & 13th
	1 : [0, 255, 255], // 2nd
	3 : [0, 255, 255], // 11th
	100: [255, 255, 255] // Passing tones
}

class Neck {
    constructor(tuning = 'standard', size = 21) {
        this.size = size;
        this.base_chord_tones = [0, 2, 4, 6]; // Tonic, third, fifth, seventh

        this.shapes = {
            'Maj7':   [T, T, sT, T, T, T, sT],
            'mMaj7':  [T, sT, T, T, sT, T + 1, sT],
            '7':      [T, T, sT, T, T, sT, T],
            '7/#5':   [T, T, sT, T + 1, sT, sT, T],
            '7/b9':   [sT, T + 1, sT, T, T, sT, T],
            '7/#9':   [T + 1, sT, sT, T, T, sT, T],
            '7/#11':  [T, T, T, sT, T, sT, T],
            'm7':     [T, sT, T, T, sT, T, T],
            'm6':     [T, sT, T, T, T, sT, T],
            'm7/b5':  [T, sT, T, sT, T, T, T]
        };

        this.strings = ['E', 'B', 'G', 'D', 'A', 'E'];
        if (tuning === 'drop D') {
            this.strings = ['E', 'B', 'G', 'D', 'A', 'D'];
        }
    }

    get_shape(chord) {
        let tones = [...this.base_chord_tones];
        let shape;

        if (chord === 'M' || chord === 'm') {
            tones = tones.slice(0, -1); // remove 7th
            shape = chord === 'm' ? 'm7' : 'Maj7';

        } else if (chord.endsWith('6')) {
            tones[tones.length - 1] = 5; // 6th replaces 7th
            shape = chord.includes('m') ? 'm6' : 'Maj7';

        } else if (chord.endsWith('9')) {
            if (chord.includes('6')) {
                tones[tones.length - 1] = 5; // 6th replaces 7th
                shape = 'Maj7';
            } else if (chord.endsWith('/9')) {
                shape = chord.split('/')[0];
            } else {
                shape = chord;
            }
            tones.push(1); // add 2nd
			
        } else if (chord.endsWith('11')) {
            tones.push(3); // add 4th
            shape = chord.includes('m') ? 'm7' : chord;

        } else if (chord.endsWith('13')) {
			tones.push(5); // add 6th
			shape = '7';
        } else {
            shape = chord;
		}
        return [shape, tones];
    }

    find_notes(string, note, shape, tones) {
        let note_idx;

        if (note.includes('#')) {
            note_idx = (NOTES.indexOf(note[0]) + 1) % NOTES.length;
        } else {
            note_idx = NOTES.indexOf(note);
        }

        const string_idx = NOTES.indexOf(string);
        let dist = note_idx - string_idx;
		const frets = [];
        
		let i = 0;
		
		while (dist > 0) {
			dist -= shape[shape.length-1+i];
			i--;
		}
		i += 7
        while (dist <= this.size) {
            if (dist >= 0) {
                const isTone = tones.includes(i % 7);
                if (isTone) {
					frets.push([dist, i%7]);
				} else {
					frets.push([dist, false]);
				}
            }
            dist += shape[i % 7];
            i++;
        }

        return frets;
    }

    get_neck_shape(chord) {
        const parts = chord.split(' ');
        if (parts.length < 2) throw new Error("Invalid chord format");

        const [note, chord_shape_str] = parts;
        const [chord_shape, tones] = this.get_shape(chord_shape_str);
        const shape = this.shapes[chord_shape];

        const positions = this.strings.map(string =>
            this.find_notes(string, note, shape, tones)
        );

        return positions;
    }

	display_shape(chord, x, y, h_space, v_space, r) {
		let positions = this.get_neck_shape(chord);
		fill(255);
		for (let i=0; i < positions.length; i++) {
			let py = y + i*h_space;
			// Fret 0
			let tone = positions[i][0][1] 
			if (positions[i][0][0] == 0) {	
				if (typeof(tone) === 'number') {
					fill(TonesColors[tone][0], TonesColors[tone][1],TonesColors[tone][2]);
				} else {
					fill(255);
				}
				ellipse(x-v_space/4, py, r, r);
			}
			for (let j=0; j < positions[i].length; j++) {
				tone = positions[i][j][1] 
				if (typeof(tone) === 'number') {
					fill(TonesColors[tone][0], TonesColors[tone][1],TonesColors[tone][2]);
				} else {
					fill(255);
				}	
				if (positions[i][j][0] != 0) {
					let px = x + positions[i][j][0] * v_space - v_space/2;
					ellipse(px, py, r, r);
				}
			}
		}
	}

	draw_neck(length, height, W, offset, neck_direction, strings_direction) {
		// Clear screen
		background(0);
		let h_space = height / 5;
		let v_space = length / this.size;

		let x = W / 30;
		// Draw left to right
		if (neck_direction === -1) {
			x = w - x;
		}
		// Inverte strings from bottom to top
		if (strings_direction === -1) {
			this.strings.reverse()
		}
		let y = h/2 - height/2 + offset;
	
		fill(255)
		rect(x, y, -W/200*neck_direction, height)
	
		textSize(w/60);
		// Draw strings
		for (let i = 0; i<6; i++){
			let next_y = y + (i * h_space)
			stroke(255)
			line(x, next_y, x + (length * neck_direction), next_y);
			noStroke();
			if (neck_direction === -1) {
				text(this.strings[i], x - (length + W/40), next_y + h_space/4);
			}
			text(this.strings[i], x + length + W/80, next_y + h_space/4);
		}
	
		// Mark numbers on fret
		let numbers = [5, 7, 12, 17]
		// Draw frets
		for (let i = 0; i<this.size; i++){
			let next_x = x + (v_space * (i + 1) * neck_direction);
			stroke(255)
			line(next_x, y,  next_x, y + height)
			noStroke();
			// Write number text
			if (numbers.includes(i+1)) {
				let str = String(i+1);
				let tx = next_x - (v_space/2) * neck_direction;
				if (str.length == 2) {
					tx -= W/80
				}
				text(String(i+1), tx,  y - (h_space/2));
			}
		}

		return [x, y, h_space, v_space];
	}
}
