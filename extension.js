let vscode = require('vscode');
const helpers = require('./helpers');

const pythonTerminalName = 'IPython';
let pythonTerminal = null;
let textQueue = [];
let waitsQueue = [];

function createPythonTerminal() {
    textQueue = [];
    waitsQueue = [];
    pythonTerminal = vscode.window.createTerminal(pythonTerminalName);
    sendQueuedText('ipython', 1500);
}

function removePythonTerminal() {
    pythonTerminal = null;
    textQueue = [];
    waitsQueue = [];
}

function sendQueuedText(text, waitTime=50) {
    textQueue.push(text);
    waitsQueue.push(waitTime);
}

function queueLoop() {
    if (textQueue.length > 0 && pythonTerminal !== null && pythonTerminal._queuedRequests.length === 0) {
        const text = textQueue.shift();
        const waitTime = waitsQueue.shift();
        pythonTerminal.sendText(text);
        setTimeout(queueLoop, waitTime);
    } else {
        setTimeout(queueLoop, 50);
    }
}

function activate(context) {
    vscode.window.onDidCloseTerminal(function(event) {
        if (event._name === pythonTerminalName) {
            removePythonTerminal();
        }
    });

    queueLoop();

    let sendSelectedToIPython = vscode.commands.registerCommand('ipython.sendSelectedToIPython', function () {
        if (pythonTerminal === null) {
            createPythonTerminal();
        }
        const editor = vscode.window.activeTextEditor;
        const filename = editor.document.fileName;
        
        let startLine, endLine;
        if (editor.selection.isEmpty) {
            startLine = editor.selection.active.line + 1
            endLine = startLine;
        } else {
            startLine = editor.selection.start.line + 1;
            endLine = editor.selection.end.line + 1;
        }

        sendQueuedText(`__file__ = r'${filename}'`);
        sendQueuedText('sys.path.append(os.path.dirname(__file__))')
        const command = `%load -r ${startLine}-${endLine} ${filename}`;
        sendQueuedText(command);
        sendQueuedText('\n\n');
        pythonTerminal.show();
    });

    let sendFileContentsToIPython = vscode.commands.registerCommand('ipython.sendFileContentsToIPython', function () {
        if (pythonTerminal === null) {
            createPythonTerminal();
        }

        const editor = vscode.window.activeTextEditor;
        const filename = editor.document.fileName;
        sendQueuedText(`__file__ = r'${filename}'`);
        sendQueuedText('sys.path.append(os.path.dirname(__file__))')
        sendQueuedText(`%load ${filename}`, 100);
        sendQueuedText('\n\n');
        pythonTerminal.show();
    });

    context.subscriptions.push(sendSelectedToIPython);
    context.subscriptions.push(sendFileContentsToIPython);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;