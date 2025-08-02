

T = 2 # Tone
sT = 1 # Semitone

NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

class Neck:
    
    base_chord_tones = [0, 2, 4, 6] # Tonic, third, fifth and seventh

    shapes = {'Maj7':   [T, T, sT, T, T, T, sT],
               'mMaj7': [T, sT, T, T, sT, T+1, sT],
                 
                   '7': [T, T, sT, T, T, sT, T],
                '7/#5': [T, T, sT, T+1, sT, sT, T],
                '7/b9': [sT, T+1, sT, T, T, sT, T],
                '7/#9': [T+1, sT, sT, T, T, sT, T],
               '7/#11': [T, T, T, sT, T, sT, T],    

                  'm7': [T, sT, T, T, sT, T, T],
               'm7/b5': [T, sT, T, sT, T, T, T],
                  'm6': [T, sT, T, T, T, sT, T],
              }


    def __init__(self, tuning: str='standard', size: int=21):
        
        self.size = size
        
        if tuning == 'standard':
            self.strings = ['E', 'B', 'G', 'D', 'A', 'E']
        elif tuning == 'drop D':
            self.strings = ['E', 'B', 'G', 'D', 'A', 'D']


    def get_shape(self, chord):
        tones = self.base_chord_tones
        if chord == 'M' or chord == 'm':
            tones = tones[:-1]
            shape = 'm7' if chord == 'm' else 'Maj7'

        elif chord.endswith('6'):
            tones[-1] = 5 # replace the 7th with the 6th
            
            if not 'm' in chord:
                shape = 'Maj7'
            else:
                shape = chord
        elif chord.endswith('9'):
            if '6' in chord: 
                tones[-1] = 5 # replace the 7th with the 6th
                shape = 'Maj7'

            elif chord.endswith('/9'):
                shape = chord.split('/')[0]

            else:
                shape = chord
            
            tones += [1] # Add 2nd

        elif chord.endswith('11'):
            tones += [3] # add 4th
            
            if 'm' in chord:
                shame = 'm7'
            else:
                shape = chord
            
        else:
            tones = self.base_chord_tones
            shape = chord

        return shape, tones


    def find_notes(self, string, note, shape, tones):
        # The script works with flats \_o_/ 
        if '#' in note:
            note_idx = NOTES.index(note[0]) + 1
        else:
            note_idx = NOTES.index(note)
    
        string_idx = NOTES.index(string)
       
        # Distance from the tonic
        dist = note_idx - string_idx

        frets = []
        i = 0
        while dist > 0:
            dist -= shape[i-1]
            i-=1
        
        i += 7
        # Get fret positions
        while dist <= self.size:
            if dist >= 0:
                # Mark chord tone
                if i % 7 in tones:
                    frets.append((dist, True))
                else:
                    frets.append((dist, False))
            
            dist += shape[i%7] 
            i += 1

        return frets


    def get_neck_shape(self, chord):
        assert len(chord.split()) > 1

        note, chord_shape = chord.split()

        chord_shape, tones = self.get_shape(chord_shape)
    
        shape = self.shapes[chord_shape]

        positions = []
        for string in self.strings:
            positions.append(self.find_notes(string, note, shape, tones))
        
        return positions


    def print_string(self, positions):
        s = ''
        frets = [i[0] for i in positions]
        is_tone = [i[1] for i in positions]

        if 0 in frets:
            if is_tone[0]:
                s += 'o'
            else:
                s += 'x'
        else:
            s+= ' '

        for i in range(1, self.size+1):
            if i in frets:
                idx = frets.index(i)
                if is_tone[idx]:
                    s+='|-o-'
                else:
                    s+='|-x-'

            else:
                s+= '|---'

        return s

    def print_shape(self, positions):
        s = '   '
        marks = [5, 7, 12, 15, 17]

        for i in range(1, self.size+1):
            if i in marks:
                if len(str(i)) == 1:
                    s += f'  {i} '
                else:
                    s += f' {i} '
            else:
                s += ' ' * 4
        s += '\n'

        return s + '\n'.join(f'{s} ' + self.print_string(p) for p,s  in zip(positions, self.strings))
        


n = Neck(size=16)

shape = n.get_neck_shape('G m6')


print(n.print_shape(shape))
