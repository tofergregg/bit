class Bit:
    def __init__(self, world_text):
        self.world_text = world_text
        self.bits = ">v<^" # right, down, left, up
        self.colors = {'r':'red', 'g':'green', 'b':'blue'}
        self.world = self.load_world(world_text)
        self.bit_loc = self.get_bit_loc()

    def __repr__(self):
        return "Bit()"

    def __str__(self):
        # use ANSI escape codes for colors
        CSI = chr(27) + '['
        RED = 41
        BLUE = 44
        GREEN = 42

        s = ""
        for line in self.world:
            for c in line:
                if c[1] == None:
                    s += c[0]
                else:
                    if c[1] == 'r':
                        COLOR = RED
                    elif c[1] == 'g':
                        COLOR = GREEN
                    else:
                        COLOR = BLUE
                    s += f"{CSI}0;{COLOR}m{c[0]}{CSI}0;49m"
            s += '\n'
        return s

    def load_world(self, world_text):
        world = []
        color_under_bit = False
        for line in world_text.split('\n'):
            expanded_line = []
            for idx, c in enumerate(line):
                if color_under_bit:
                    color_under_bit = False
                    continue
                if c in self.bits:
                    # special case: bit could have a color underneath
                    if line[idx + 1] in 'RGB': # must be uppercase
                        expanded_line.append([c, line[idx + 1].lower()])
                        color_under_bit = True
                    else:
                        expanded_line.append([c, None])
                        color_under_bit = False
                elif c in self.colors:
                    expanded_line.append([' ', c])
                else:
                    expanded_line.append([c, None])
            world.append(expanded_line)
        return world

    def get_bit_loc(self):
        for y, line in enumerate(self.world):
            for x, c in enumerate(line):
                if c[0] in self.bits:
                    return {'x' :x, 'y': y}
        # if we got here, no bit!
        raise Exception(f"Did not find Bit in world!")

    def left(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        updated = self.bits[(self.bits.index(current[0]) - 1) % 4]
        self.world[self.bit_loc['y']][self.bit_loc['x']] = [updated, current[1]]
    
    def right(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        updated = self.bits[(self.bits.index(current[0]) + 1) % 4]
        self.world[self.bit_loc['y']][self.bit_loc['x']] = [updated, current[1]]

    def get_next(self, current_char):
        if current_char == '^': # up
            next_y = self.bit_loc['y'] - 1
            next_x = self.bit_loc['x']
        elif current_char == '>': # right
            next_y = self.bit_loc['y']
            next_x = self.bit_loc['x'] + 1
        elif current_char == 'v': # down
            next_y = self.bit_loc['y'] + 1
            next_x = self.bit_loc['x']
        elif current_char == '<': # left
            next_y = self.bit_loc['y']
            next_x = self.bit_loc['x'] - 1
        next_space = self.world[next_y][next_x]
        return (next_x, next_y, next_space)

    def move(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        next_x, next_y, next_space = self.get_next(current[0])

        if next_space[0] == ' ':
            # we have a legitimate space to move to
            self.world[next_y][next_x][0] = current[0]
            self.world[self.bit_loc['y']][self.bit_loc['x']][0] = ' ' 
            self.bit_loc = {'x': next_x, 'y': next_y} 
        else:
            # wall!
            raise Exception(f"Bad move, front is not clear!")

    def paint(self, color):
        # paints the current square
        if color != 'white' and color not in self.colors.values():
            raise Exception(f"Bad color:{color}!")
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        if color == 'white':
            current[1] = None # none is white
        else:
            current[1] = color[0]

        self.world[self.bit_loc['y']][self.bit_loc['x']] = current 

    def front_clear(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        next_space = self.get_next(current[0])[2][0]
        return next_space not in 'wW'

    def left_clear(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        current = self.bits[(self.bits.index(current[0]) - 1) % 4]
        next_space = self.get_next(current)[2][0]
        return next_space not in 'wW'

    def right_clear(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        current = self.bits[(self.bits.index(current[0]) + 1) % 4]
        next_space = self.get_next(current)[2][0]
        return next_space not in 'wW'

    def get_color(self):
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        color = current[1]
        if color in self.colors:
            return self.colors[color]
        return None

    def reset(self):
        self.world = self.load_world(self.world_text)
        self.bit_loc = self.get_bit_loc()

# if __name__ == "__main__":
#     print("Bit should be run as a library")
