const vscode = require('vscode');
const debugTerminal = vscode.window.createTerminal('Debug Terminal');

module.exports = {
  log: (thing) => {
    try {
      debugTerminal.sendText(`jq . <<< '{"output": ${JSON.stringify(thing)}}'`);      
    } catch (e) {
      debugTerminal.sendText('echo "Circular Dependency. Attributes:"');
      for (var attr in thing) {
        if (thing.hasOwnProperty(attr)) {
          debugTerminal.sendText(`echo '${attr}'`)
        }
      }
    }
  }
}