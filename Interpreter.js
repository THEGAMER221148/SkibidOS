export default function runCode(code) {
    // Extract strings
    const strings = code.split('"').filter((_, i) => i % 2 === 1);
    for (const i in strings) {
        code = code.replace(`"${strings[i]}"`, `__STRING${i}__`);
    }

    // Extract blocks
    const blocks = {};
    while (code.includes("{") || code.includes("}")) {
        const splits = code.split("}");
        blocks[`__BLOCK${Object.keys(blocks).length}__`] = splits[0].split("{")[len(splits[0].split("{")) - 1];
        code = code.replace(`{${blocks[Object.keys(blocks).length - 1]}}`, `__BLOCK${Object.keys(blocks).length - 1}__`);
    }
}