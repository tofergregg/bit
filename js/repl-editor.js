// need to compile each time:
// rollup repl-editor.js -f iife -o repl-editor.bundle.js -p @rollup/plugin-node-resolve
//
import {keymap, EditorView} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {history, historyKeymap} from "@codemirror/history"
import {defaultKeymap} from "@codemirror/commands"
import {defaultHighlightStyle, tags, HighlightStyle} from "@codemirror/highlight"
import {javascript} from "@codemirror/lang-javascript"
import {lineNumbers} from "@codemirror/gutter"

const colors = {
    text: "#adbac7",
    bg: "#22272e",
    guttersBg: "#22272e",
    guttermarkerText: "#22272e",
    guttermarkerSubtleText: "#636e7b",
    linenumberText: "#768390",
    cursor: "#cdd9e5",
    selectionBg: "rgba(108,182,255,0.3)",
    activelineBg: "#2d333b",
    matchingbracketText: "#adbac7",
    linesBg: "#22272e",
    syntax: {
      comment: "#768390",
      constant: "#6cb6ff",
      entity: "#dcbdfb",
      keyword: "#f47067",
      storage: "#f47067",
      string: "#96d0ff",
      support: "#6cb6ff",
      variable: "#f69d50"
    }
};

const myHighlightStyle = HighlightStyle.define([
    {
      tag: [
        tags.variableName,
        tags.propertyName,
        tags.derefOperator,
        tags.separator
      ],
      color: "white"
    },

    {
      tag: [tags.comment, tags.lineComment, tags.blockComment],
      color: THEME_COLORS.scale.gray[3]
    },
    {
      tag: [
        tags.definitionKeyword,
        tags.bitwiseOperator,
        tags.logicOperator,
        tags.arithmeticOperator,
        tags.definitionOperator,
        tags.updateOperator,
        tags.compareOperator,
        tags.operatorKeyword,
        tags.punctuation,
        tags.null,
        tags.keyword
      ],
      color: colors.syntax.keyword
    },
    {
      tag: [tags.string, tags.special(tags.string)],
      color: colors.syntax.string
    },

    {
      tag: [tags.regexp],
      color: THEME_COLORS.scale.orange[2]
    },

    { tag: [tags.self], color: THEME_COLORS.scale.blue[3] },
    {
      tag: [tags.number, tags.bool, tags.modifier, tags.atom],
      color: THEME_COLORS.scale.blue[2]
    },

    {
      tag: [
        tags.function(tags.variableName),
        tags.function(tags.propertyName),

        tags.typeName,
        tags.labelName,
        tags.className
      ],
      color: colors.syntax.entity
    },

    { tag: [tags.bracket], color: THEME_COLORS.scale.yellow[1] }
  ]);

let myTheme = EditorView.theme(
    {
      "&": {
        color: colors.text,
        backgroundColor: colors.bg,
        "border-radius": ".5rem",

        colorScheme: "light",
        overflow: "hidden",

        height: "100px",
        resize: "both",

        fontSize: "14px",
        "font-variant-numeric": "tabular-nums",
        fontFamily: `Consolas, "Courier New", monospace`
      },
      ".cm-content": {
        paddingBlock: "15px",
        caretColor: colors.cursor
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: colors.cursor
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
        backgroundColor: colors.selectionBg,
        borderRadius: "5px"
      },

      ".cm-searchMatch": {
        backgroundColor: "#72a1ff59",
        border: "1px solid #457dff",
        borderRadius: "3px"
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#61ffcc2f",
        borderRadius: "3px"
      },

      ".cm-selectionMatch": {
        backgroundColor: "#1aabff36",
        borderRadius: "5px"
      },
      ".cm-activeLine": {
        backgroundColor: colors.activelineBg,
        borderRadius: "5px"
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "#E1E4E8"
      },

      ".cm-matchingBracket, .cm-nonmatchingBracket": {
        backgroundColor: "#25686C",
        borderRadius: "3px",
        color: colors.matchingbracketText
      },

      ".cm-gutters": {
        backgroundColor: colors.guttersBg,
        color: colors.guttermarkerSubtleText,
        border: "none"
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "#ddd"
      },
      ".cm-lineNumbers": {
        "min-width": "5ch"
      },
      ".cm-foldGutter .cm-gutterElement": {
        transition: "color 0.25s ease",
        fontFamily: "Material Icons",
        paddingInline: "5px",
        "&:hover": {
          color: "blue" 
        }
      },

      ".cm-tooltip": {
        border: "1px solid #181a1f",
        backgroundColor: colors.activelineBg,
        padding: "5px",
        "border-radius": "5px",
        "box-shadow": "0px 0px 15px rgb(20 20 20 / 25%)"
      },
      ".cm-tooltip.cm-tooltip-autocomplete": {
        "& > ul > li": {
          "border-radius": "3px"
        },
        "& > ul > li[aria-selected]": {
          backgroundColor: colors.bg,
          color: colors.text
        }
      }
    },
    { dark: false }
);

let updateListenerExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        if (CodeMirrorRepl.ignoreUpdate !== undefined && CodeMirrorRepl.ignoreUpdate) {
            CodeMirrorRepl.ignoreUpdate = false;
            return;
        }
        // Handle the event here
        //console.log(update);
        const prevText = update.startState.doc.toString();
        const doc = update.state.doc;
        const currText = doc.toString();
        if (prevText.length < currText.length && currText[currText.length - 1] == '\n') {
            // capture previous line
            const lastLine = doc.text[doc.text.length - 2];
            // hack...
            if (lastLine.indexOf('e.g., bit.move') == 0) {
                return;
            }
            console.log("Attempting to run: '" + lastLine + "'");

            const language = document.getElementById('langSel').value;
            if (language == 'js') {
                window.bit = init.bit;
                try {
                    const func = new Function("return " + lastLine);
                    let retVal = func();
                    if (retVal !== undefined) {
                        if (typeof(retVal) === "string") {
                            retVal = "'" + retVal + "'";
                        }
                        if (retVal === null) {
                            retVal = 'null';
                        }
                        // insert
                        CodeMirrorRepl.ignoreUpdate = true;
                        update.view.dispatch({changes: {from: update.state.doc.length, to: update.state.doc.length, insert: retVal.toString() + '\n'}});
                        CodeMirrorRepl.ignoreUpdate = true;
                        update.view.dispatch({selection: {anchor: update.state.doc.length + retVal.toString().length + 1}});
                        update.view.scrollPosIntoView(update.state.doc.length + retVal.toString().length + 2);
                    }
                }
                catch(err) {
                    console.log("error: " + err);
                    alert("Error!\n" + err);
                }
            } else {
                const result = pyOneLiner(lastLine);
                if (typeof(result) == 'object' && result.world !== undefined && result.bitLoc !== undefined) {
                    bit.world = result.world;
                    bit.bitLoc = result.bitLoc;
                } else {
                    CodeMirrorRepl.ignoreUpdate = true;
                    update.view.dispatch({changes: {from: update.state.doc.length, to: update.state.doc.length, insert: result + '\n'}});
                    CodeMirrorRepl.ignoreUpdate = true;
                    update.view.dispatch({selection: {anchor: update.state.doc.length + result.length + 1}});
                    update.view.scrollPosIntoView(update.state.doc.length + result.length + 2);
                }
            }
            bit.drawWorld();
        }   
    } else {
        // prevent user from going to the previous line
        const prevCursorPos = update.startState.selection.ranges[0].to;
        const prevLinePos = update.startState.doc.lineAt(prevCursorPos).number;
        const cursorPos = update.state.selection.ranges[0].to;
        const linePos = update.state.doc.lineAt(cursorPos).number;
        // console.log(prevLinePos + '->' + linePos);
        if (prevLinePos > linePos) {
            update.view.setState(update.startState);
        }
    }
    // console.log("selection:");
    // console.log(update.state.selection.ranges[0]);
    // updateListenerExtension.prevSelection = update.state.selection.ranges[0];
});

window.CodeMirrorRepl = new EditorView({
    state: EditorState.create({
        extensions: [
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            //javascript(),
            defaultHighlightStyle,
            lineNumbers(),
            myHighlightStyle,
            myTheme,
            updateListenerExtension,
        ]
    }),
    parent: document.querySelector('#replcontainer')
})

