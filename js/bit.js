"use strict";
//`wwwwwwwwww
//w        w
//w        w
//w    WWWWw
//w    WWWWw
//w>   WWWWw
//wWWWWWWWWw
//wwwwwwwwww
const mountain_world1 = 
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

Anything after a blank line is a comment

small w: outer wall
large W: inner wall

>: Bit facing right
^: Bit facing up
<: Bit facing left
v: Bit facing down
Note: if there is a color under Bit, then the character
after Bit will be either R, G, or B (uppercase). This
does make the visual appearance look strange. E.g.,

wwwwwwwwww
w        w
w        w
w    WWWWw
w    WWWWw
w>B   WWWWw
wWWWWWWWWw
wwwwwwwwww

This means that blue is the bit color. It is still a
rectangular shape.

r: red
b: blue
g: green
`
class Bit {
    constructor(world_text, ctx) {
        this.world_text = world_text;
        this.bits = ">v<^"; // right, down, left, up
        this.colors = {'r':'red', 'g':'green', 'b':'blue'};
        this.numrows = 0;
        this.numcols = 0;
        this.scale = 1;
        this.world = this.load_world(world_text);
        this.bitLoc = this.get_bitLoc();
        this.ctx = ctx;
        this.drawWhenChanged = true;
    }

    load_world(world_text) {
        const world = [];
        let color_under_bit = false;

        const lines = world_text.split('\n');
        for (const line of lines) {
            if (line == "") {
                break;
            }
            const expanded_line = [];
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (color_under_bit) {
                    color_under_bit = false;
                    continue;
                }
                if (this.bits.indexOf(c) != -1) {
                    // special case: bit could have a color underneath
                    if ('RGB'.indexOf(line[i + 1]) != -1) { //  must be uppercase
                        expanded_line.push([c, line[i + 1].toLowerCase()]);
                        color_under_bit = false;
                    } else {
                        expanded_line.push([c, null]);
                        color_under_bit = false;
                    }
                } else if (c in this.colors) {
                    expanded_line.push([' ', c]);
                } else {
                    expanded_line.push([c, null]);
                }
            }
            world.push(expanded_line);
        }
        this.numrows = world.length - 2;
        this.numcols = world[0].length - 2;
        this.scale = 8 * Math.max(this.numrows, this.numcols) ** -1; 
        return world;
    }

    get_bitLoc() {
        for (let y = 0; y < this.world.length; y++) {
            const line = this.world[y];
            for (let x = 0; x < line.length; x++) {
                const c = line[x];
                if (this.bits.indexOf(c[0]) != -1) {
                    return {'x' :x, 'y': y}
                }
            }
        }
        // if we got here, no bit!
        throw("Did not find Bit in '" + this.world_text + "'!")
    }
        
    toString() {
        const RED = 'R';
        const BLUE = 'B';
        const GREEN = 'G';

        let s = "";
        for (const line of this.world) {
            for (const c of line) {
                let COLOR = null;
                if (c[1] == null) {
                    s += c[0]
                } else {
                    if (c[1] == 'r') {
                        COLOR = RED
                    } else if (c[1] == 'g') {
                        COLOR = GREEN
                    } else {
                        COLOR = BLUE;
                    }
                    s += COLOR; // should really be c[0] colored
                }
            }
            s += '\n';
        }
        return s
    }

    drawWorld() {
        for (let y = 1; y < this.world.length - 1; y++) { // skip top and bottom
            const line = this.world[y];
            for (let x = 1; x < line.length - 1; x++) { // skip 1st and last col
                const square = line[x];
                // draw color
                drawObject(x - 1, y - 1, this.scale, square[1]);

                // draw bit (but if there is a color, don't draw walls, blanks)
                if (square[1] == null || this.bits.indexOf(square[0]) != -1) {
                    drawObject(x - 1, y - 1, this.scale, square[0]);
                }
            }
        }
    }

    left() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        let updated_idx = this.bits.indexOf(current[0]) - 1;
        if (updated_idx == -1) {
            updated_idx = this.bits.length - 1;
        }
        const updated = this.bits[updated_idx];
        this.world[this.bitLoc['y']][this.bitLoc['x']] = [updated, current[1]];
        if (this.drawWhenChanged) {
            this.drawWorld();
        }
    }

    right() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']]
        const updated = this.bits[(this.bits.indexOf(current[0]) + 1) % 4]
        this.world[this.bitLoc['y']][this.bitLoc['x']] = [updated, current[1]]
        if (this.drawWhenChanged) {
            this.drawWorld();
        }
    }

    get_next(current_char) {
        let next_x, next_y, next_space;
        if (current_char == '^') { // up
            next_y = this.bitLoc['y'] - 1;
            next_x = this.bitLoc['x'];
        } else if (current_char == '>') { // right
            next_y = this.bitLoc['y'];
            next_x = this.bitLoc['x'] + 1;
        } else if (current_char == 'v') { // down
            next_y = this.bitLoc['y'] + 1;
            next_x = this.bitLoc['x'];
        } else if (current_char == '<') { // left
            next_y = this.bitLoc['y'];
            next_x = this.bitLoc['x'] - 1;
        }
        next_space = this.world[next_y][next_x];
        return [next_x, next_y, next_space];
    }

    move() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        let next_x, next_y, next_space;
        [next_x, next_y, next_space] = this.get_next(current[0]);

        if (next_space[0] == ' ') {
            // we have a legitimate space to move to
            this.world[next_y][next_x][0] = current[0];
            this.world[this.bitLoc['y']][this.bitLoc['x']][0] = ' ';
            this.bitLoc = {'x': next_x, 'y': next_y}; 
        } else {
            // wall!
            throw("Bad move, front is not clear!");
        }
        if (this.drawWhenChanged) {
            this.drawWorld();
        }
    }

    paint(color) {
        // paints the current square
        if (Object.values(this.colors).indexOf(color) == -1) {
            throw ("Bad color: " + color + "!");
        }
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        current[1] = color[0];

        this.world[this.bitLoc['y']][this.bitLoc['x']] = current;
        if (this.drawWhenChanged) {
            this.drawWorld();
        }
    }

    front_clear() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        const next_space = this.get_next(current[0])[2][0];
        return 'wW'.indexOf(next_space) == -1;
    }

    left_clear() {
        let current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        let current_idx = this.bits.indexOf(current[0]) - 1;
        if (current_idx == -1) {
            current_idx = this.bits.length - 1;
        }
        current = this.bits[current_idx];
        const next_space = this.get_next(current)[2][0]
        return 'wW'.indexOf(next_space) == -1;
    }

    right_clear() {
        let current = this.world[this.bitLoc['y']][this.bitLoc['x']]
        current = this.bits[(this.bits.indexOf(current[0]) + 1) % 4]
        const next_space = this.get_next(current)[2][0]
        return 'wW'.indexOf(next_space) == -1;
    }

    get_color() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        const color = current[1];
        if (color in this.colors) {
            return this.colors[color]
        }
        return null;
    }

    erase() {
        const current = this.world[this.bitLoc['y']][this.bitLoc['x']];
        current[1] = null;
    }

    reset() {
        this.world = this.load_world(this.world_text);
        this.bitLoc = this.get_bitLoc();
        bit.drawWorld();
    }
}

const drawObject = (x, y, scale, objStr) => {
    const img = getImgFromName(objStr); 
    // 0, 0 is top left
    const leftBorder = 30;
    const topBorder = 30; 
    const imgWidth = 50;
    const myCanvas = document.getElementById('bitCanvas');
    const ctx = myCanvas.getContext("2d");
    ctx.drawImage(img, leftBorder/scale + (x * imgWidth), topBorder/scale + (y * imgWidth), 50, 50);
}

const getImgFromName = (objName) => {
    // potential names:
    // null, " " : blank square
    // "wall"
    // 'W' (duplicate)
    // 'w' (dupliate)
    // 'r', 'g', 'b'
    // 'R', 'G', 'B'
    // '>', 'v', '<', '^'
    let bit_img;
    if (objName == " " || objName == null) {
        bit_img = document.getElementById('bit_blank');
    } else if (objName == "wall" || objName.toLowerCase() == 'w') {
        bit_img = document.getElementById('wall');
    } else if (objName.toLowerCase() == "r") {
        bit_img = document.getElementById('red_square');
    } else if (objName.toLowerCase() == "g") {
        bit_img = document.getElementById('green_square');
    } else if (objName.toLowerCase() == "b") {
        bit_img = document.getElementById('blue_square');
    } else if (objName == ">") {
        bit_img = document.getElementById('bit_right');
    } else if (objName == "v") {
        bit_img = document.getElementById('bit_down');
    } else if (objName == "<") {
        bit_img = document.getElementById('bit_left');
    } else if (objName == "^") {
        bit_img = document.getElementById('bit_up');
    } 
    return bit_img;
}

const drawMainElements = (bit) => {
    let border = 20;
    const scale = bit.scale;
    const ctx = bit.ctx;
    const numcols = bit.numcols;
    const numrows = bit.numrows;
    // scale = 8 * Math.max(numrows, numcols) ** -1; 
    border = border / scale;
    ctx.scale(scale, scale);
    ctx.beginPath();
    // ctx.rect(border, border, border + 100/scale * numcols / scale, border + 100/scale * numrows / scale);
    ctx.rect(border, border, border + 50 * numcols, border + 50 * numrows);
    ctx.stroke();
    //    for (let x = 0; x < numcols; x++) {
    //        for (let y = 0; y < numrows; y++) {
    //            drawObject(x, y, scale, "v");
    //        }
    //    }
    // const scaledFontSize = 18 / scale;
    // ctx.font = scaledFontSize + 'px arial';
    // ctx.fillStyle = 'black';
    // ctx.fillText('Bit REPL:', 20 / scale, 470 / scale);
    // ctx.fillText('Program:', 460 / scale, 30 / scale);
}

const evalProg = (prog) => {
    let func1, newProg;
    [func1, newProg] = translateProg(prog);

    // need the functions to be globally scoped
    let progError = false;
    try {
        (function(){
            eval.apply(this, arguments);
        }(newProg));
    }
    catch (err) {
        alert(err);
        console.log(err);
        progError = true;
    }
    setupSteps(func1, progError, 'js');
}

const setupSteps = (func1, progError, language, pyProg) => {
    // set up steps
    const firstFuncSpan = document.getElementById('first-func');
    const stepsSlider = document.getElementById('stepsRange');
    firstFuncSpan.style.fontSize = "100%"; 
    firstFuncSpan.innerText = "X";
    const oneLineHeight = firstFuncSpan.getBoundingClientRect().height;
    if (progError || func1 == null) {
        firstFuncSpan.innerText = 'nothing to step through';
        stepsSlider.disabled = true;
        disablePlayButtons(true); 
    } else {
        let funcCall = func1.name + '(';
        for (let i = 0; i < func1.param.length; i++) {
            const param = func1.param[i];
            funcCall += param;
            if (i < func1.param.length - 1) {
                funcCall += ', ';
            } else {
                funcCall += ')';
            }
        }
        // update slider and buttons

        disablePlayButtons(false); 
        firstFuncSpan.innerText = funcCall + ' steps:';
        for (let i = 0; i < 99; i++) {
            let currentHeight = firstFuncSpan.getBoundingClientRect().height;
            console.log(currentHeight);
            if (currentHeight <= oneLineHeight) {
                break;
            }
            firstFuncSpan.style.fontSize = 100 - (i + 1) + "%"; 
        }
        stepsSlider.disabled = false;
        stepsSlider.value = 1;
        language = language.toLowerCase();
        let pyResult;
        let errorMsg;
        if (language == 'js' || language == 'javascript') {
            window.allBitSteps = functionSteps(funcCall);
        } else if (language.indexOf('py') != -1) {
            pyResult = pyFunctionSteps(funcCall, pyProg);
            window.allBitSteps = pyResult.steps;
            errorMsg = pyResult.errorMsg;
        }

        if (allBitSteps.length == 0) {
            // did not get a good run
            firstFuncSpan.innerText = 'nothing to step through';
            alert("Could not run program.");
            stepsSlider.disabled = true;
        } else {
            if (errorMsg != undefined && errorMsg != '') {
                console.log(errorMsg);
                alert(errorMsg);
                // stepsSlider.disabled = true;
                // document.getElementById('playButton').disabled = true;
                // console.log("returning after error");
            }
            stepsSlider.disabled = false;
            stepsSlider.max = allBitSteps.length;
            stepsSlider.oninput = function() {
                showStep();
            }
        }
    }
}

const showStep = () => {
    const stepVal = document.getElementById('stepsRange').value - 1;
    const bitState = allBitSteps[stepVal];
    console.log(bitState);
    if (bitState) {
        bit.world = JSON.parse(JSON.stringify(bitState.world));
        bit.bitLoc = JSON.parse(JSON.stringify(bitState.bitLoc));
        bit.drawWorld();
        const line = CodeMirrorMain.state.doc.line(bitState.lineNum);
        CodeMirrorMain.dispatch({selection: {anchor: line.from}});
        CodeMirrorMain.scrollPosIntoView(line.from);
    } else {
        alert("Could not run program.");
    }
}

const init = () => {
    console.log("in init");
    init.firstLoad = true;
    brython(1);
    window.pyvals = {};
    const waitForBrython = () => {
        if (window.brythonFunctionSteps !== undefined) {
            afterBrythonInit();
        } else {
            console.log('brython not finished...');
            setTimeout(waitForBrython, 100);
        }
    }
    waitForBrython();
}

const afterBrythonInit = () => {
    // init(1, bitPrograms[1].name, bitPrograms[1].program.js, bitPrograms[1].worlds, 0)
    // const init = (progIdx, name, program, worlds, worldIdx) => {
    document.getElementById('spinner').className = 'ref-container';
    const progDetails = {
        progIdx: 1,
        lang: 'python',
        // lang: 'js',
        worldIdx: 0,
    }
        /*
        name: bitPrograms[1].name,
        program: bitPrograms[1].program.js,
        worlds: bitPrograms[1].worlds,
        */

    const params = new URLSearchParams(window.location.search);

    if (params.has('lang')) {
        // should be 'js' or 'python'
        progDetails.lang = params.get('lang').toLowerCase();
        if (progDetails.lang == 'py') {
            progDetails.lang = 'python';
        }
    }
    document.getElementById('langSel').value = progDetails.lang;

    if (params.has('worldIdx')) {
        progDetails.worldIdx = parseInt(params.get('worldIdx'));
    }

    if (params.has('name')) {
        const paramName = params.get('name');
        for (let i = 0; i < bitPrograms.length; i++) {
            const bitProg = bitPrograms[i];
            if (bitProg.name == paramName) {
                progDetails.progIdx = i;
                progDetails.name = bitPrograms[i].name;
                progDetails.program = bitPrograms[i].program[progDetails.lang];
                progDetails.worlds = bitPrograms[i].worlds;
            } 
        }
    }

    const progIdx = progDetails.progIdx;
    progDetails.name = bitPrograms[progIdx].name;
    // the program may have been previously saved
    const savedProg = loadLocalProgram(progDetails.lang, progDetails.name);
    if (savedProg === undefined) {
        // nope, not saved
        progDetails.program = bitPrograms[progIdx].program[progDetails.lang];
    } else {
        progDetails.program = savedProg;
    }
    progDetails.worlds = bitPrograms[progIdx].worlds;
    
    console.log("calling initial setupWorld");

    setupWorld(progDetails.progIdx, progDetails.name, progDetails.program, progDetails.worlds, progDetails.worldIdx);
}

const setupWorld = (progIdx, name, program, worlds, worldIdx) => {
    const language = document.getElementById('langSel').value;
    document.getElementById('progName').innerText = name;
    init.progIdx = progIdx;
    const world = worlds[worldIdx].world;
    setupWorldSelector(worlds, worldIdx);
    const myCanvas = document.getElementById('bitCanvas');
    const ctx = myCanvas.getContext("2d");
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // add program to editor
    CodeMirrorMain.dispatch({changes: {from: 0, to: CodeMirrorMain.state.doc.length, insert: program}});
    window.bit = new Bit(world, ctx);
    let prog = CodeMirrorMain.state.doc.toString();
    // saveProgram(language, prog);
    if (language == 'js') {
        evalProg(prog);
    } else if (language.startsWith('py')) {
        evalPyProg(prog);
    }
    init.bit = bit;
    drawMainElements(bit);
    setupToolbar();
    bit.drawWorld();
    // add comment to repl
    const startText = "REPL: type statements here\ne.g., bit.move(); or bit.front_clear();\n";
    CodeMirrorRepl.dispatch({changes: {from: 0, to: CodeMirrorRepl.state.doc.length, insert: startText}});
}

const setupToolbar = () => {
    const slider = document.getElementById("speedRange");
    const speed = document.getElementById("speed");
    speed.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        speed.innerHTML = this.value;
    }
}

let PROGRAM=`function place_flag(bit) {
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
`

const translateProg = (prog) => {
    // This function sets us up for our very hacky proto-debugger
    // first, beautify the code so we have a better chance to quasi-parse it
    prog = js_beautify(prog);
    // get information about the functions out of the code
    JSHINT(prog);
    const data = JSHINT.data();
    const progLines = prog.split('\n');
    let funcGenerators = ''; 

    // replace 'function' with 'function*' to make each function
    // into a generator that accepts yield statements
    // We also want to rename the functions to prepend __gen_
    // so we can call it with their real names

    for (const func of data.functions) {
        const line_num = func.line - 1; // one-indexed
        const name = func.name;
        const mangledName = '__gen_' + name;
        const params = func.param;

        progLines[line_num] = progLines[line_num].replace(/^function/, 'function*');
        progLines[line_num] = progLines[line_num].replace(name, mangledName);

        // set up function generators to run one line at a time 
        funcGenerators += setupGenerator(name, mangledName, params) + '\n';

        // we need to find all calls to the functions, as well, so we can
        // prepend yield* to them and to change the name to the mangled name
        // We are assuming that a function call happens as the first thing on a line
        for (let i = 0; i < progLines.length; i++) {
            const line = progLines[i];
            const pos = line.indexOf(name);
            if (pos != -1) {
                const whitespace = line.substr(0, pos);
                if (whitespace && !whitespace.trim()) {
                    // the string starts with whitespace
                    progLines[i] = line.replace(name, 'yield* ' + mangledName);
                }
            }
        }
    }

    let newProg = "";
    // replace all '{' and ';' at the end of lines  with newline and yield lineNum;
    // (handle for loops as a special case)
    for (let lineNum = 1; lineNum < progLines.length + 1; lineNum++) {
        let line = progLines[lineNum - 1];
        const lastChar = line[line.length - 1];
        if (lastChar == '{' || lastChar == ';') {
            newProg += line + '\nyield ' + lineNum + ';';
        } else {
            newProg += line;
        }
        newProg += '\n';
    }
    newProg += funcGenerators + '\n';
    // console.log(newProg);
    if (data.functions.length > 0) {
        return [data.functions[0], newProg];
    } else {
        return [null, newProg];
    }
}

const setupGenerator = (name, mangledName, params) => {
    let func = 'function ' + name + '(__PARAMS__) {\n';
    func += `    try {
            gen = __MANGLED_NAME__(__PARAMS__);
        } 
        catch(err) {
            console.log("error:" + err.message);
        }

        let reps = 0;
        // execute it
    const runProg = () => {
        const timePerLoop = getTimePerLoop();
        reps++;
        if (reps > 1000) {
            clearInterval(runProg);
            console.log("possible infinite loop.");
            return "too many instructions -- possible infinite loop!";
        }
        let ret = {value: null};
        try {
            ret = gen.next();
        }
        catch(err) {
            const cursorPos = CodeMirrorMain.state.selection.main.head;
            const cursorLine = CodeMirrorMain.state.doc.lineAt(cursorPos);
            CodeMirrorMain.dispatch({selection: {anchor: cursorLine.to + 1}});
            CodeMirrorMain.scrollPosIntoView(cursorLine.to + 1);
            // give editor time to update
            setTimeout(() => {
                alert("Error!\\n" + err);
            }, 50);
            return "error!";
        }
        if (ret.done) {
            const cursorPos = CodeMirrorMain.state.selection.main.head;
            const cursorLine = CodeMirrorMain.state.doc.lineAt(cursorPos);
            CodeMirrorMain.dispatch({selection: {anchor: cursorLine.to + 1}});
            CodeMirrorMain.scrollPosIntoView(cursorLine.to + 1);
            return ret.value;
        } else {
            console.log("Executed line " + ret.value + ":");
            const line = CodeMirrorMain.state.doc.line(ret.value);
            CodeMirrorMain.dispatch({selection: {anchor: line.from}});
            CodeMirrorMain.scrollPosIntoView(line.from);
            setTimeout(runProg, timePerLoop);
        }
    }
    runProg();
    }`

    func = func.replace('__MANGLED_NAME__', mangledName);
    let paramStr = '';
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        paramStr += param;
        if (i < params.length - 1) {
            paramStr += ', ';
        }
    }
    func = func.replaceAll('__PARAMS__', paramStr);
    return func;
}

const getPosOfLine = (text, n) => {
    // returns the position in text of the first char on line n
    if (n > text.split('\n').length) {
        return -1;
    }
    if (n == 1) {
        return 0;
    }
    let startPos = 0;
    for (let i = 0; i < n - 1; i++) {
        startPos = text.indexOf('\n', startPos + 1); 
    }
    return startPos + 1;
}

const functionSteps = (funcCall) => {
    // run function generator, storing the world after each step,
    // so we can go forwards or backwards if we wish
    // we need to store the line number, bitLoc, and world,
    // which is the entire useful state
    const allBitSteps = [];

    // save bit state and don't actually draw anything
    const savedBitWorld = JSON.parse(JSON.stringify(bit.world));
    const savedBitLoc = JSON.parse(JSON.stringify(bit.bitLoc));

    bit.drawWhenChanged = false;
    let gen;
    try {
        eval('gen = __gen_' + funcCall);
    } 
    catch(err) {
        bit.drawWhenChanged = true;
        console.log("error:" + err.message);
    }

    let reps = 0;
    let lastLine = 0;
    while (true) {
        if (reps > 1000) {
            console.log("possible infinite loop.");
            alert("too many instructions -- possible infinite loop!");
            // restore bit
            bit.drawWhenChanged = true;
            bit.world = savedBitWorld;
            bit.bitLoc = savedBitLoc;
            return []; // bad execution
        }
        reps++;
        // execute it
        let ret = {value: null, done: true};
        try {
            ret = gen.next();
        }
        catch(err) {
            bit.drawWhenChanged = true;
            bit.world = savedBitWorld;
            bit.bitLoc = savedBitLoc;
            return []; // bad execution
        }
        if (ret.done) {
            // add one more
            const bitStep = { lineNum: lastLine + 1, 
                world: JSON.parse(JSON.stringify(bit.world)), 
                bitLoc: JSON.parse(JSON.stringify(bit.bitLoc)),
            };
            allBitSteps.push(bitStep);

            // return ret.value;
            bit.drawWhenChanged = true;
            bit.world = savedBitWorld;
            bit.bitLoc = savedBitLoc;
            return allBitSteps;
        } else {
            const bitStep = { lineNum: ret.value, 
                world: JSON.parse(JSON.stringify(bit.world)), 
                bitLoc: JSON.parse(JSON.stringify(bit.bitLoc)),
            };
            lastLine = ret.value;
            allBitSteps.push(bitStep);
            console.log("Executed line " + ret.value + ":");
            const line = CodeMirrorMain.state.doc.line(ret.value);
            console.log(line.text);
        }
    }
}

const playClicked = () => {
    const slider = document.getElementById('stepsRange');
    window.playNextStep = () => {
        if (!("stopPlay" in window && stopPlay) && parseInt(slider.value) < parseInt(slider.max)) {
            window.playing = true;
            document.getElementById('playButton').disabled = true;
            stepClicked();
            setTimeout(playNextStep, getTimePerLoop());
        } else {
            document.getElementById('playButton').disabled = false;
            window.stopPlay = false;
            window.playing = false;
        }
        return;
    };
    playNextStep();
}

const stepClicked = () => {
    document.getElementById('stepsRange').value++;
    showStep(); 
}

const backClicked = () => {
    document.getElementById('stepsRange').value--;
    showStep(); 
}

const stopClicked = () => {
    if ("playing" in window && playing) {
        window.stopPlay = true;
    }
}

const disablePlayButtons = (disable) => {
    const buttons = document.getElementsByClassName("animButton");
    for (const button of buttons) {
        button.disabled = disable;
    }
}

const getTimePerLoop = () => {
    const timerVal = document.getElementById("speedRange").value;
    return -1000 * Math.log10(timerVal) + 2000;
}

const toggleVisibility = (id) => {
    const idDiv = document.getElementById(id);
    if (idDiv.style.visibility == "visible") {
        idDiv.style.visibility = "hidden";
    } else {
        idDiv.style.visibility = "visible";
    }
}

const loadProgramWindow = () => {
    toggleVisibility('load');
    let programHtml = ''
    let firstBlock = true;
    programHtml += "<select size=" + bitPrograms.length + " id='progList' onchange='loadProgram()'>\n";
    for (let i = 0; i < bitPrograms.length; i++) {
        const program = bitPrograms[i];
        if (program.type == "divider") {
            if (!firstBlock) {
                programHtml += "</optgroup>\n";
            }
            else {
                firstBlock = false;
            }
            programHtml += "<optgroup label='"+program.name+"'>"; 
        } else {
             if (i == init.progIdx) {
                 programHtml += "<option value = "+i+" selected>"+program.name+"</option>";
             } else {
                 programHtml += "<option value = "+i+">"+program.name+"</option>";
             }
        }
    }
    programHtml += "</select>";
    const loadDiv = document.getElementById('programList');
    loadDiv.innerHTML = programHtml;
}

const loadProgram = () => {
    const progIdx = document.getElementById('progList').value;
    const program = bitPrograms[progIdx];
    const language = document.getElementById('langSel').value;
    const name = bitPrograms[progIdx].name;
    const worlds = bitPrograms[progIdx].worlds;
    let progText = program.program.js;
    if (language.startsWith('py')) {
        progText = program.program.python;
    }
    const savedProg = loadLocalProgram(language, name);
    if (savedProg !== undefined) {
        progText = savedProg; 
    }
    setupWorld(progIdx, name, progText, worlds, 0);
    toggleVisibility('load');
}


const setupWorldSelector = (worlds, worldIdx) => {
    const worldSel = document.getElementById("worldSel");
    removeOptions(worldSel);
    for (let i = 0; i < worlds.length; i++) {
        const world = worlds[i];
        const opt = document.createElement("option");
        opt.value = world.dim;
        opt.innerHTML = world.dim;
        worldSel.appendChild(opt);
    }
    worldSel.selectedIndex = worldIdx;
    if (init.hasListener === undefined) {
        init.hasListener = true;
        worldSel.addEventListener(
         'change',
            () => { 
                const worldSelIdx = worldSel.selectedIndex;
                const codeText = CodeMirrorMain.state.doc.toString();
                const world = bitPrograms[init.progIdx]; 
                setupWorld(init.progIdx, world.name, codeText, world.worlds, worldSelIdx);
            },
          );
    }
}

const removeOptions = (selectElement) => {
   // found here: https://stackoverflow.com/a/3364546/561677
   const L = selectElement.options.length - 1;
   for(let i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

const changeLang = () => {
    const newLang = document.getElementById('langSel').value;
    const worldSel = document.getElementById("worldSel");
    const worldSelIdx = worldSel.selectedIndex;
    const world = bitPrograms[init.progIdx]; 

    let codeText = world.program[newLang];
    const savedProg = loadLocalProgram(newLang, bitPrograms[init.progIdx].name);
    if (savedProg !== undefined) {
        // nope, not saved
        codeText = savedProg;
    }
    setupWorld(init.progIdx, world.name, codeText, world.worlds, worldSelIdx);
}

const evalPyProg = (prog) => {
    console.log("evalPyProg");
    // find first python function name
    // not particularly robust
    const defIdx = prog.indexOf('def ');
    let func1 = null;
    if (defIdx != -1) {
        const funcStart = defIdx + 4;
        const funcEnd = prog.indexOf('(', funcStart);
        if (funcEnd != -1) {
            func1 = { name: prog.substring(funcStart, funcEnd) };
            // find params
            let param = prog.substring(funcEnd + 1, prog.indexOf(')', funcEnd)).split(',');
            param = param.map(str => str.trim());
            func1.param = param;
        }
    }
    setupSteps(func1, false, 'python', prog);
}

const runPy = () => {
    window.js_input = "howdy";
    window.bitPrograms = bitPrograms;
    pyTest();
    console.log(pyOutput);
}

const pyFunctionSteps = (funcCall, prog) => {
    window.bitPrograms = bitPrograms;
    window.currentPyProg = prog;
    window.currentPyFuncCall = funcCall;
    window.currentWorld = bit.world_text;
    brythonFunctionSteps();
    // pyOutput set by python code
    return window.pyOutput; // should be set by previous function
}

const pyOneLiner = (statement) => {
    window.origWorld = bit.world_text;
    window.currentWorld = JSON.stringify(bit.world);
    window.currentBitLoc = JSON.stringify(bit.bitLoc);
    window.pythonStatement = statement;
    window.mainCode = CodeMirrorMain.state.doc.toString();
    brythonOneLiner();
    // console.log(window.pyOutput);
    return window.pyOutput
}

const saveProgram = (language, prog) => {
    // store a program as progName: {lang: prog}
    const progName = document.getElementById("progName").innerText;
    console.log("Program name: " + progName);
    const storage = window.localStorage;
    let progStorage = storage.getItem(progName);
    if (progStorage === null) {
        progStorage = {
            [language]: prog,
        }
    } else {
        progStorage = JSON.parse(progStorage);
        progStorage[language] = prog;
    }
    storage.setItem(progName, JSON.stringify(progStorage));
    console.log("Program saved");
}

const loadLocalProgram = (language, name) => {
    const storage = window.localStorage;
    let progStorage = storage.getItem(name);
    if (progStorage === null) {
        return undefined;
    }
    progStorage = JSON.parse(progStorage);
    return progStorage[language];
}

const resetCode = () => {
    if (confirm('Are you sure you want to reset your code to the original?')) {
        const lang = document.getElementById("langSel").value;
        const worldSel = document.getElementById("worldSel");
        const worldSelIdx = worldSel.selectedIndex;
        const world = bitPrograms[init.progIdx]; 
        const codeText = world.program[lang];
        setupWorld(init.progIdx, world.name, codeText, world.worlds, worldSelIdx);
    }
}

