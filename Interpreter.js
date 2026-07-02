// Commands
const commands = {
    print: (args) => { // print: <message>, <stay on line?: boolean>, <color: rgb>;
        document.getElementById("terminal").innerHTML += `${args[2] === undefined? "" : `<span style="color:${args[2]};">`}${args[0]}${args[2] === undefined? "" : `</span>`}${args[1] === "true"? "" : "\n"}`;
    },
    clearTerminal: (args) => {
        document.getElementById("terminal").innerHTML = "";
    },
    stopAll: (args) => {
        window.stopSDOS = true;
        setTimeout(() => {
            window.stopSDOS = false;
        }, 20);
    }
}

export default async function runCode(code) {
    const stack = [];
    const variables = {};
    // Extract strings
    const strings = code.split('"').filter((_, i) => i % 2 === 1);
    for (const i in strings) {
        code = code.replace(`"${strings[i]}"`, `__STRING${i}__`);
    }

    // Remove whitespace
    code = code.replace(/\s+/g, "");

    // Extract blocks
    const blocks = {};
    while (code.includes("{") || code.includes("}")) {
        const splits = code.split("}");
        blocks[`__BLOCK${Object.keys(blocks).length}__`] = splits[0].split("{")[splits[0].split("{").length - 1];
        code = code.replace(`{${blocks[`__BLOCK${Object.keys(blocks).length - 1}__`]}}`, `__BLOCK${Object.keys(blocks).length - 1}__`);
    }

    // Puch code to the stack and repeat line execution while there is still code in the stack
    stack.push(...code.split(";").reverse());
    console.log(stack);

    while (stack.length > 0) {

        // Stop check
        if (window.stopSDOS) {
            document.getElementById("terminal").innerHTML += `\n<span style='color: rgb(255, 0, 0);'>Process terminated</span>\n`;
            return;
        }

        // Stack check

        if (stack.length > 16384) {
            document.getElementById("terminal").innerHTML += `\n<span style='color: rgb(255, 0, 0);'>Process terminated: Stack exceeded maximum value!</span>\n`;
            return;
        }

        let line = stack.pop(); // Get the last line in the stack and remove it
        if (line == "") continue; // Avoid blank lines
        const command = line.split(":")[0]; // Split the line into command and arguments
        let args = line.split(":")[1];

        // Replace variable references in arguments
        for (const key of Object.keys(variables)) {
            args = args.replaceAll(key, variables[key]);
        }

        // Simplify numerical expressions
        args = args.replace(/(-?\d+(?:\.\d+)?)\s*([\+\-\*\/\^\%])\s*(-?\d+(?:\.\d+)?)/g, (_, a, operator, b) => {
            a = parseFloat(a);
            b = parseFloat(b);
            switch (operator) {
                case "+":
                    return a + b;
                case "-":
                    return a - b;
                case "*":
                    return a * b;
                case "/":
                    return a / b;
                case "^":
                    return Math.pow(a, b);
                case "%":
                    return a % b;
            }
        });

        // simplify logical expressions
        args = args.replace(/(-?\d+(?:\.\d+)?)\s*([\=\~\<\>])\s*(-?\d+(?:\.\d+)?)/g, (_, a, operator, b) => {
            a = parseFloat(a);
            b = parseFloat(b);
            switch (operator) {
                case "=":
                    return a === b;
                case "~":
                    return a !== b;
                case "<":
                    return a < b;
                case ">":
                    return a > b;
            }
        });

        // simplify boolean expressions
        args = args.replace(/(true|false)\s*([\=\&\|\!\~])\s*(true|false)/g, (_, a, operator, b) => {
            a = a === "true";
            b = b === "true";
            switch (operator) {
                case "&":
                    return a && b;
                case "|":
                    return a || b;
                case "!":
                    return !a;
                case "=":
                    return a === b;
                case "~":
                    return a !== b;
            }
        });

        // Split arguments and re-add strings
        args = args.split(",");
        for (const i in args) {
            args[i] = args[i].replace(/__STRING(\d+)__/g, (m, i) => strings[i]);
        }

        // Special commands (must access objects only available within function scope)
        switch (command) {
            // Define command - Defines (or updates) variables. (def: <name>, <value;)
            case "def":
                variables[args[0]] = args[1];
                continue;
            
            // Run command - Runs a block. (run: <block reference>;)
            case "run":
                stack.push(...(blocks[args[0]].split(";").reverse()));
                continue;

            // If command - Runs a block if a condition is met (if: <condition>, <block reference>;)
            case "if":
                if (args[0] === "true") stack.push(...(blocks[args[1]].split(";").reverse()));
                continue;

            // Wait command - Pauses execution for a certain number of miliseconds (wait: <miliseconds>;)
            case "wait":
                const waitMs = parseInt(args[0]);
                const endTime = Date.now() + waitMs;
                while (Date.now() < endTime && !window.stopSDOS) {
                    await new Promise(resolve => setTimeout(resolve, Math.min(10, endTime - Date.now())));
                }
                continue;

            // Stop command - Stops execution (stop;)
            case "stop":
                return;

            default:
                break;
        }

        // Execute command
        if (Object.hasOwn(commands, command)) {
            commands[command](args);
        } else {
            document.getElementById("terminal").innerHTML += `\n<span style='color: rgb(255, 255, 0);'>Error: Command "${command}" not recognized.</span>\n`;
        }
    }
}