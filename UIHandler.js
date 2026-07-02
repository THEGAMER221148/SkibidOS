import runCode from "./Interpreter.js";
// get elements
const inputLine = document.getElementById("input");
const terminal = document.getElementById("terminal");
const highlight = document.getElementById("highlight");

// highlist syntax (im not fixing that typo)
inputLine.addEventListener("input", () => {
    highlight.innerHTML = syntaxHighlight(inputLine.value);
});

function syntaxHighlight(text) {
    // get rid of those skibidi symbols
    text = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    text = text.replace(/\d+/g, "<span style='color:rgb(100, 200, 255);'>$&</span>");

    text = text.replace(/"[^"]*"/g,"<span style='color:rgb(50, 200, 60);'>$&</span>");

    text = text.replace(/\b(print|clearTerminal|stop|stopAll|def|run|if|wait)\b/g, "<span style='color:rgb(255, 255, 20);'>$&</span>");

    text = text.replace(/\b(true|false)\b/g, "<span style='color:rgb(255, 127, 20);'>$&</span>");

    return text;
}

// make sure input line stays focused
inputLine.focus();
inputLine.onblur = function() {
    if (inputLine.style.visibility = "visible") inputLine.focus();
}

// Detect enter presses
inputLine.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        runCode(inputLine.value);
        inputLine.value = "";
        highlight.innerHTML = "";
    } 
});