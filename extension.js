let vscode = require('vscode');

const pythonTerminalName = 'IPython';
let pythonTerminal = null;
let textQueue = [];
let waitsQueue = [];
let addNewlineQueue = [];
let currentFilename = null;

function createPythonTerminal() {
    textQueue = [];
    waitsQueue = [];
    addNewlineQueue = [];
    pythonTerminal = vscode.window.createTerminal(pythonTerminalName);
    sendQueuedText('ipython', 1500);
}

function removePythonTerminal() {
    pythonTerminal = null;
    currentFilename = null;
    textQueue = [];
    waitsQueue = [];
    addNewlineQueue = [];
}

function sendQueuedText(text, waitTime = 50, addNewLine = true) {
    textQueue.push(text);
    waitsQueue.push(waitTime);
    addNewlineQueue.push(addNewLine);
}

function queueLoop() {
    if (textQueue.length > 0 && pythonTerminal !== null && pythonTerminal._queuedRequests.length === 0) {
        const text = textQueue.shift();
        const waitTime = waitsQueue.shift();
        const addNewLine = addNewlineQueue.shift();
        pythonTerminal.sendText(text, addNewLine);
        setTimeout(queueLoop, waitTime);
    } else {
        setTimeout(queueLoop, 50);
    }
}

function updateFilename(filename) {
    currentFilename = filename
    sendQueuedText(`import os; os.chdir(os.path.dirname(r'${filename}'))`, 200)
}


function activate(context) {
    vscode.window.onDidCloseTerminal(function (event) {
        if (event._name === pythonTerminalName) {
            removePythonTerminal();
        }
    });

    queueLoop();

    function sendText(advance = false) {
        if (pythonTerminal === null) {
            createPythonTerminal();
        }
        const editor = vscode.window.activeTextEditor;
        const filename = editor.document.fileName;
        if (filename !== currentFilename) {
            updateFilename(filename);
        }

        if (editor.selection.isEmpty) {
            var text = editor.document.lineAt(editor.selection.active.line).text;
        } else {
            var text = editor.document.getText(editor.selection);
        }

        vscode.commands.executeCommand('workbench.action.terminal.deleteToLineStart')
        sendQueuedText(text, 5, false);
        sendQueuedText('\n', 5, false);

        pythonTerminal.show(true);

        if (advance) {
            line = editor.selection.active.line
            lineAt = (line == (editor.document.lineCount - 1) ? line : (line + 1))
            let range = editor.document.lineAt(lineAt).range;
            editor.selection = new vscode.Selection(range.start, range.start);
            editor.revealRange(range);
        }
    }

    let sendSelectedToIPython = vscode.commands.registerCommand('ipython.sendSelectedToIPython', function () {
        sendText(false)
    });

    let sendSelectedToIPythonAndAdvance = vscode.commands.registerCommand('ipython.sendSelectedToIPythonAndAdvance', function () {
        sendText(true)
    });

    let sendFileContentsToIPython = vscode.commands.registerCommand('ipython.sendFileContentsToIPython', function () {
        if (pythonTerminal === null) {
            createPythonTerminal();
        }

        const editor = vscode.window.activeTextEditor;
        const filename = editor.document.fileName;
        if (filename !== currentFilename) {
            updateFilename(filename);
        }

        sendQueuedText(`%run ${filename}`, 100, false);
        sendQueuedText('\n', 5, false);
        pythonTerminal.show(true);
    });

    context.subscriptions.push(sendSelectedToIPython);
    context.subscriptions.push(sendSelectedToIPythonAndAdvance);
    context.subscriptions.push(sendFileContentsToIPython);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;