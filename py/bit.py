from browser import window
import json
import io
from contextlib import redirect_stdout

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
            if line == '':
                break
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
        if color not in self.colors.values():
            raise Exception(f"Bad color:{color}!")
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
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

    def erase(self):
        # clears color
        current = self.world[self.bit_loc['y']][self.bit_loc['x']]
        current[1] = None 


    def reset(self):
        self.world = self.load_world(self.world_text)
        self.bit_loc = self.get_bit_loc()

def functionSteps(prog, prog_gen, func_call):
    all_bit_steps = [];

    savedBitWorld = json.loads(json.dumps(bit.world))
    savedBitLoc = json.loads(json.dumps(bit.bit_loc))

    try:
        exec(prog_gen, globals())
        print("prog_gen executed okay")
    except Exception as e:
        print("Error while running exec")
        lineNum = (e.lineno - 1) // 2;
        print(e.lineno)
        progLines = prog.split('\n')
        print("progLines:")
        print(progLines)
        
        print(e)
        errorMsg = e.__str__() + ".\n" + str(lineNum) + " " + progLines[lineNum]
        return {'steps': [],
                'errorMsg': errorMsg
        }

    gen = exec(func_call);
    lines = prog.split('\n')
    reps = 0
    last_line = 0;
    while True:
        if reps > 5000:
            print("possible infinite loop.")
            print("too many instructions -- possible infinite loop!")
            # restore bit
            bit.world = savedBitWorld
            bit.bit_loc = savedBitLoc
            return {'steps': all_bit_steps, 
                    'errorMsg': 'Too many instructions -- possible infinite loop!',
                    }
        try:
            ret = next(gen)
            if ret < len(lines):
                print(f'Executed line {ret}, {lines[ret]}')
                bitStep = { 'lineNum': ret,
                        'world': json.loads(json.dumps(bit.world)),
                        'bitLoc': json.loads(json.dumps(bit.bit_loc)),
                        }
                last_line = ret
                all_bit_steps.append(bitStep)
                reps += 1
        except StopIteration:
            # we finished, and need to add one more
            bitStep = { 'lineNum': last_line + 1,
                    'world': json.loads(json.dumps(bit.world)),
                    'bitLoc': json.loads(json.dumps(bit.bit_loc)),
                    }
            all_bit_steps.append(bitStep)
            bit.world = savedBitWorld
            bit.bit_loc = savedBitLoc
            return {'steps': all_bit_steps,
                    'errorMsg': '',
                    }
        except Exception as e:
             bit.world = savedBitWorld
             bit.bit_loc = savedBitLoc
             print(e)
             errorMsg = e.__str__()
             return {'steps': all_bit_steps,
                     'errorMsg': errorMsg,
                     }


def read_progs(filename):
    with open(filename) as f:
        return json.load(f)
   
def translate_prog(prog):
    # find functions
    lines = prog.split('\n')
    funcs = []
    for line in lines:
        if line.startswith('def '):
            # we'll do this in a very non-parser way
            # we're assuming there are no line breaks that are important
            tokens = line.split(' ')
            # ['def', 'place_flag(bit):']
            func_split = tokens[1].split('(')
            func = func_split[0]
            args = func_split[1][:-2].split(',')
            funcs.append({'func': func, 'args': args})
    
    prog_gen = ''
    # after each line, put a yield statement
    # we have to indent to the proper place always, which includes
    # extra indentation for lines that end with a colon
    # we are assuming spaces, not tabs
    for idx, line in enumerate(lines):
        # see if we are calling a function in our prog
        for func in funcs:
            if line.lstrip().startswith(func['func'] + '('):
                line = line.replace(func['func'], f'yield from {func["func"]}', 1) 
                break

        prog_gen += line + '\n'
        if line == '':
            # put a blank line for consistency
            prog_gen += line + '\n'
            continue
        if line.endswith(':'):
            next_line = lines[idx + 1]
            indent = len(next_line) - len(next_line.lstrip())
        else:
            indent = len(line) - len(line.lstrip())
            
        prog_gen += f'{" " * indent}yield({idx + 1})\n' 
    
    return prog_gen 

def brythonFunctionSteps():
    global bit
    # make next line generic
    # bit = Bit(window.bitPrograms[1]['worlds'][1]['world'])
    bit = Bit(window.currentWorld)
    # prog = window.bitPrograms[1]['program']['python']
    prog = window.currentPyProg;
    # special handling for Nick Bit compatibility
    prog = prog.replace('bit = Bit(filename)', 'pass')
    prog = prog.replace('filename', 'bit')
    print("prog:")
    print(prog)
    prog_gen = translate_prog(prog)
    print("prog_gen:")
    print(prog_gen)
    func_call = window.currentPyFuncCall;
    # special handling for Nick Bit compatibility
    func_call = func_call.replace('filename', 'bit')
    all_bit_steps = functionSteps(prog, prog_gen, func_call)
    window.pyOutput = all_bit_steps

def brythonOneLiner():
    global retVal
    global bit
    mainCode = window.mainCode
    exec(mainCode, globals())
    bit = Bit(window.origWorld)
    bit.bit_loc = json.loads(window.currentBitLoc)
    startWorld = json.loads(window.currentWorld)
    bit.world = json.loads(window.currentWorld)
    statement = window.pythonStatement
   
    if statement.strip().startswith('print'):
        try:
            f = io.StringIO()
            with redirect_stdout(f):
                exec(statement, globals())
            window.pyOutput = str(f.getvalue())
        except Exception as e:
            window.pyOutput = str(e) 
    elif statement.strip().startswith('bit.'):
        try:
            exec(f'retVal = {statement}', globals())
        except Exception as e:
            retVal = f'Exception: {str(e)}'
        if retVal != None:
            window.pyOutput = str(retVal)
        else:
            # bit's state might have changed
            window.pyOutput = { 'world': bit.world, 'bitLoc': bit.bit_loc }
    else:
        # try to get a return value, but if that fails, don't bother
        try:
            exec(f'retVal = {statement}', globals())
        except SyntaxError:
            print('syntax error')
            try:
                exec(statement, globals())
                retVal = ''
            except Exception as e:
                retVal = str(e)
        except Exception as e:
            print(e)
            retVal = str(e)

        # in some cases (e.g., if the user calls a function that uses bit),
        # bit could change state, and we'll return that
        if bit.world != startWorld:
            window.pyOutput = { 'world': bit.world, 'bitLoc': bit.bit_loc }
        else:
            window.pyOutput = str(retVal)


if __name__ == "__main__":
    print("setting up py functions");
    window.brythonFunctionSteps = brythonFunctionSteps
    window.brythonOneLiner = brythonOneLiner

