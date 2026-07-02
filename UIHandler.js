import runCode from "./Interpreter.js";
// get elements
const inputLine = document.getElementById("input");
const terminal = document.getElementById("terminal");

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
    } 
});