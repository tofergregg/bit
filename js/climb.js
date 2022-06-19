program=`climb = (world_text, ctx) => {
    bit = new Bit(world_text, ctx);
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
    return bit;
}

climb_down = (bit) => {
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
`

const add_yields = (prog) => {
    let newProg = "";
    // replace all '{' with newline and yield(lineNum);
    progLines = prog.split('\n');
    for (let lineNum = 1; lineNum < progLines.length + 1; lineNum++) {
        let line = progLines[lineNum - 1];
        for (let c of line) {
            if (c == '{' || c == ';') {
                newProg += c + '\nyield(' + lineNum + ');';
            } else {
                newProg += c;
            }
        }
        newProg += '\n';
    }
    return newProg;
}
