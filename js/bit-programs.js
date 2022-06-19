const bitPrograms = [
    {
        name: "Simple Bit Problems",
        type: "divider",
    },



    {
        name: "move red square to ledge",
        type: "program",
        worlds: [
            {
                dim: "5x3",
                world:
`wwwwwww
w     w
w     w
w>r WWw
wwwwwww
`,
    },
        ],
        program:
        {
            js:
`function moveRedSquareToLedge(bit) {
    bit.move();
    bit.erase();
    bit.move();
    bit.left();
    bit.move();
    bit.right();
    bit.move();
    bit.paint('red');
    bit.move();
}
`,
            python:
`def moveRedSquareToLedge(bit):
    bit.move()
    bit.erase()
    bit.move()
    bit.left()
    bit.move()
    bit.right()
    bit.move()
    bit.paint('red')
    bit.move()
`,
        },
    },



    {
        name: "color line test",
        type: "program",
        worlds: [
            {
                dim: "8x8",
                world:
`wwwwwwwwww
w        w
w        w
w        w
w        w
w        w
w        w
w        w
w>       w
wwwwwwwwww
`,
    },
            {
                dim: "1x1",
                world:
`www
w>w
www
`,
    },
        ],
        program:
        {
            js:
`function test(bit) {
    colorLine(bit, 'blue');
    bit.left();
    colorLine(bit, 'green');
}

function colorLine(bit, color) {

}
`,
            python:
`def test(bit):
    colorLine(bit, 'blue')
    bit.left()
    colorLine(bit, 'green')

def colorLine(bit, color):
    pass
`,
        },
    },



    {
        name: "place flag",
        type: "program",
        worlds: [
            {
                dim: "8x6",
                world:
`wwwwwwwwww
w        w
w        w
w    WWWWw
w    WWWWw
w>   WWWWw
wWWWWWWWWw
wwwwwwwwww
`,
    },
            {
                dim: "13x11",
                world:
`wwwwwwwwwwwwwww
w             w
w             w
w         WWWWw
w         WWWWw
w         WWWWw
w         WWWWw
w         WWWWw
w         WWWWw
w         WWWWw
w>        WWWWw
wWWWWWWWWWWWWWw
wwwwwwwwwwwwwww
`,
            },
        ],
        program:
        {
            js:
`function place_flag(bit) {
    // places a flag at the top of the mountain
    while (bit.front_clear()) {
        bit.move();
    }
    bit.left();
    while (!bit.right_clear()) {
        bit.move();
    }
    bit.right();
    bit.move();
    while (bit.front_clear() && !bit.right_clear()) {
        bit.move();
    }
    bit.paint('red');
    climb_down(bit);
    // return to original direction
    bit.right();
    bit.right();
}

function climb_down(bit) {
    bit.right();
    bit.right();
    while (!bit.left_clear()) {
        bit.move();
    }
    bit.left();
    while (bit.front_clear()) {
        bit.move();
    }
    bit.right();
    while (bit.front_clear()) {
        bit.move();
    }
}
`,
            python:
`def place_flag(bit):
    while bit.front_clear():
        bit.move()
    bit.left()
    while not bit.right_clear():
        bit.move()
    bit.right()
    bit.move()
    while bit.front_clear() and not bit.right_clear():
        bit.move()
    bit.paint('red')
    climb_down(bit)
    bit.right()
    bit.right()
    return bit

def climb_down(bit):
    bit.right()
    bit.right()
    while not bit.left_clear():
        bit.move()
    bit.left()
    while bit.front_clear():
        bit.move()
    bit.right()
    while bit.front_clear():
        bit.move()
`,
        },
    },



    {
        name: "bit1",
        type: "program",
        worlds: [
            {
                dim: "3x3-case1",
                world:
`wwwww
w>  w
w   w
w   w
wwwww
`,
            },
            {
                dim: "3x3-case2",
                world:
`wwwww
w> Ww
wW Ww
w   w
wwwww
`,
            },
            {
                dim: "3x3-case3",
                world:
`wwwww
wWW w
w> Ww
wW  w
wwwww
`,
            },
            {
                dim: "3x3-case4",
                world:
`wwwww
w W w
wW> w
w W w
wwwww
`,
            },
        ],
        program: {
            js:
`function do_bit1(bit) {
    bit.move();
    bit.paint('blue');
    bit.right();
    bit.move();
    bit.paint('green');
}
`,
            python:
`def do_bit1(bit):
    # Bit starts in the upper left square facing
    # the right side of the world. The code for
    # this one is complete. The code paints the
    # square to the right of start square blue,
    # and the square below that green.
    # Run the code to see how it works.

    bit.move()
    bit.paint('blue')
    bit.right()
    bit.move()
    bit.paint('green')
`,
        },
    },



    {
        name: "bit2",
        type: "program",
        worlds: [
            {
                dim: "3x3-case-1",
                world:
`wwwww
w>  w
w   w
w   w
wwwww
`,
            },
            {
                dim: "3x3-case-2",
                world:
`wwwww
w>W w
w W w
w   w
wwwww
`,
            },
            {
                dim: "3x3-case-3",
                world:
`wwwww
wW> w
w  Ww
w   w
wwwww
`,
            },
            {
                dim: "4x4",
                world:
`wwwwww
wWW>Ww
wW   w
wW   w
w  W w
wwwwww
`,
            },
        ],
        program: {
            js:
`function do_bit2(bit) {
    // TODO: your code here
}
`,
            python:
`def do_bit2(bit):
    # Bit starts in the upper left square
    # facing the right side of the world.
    # Paint the square below the start square
    # green, and also the square below that.
    # Leave bit on the second green square, facing down.
    pass
`,
        },
    },



    {
        name: "bit3",
        type: "program",
        worlds: [
            {
                dim: "3x4",
                world:
`wwwww
w>  w
w   w
w   w
wwwww
`,
            },
            {
                dim: "5x4",
                world:
`wwwwwww
w>    w
w     w
w     w
w     w
wwwwwww
`,
            },
            {
                dim: "4x3",
                world:
`wwwwww
w>   w
w    w
w    w
wwwwww
`,
            },
        ],
        program: {
            js:
`function do_bit3(bit) {

}
`,
            python:
`def do_bit3(bit):
    # Bit starts in the upper left square
    # facing the right side of the world.
    # Paint the upper left square red, the
    # square to its right green, and the next
    # square to the right blue. Leave bit on
    # the blue square, facing the right side
    # of the world.
    pass
`,
        },
    },



    {
        name: "bit4",
        type: "program",
        worlds: [
            {
                dim: "3x4",
                world:
`wwwww
w>  w
w   w
w   w
wwwww
`,
            },
            {
                dim: "5x5",
                world:
`wwwwwwww
w>     w
w      w
w      w
w      w
w      w
wwwwwwww
`,
            },
            {
                dim: "4x6",
                world:
`wwwwww
w>   w
w    w
w    w
w    w
w    w
w    w
wwwwww
`,
            },
        ],
        program: {
            js:
`function do_bit4(bit) {

}
`,
            python:
`def do_bit4(bit):
    # Bit starts in the upper left square facing
    # the right side of the world. Paint the start
    # square red, the square diagonally below-right
    # from it green, and the square diagonally
    # below-right from there blue. Leave bit on the
    # blue square, facing the right side of the world.
    pass
`,
        },
    },



    {
        name: "bit5",
        type: "program",
        worlds: [
            {
                dim: "4x4",
                world:
`wwwwww
w>   w
w    w
w    w
w    w
wwwww
`,
            },
            {
                dim: "4x4.2",
                world:
`wwwwww
wv   w
w    w
w    w
w    w
wwwww
`,
            },
            {
                dim: "bit5a",
                world:
`wwwwww
w    w
w    w
w    w
w    w
w   <w
wwwwww
`,
            },
            {
                dim: "bit5b",
                world:
`wwwwww
w    w
w    w
w    w
w    w
w^   w
wwwwww
`,
            },
        ],
        program: {
            js:
`function do_bit5(bit) {

}
`,
            python:
`def do_bit5(bit):
    # Bit starts in a corner square, facing in
    # some direction. Move bit forward and paint
    # that square blue. Move bit forward again
    # and paint that square green. Leave bit on
    # the green square. The code for this is simple,
    # but it shows that wherever bit starts, the #
    # moves and turns are relative to that start position.
    pass
`,
        },
    },



    {
        name: "bitT",
        type: "program",
        worlds: [
            {
                dim: "bitT1",
                world:
`wwwwwwww
w      w
wWW^WWWw
wWWWWWWw
wwwwwwww
`,
            },
            {
                dim: "bitT2",
                world:
`wwwwwwwww
w       w
w       w
w       w
w       w
wWWWW^WWw
wWWWWWWWw
wWWWWWWWw
wwwwwwwww
`,
            },
            {
                dim: "bitT3",
                world:
`wwwww
w   w
wW^Ww
wwwww
`,
            },
        ],
        program: {
            js:
`function do_bitT(bit) {

}
`,
            python:
`def do_bitT(bit):
    # Bit starts in a little hole, facing up.
    # Paint the first square green. Paint the
    # square above that blue. The squares to
    # the left and right of the blue square,
    # paint blue also. Leave bit on the rightmost
    # blue square, facing the right side of the
    # world. This makes a little "T" shape.
    pass
`,
        },
    },



    {
        name: "Bit Loop",
        type: "divider",
    },



    {
        name: "go-green",
        type: "program",
        worlds: [
            {
                dim: "12x3",
                world:
`wwwwwwwwwwwwww
w>           w
w            w
wwwwwwwwwwwwww
`,
            },
            {
                dim: "5x3",
                world:
`wwwww
w>  w
w   w
wwwww
`,
            },
            {
                dim: "8x3",
                world:
`wwwwwwwwww
w>       w
w        w
wwwwwwwwww
`,
            },
            {
                dim: '1x3',
                world:
`www
w>w
w w
www
`,
            }
        ],
        program: {
            js:
`function go_green(bit) {
    while (bit.front_clear()) {
        bit.move();
        bit.paint('green');
    }
}
`,
            python:
`def go_green(bit):
    # Bit starts in the upper left square
    # facing the right side of the world.
    # Move bit forward until blocked. Paint
    # each moved-to square green. This is a
    # demo - the code is complete.
    while bit.front_clear():
        bit.move()
        bit.paint('green')
`,
        },
    },



    {
        name: "grounded",
        type: "program",
        worlds: [
            {
                dim: "5x7",
                world:
`wwwwwwwww
w   v   w
w       w
w       w
w       w
w       w
wwwwwwwww
`,
    },
            {
                dim: "9x12",
                world:
`wwwwwwwwwww
w         w
w         w
w         w
w     v   w
w         w
w         w
w         w
w         w
w         w
w         w
w         w
w         w
wwwwwwwww
`,
            },
            {
                dim: "3x1",
                world:
`wwwww
w v w
wwwww
`,
    },
        ],
        program:
        {
            js:
`function grounded(bit) {

}
`,
            python:
`def grounded(bit):
    # Bit is somewhere in the world facing down.
    # Move bit down to the bottom of the world.
    # Paint the whole bottom row of the world green.
    # Leave bit at the bottom right square of the
    # world, facing the right edge.
    pass
`,
        },
    },



    {
        name: "Reverse Coyote",
        type: "program",
        worlds: [
            {
                dim: "9x9",
                world:
`wwwwwwwwwww
w         w
w         w
w         w
w >       w
w     WWWWw
w       WWw
w       WWw
w       WWw
w       WWw
wwwwwwwwwww
`,
    },
        ],
        program:
        {
            js:
`function func_name(bit) {
}
`,
            python:
`def func_name(bit):
    # The coyote is hanging in space, facing 
    # the right side of the world. The coyote 
    # moves forward to get back onto the cliff. 
    # Move the coyote forward to the first square 
    # with a solid black block below it, that is, 
    # back onto solid land. Paint the very first
    # square green, and all the moved-to squares blue. 
    pass
`,
        },
    },
    



    {
        name: "do-rgb",
        type: "program",
        worlds: [
            {
                dim: "8x3",
                world:
`wwwwwwwwww
w>       w
w        w
w        w
wwwwwwwwww
`,
    },
            {
                dim: "3x3",
                world:
`wwwww
w>  w
w   w
w   w
wwwww
`,
    },
            {
                dim: "2x3",
                world:
`wwww
w> w
w  w
w  w
wwww
`,
    },
            {
                dim: "1x3",
                world:
`www
w>w
w w
w w
www
`,
    },
        ],
        program:
        {
            js:
`function do_rgb(bit) {
}
`,
            python:
`def do_rgb(bit):
    # Bit starts in the upper left square 
    # facing the right side of the world. 
    # Paint the first square red. Move bit 
    # forward until blocked. Paint each 
    # moved-to square green, except the very 
    # last (rightmost) square, paint blue. 
    # If the first square and last square are 
    # the same, paint it blue. It's ok if the 
    # code paints a square one color, and then 
    # paints it again with its correct, final 
    # color. This problem depends on lines of 
    # code before and after the loop code. 
    pass
`,
        },
    },



    {
        name: "Homework",
        type: "divider",
    },



    {
        name: "checkerboard",
        type: "program",
        worlds: [
            {
                dim: "4x4",
                world:
`wwwwww
w    w
w    w
w    w
w>   w
wwwwww
`,
            },
            {
                dim: "5x5",
                world:
`wwwwwww
w     w
w     w
w     w
w     w
w>    w
wwwwwww
`,
            },
            {
                dim: "10x6",
                world:
`wwwwwwwwwwww
w          w
w          w
w          w
w          w
w          w
w>         w
wwwwwwwwwwww
`,
            },
            {
                dim: "2x6",
                world:
`wwww
w  w
w  w
w  w
w  w
w  w
w> w
wwww
`,
            },
            {
                dim: "6x2",
                world:
`wwwwwwww
w      w
w>     w
wwwwwwww
`,
            },
            {
                dim: '2x2',
                world:
`wwww
w  w
w> w
wwww
`,
            }
        ],
        program: {
            js:
`function checkerboard(bit) {

}
`,
            python:
`def checkerboard(bit):
    pass
`,
        },
    },
];
