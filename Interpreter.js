// Declare stack variable
const stack = [];

// Commands
const commands = {
    print: (args) => { // print: <message>, <make newline: boolean>, <color: rgb>;
        document.getElementById("terminal").innerHTML += `${args[2] === undefined? "" : `<span style="color:${args[2]};">`}${args[0]}${args[2] === undefined? "" : `</span>`}${args[1] === "true"? "\n" : ""}`;
    }
}

export default function runCode(code) {
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
        const line = stack.pop(); // Get the last line in the stack and remove it
        if (line == "") continue; // Avoid blank lines
        const command = line.split(":"); // Split the line into command and arguments
        let args = command.pop();

        // Replace variable references in arguments
        for (const key of Object.keys(variables)) {
            args = args.replaceAll(key, variables[key]);
        }

        // Execute command
        if (Object.hasOwn(commands, command)) {
            commands[command](args.split(","));
        } else {
            document.getElementById("terminal").innerHTML += `\n<span style='color: rgb(255, 255, 0);'>Error: Command "${command}" not recognized.</span>`;
        }
    }
}