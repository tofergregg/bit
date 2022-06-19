#!/usr/bin/env python3

from bit import Bit
import json

def main():
    global bit
    bit_programs = read_progs('bit-programs.json') 
    bit = Bit(bit_programs[1]['worlds'][0]['world'])
    prog = bit_programs[1]['program']['python']
    prog_gen = translate_prog(prog)
    all_bit_steps = functionSteps(prog, prog_gen)
    for step in all_bit_steps:
        bit.world = step['world']
        bit.bit_loc = step['bit_loc']
        print(bit)

def functionSteps(prog, func_call):
    all_bit_steps = [];
    savedBitWorld = json.loads(json.dumps(bit.world))
    savedBitLoc = json.loads(json.dumps(bit.bit_loc))

    try:
        exec(func_call, globals())
    except Exception as e:
        print("Error while running exec")
        print(e)

    gen = place_flag(bit)
    lines = prog.split('\n')
    reps = 0
    last_line = 0;
    while True:
        if reps > 1000:
            print("possible infinite loop.")
            print("too many instructions -- possible infinite loop!")
            # restore bit
            bit.world = savedBitWorld
            bit.bit_loc = savedBitLoc
            return []
        try:
            ret = next(gen)
            print(f'Executed line {ret}, {lines[ret]}')
            bitStep = { 'lineNum': lines[ret],
                    'world': json.loads(json.dumps(bit.world)),
                    'bit_loc': json.loads(json.dumps(bit.bit_loc)),
                    }
            last_line = ret
            all_bit_steps.append(bitStep)
        except StopIteration:
            # we finished, and need to add one more
            bitStep = { 'lineNum': last_line + 1,
                    'world': json.loads(json.dumps(bit.world)),
                    'bit_loc': json.loads(json.dumps(bit.bit_loc)),
                    }
            all_bit_steps.append(bitStep)
            bit.world = savedBitWorld
            bit.bit_loc = savedBitLoc
            return all_bit_steps
#          except:
#              bit.world = savedBitWorld
#              bit.bit_loc = savedBitLoc
#              print("uh-oh")
#              return []


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
        if line == '': continue
        if line.endswith(':'):
            next_line = lines[idx + 1]
            indent = len(next_line) - len(next_line.lstrip())
        else:
            indent = len(line) - len(line.lstrip())
            
        prog_gen += f'{" " * indent}yield({idx + 1})\n' 
    
    return prog_gen 


if __name__ == "__main__":
    main()
