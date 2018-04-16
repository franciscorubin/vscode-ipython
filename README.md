This is an extension for VSCode that adds IPython commands and helpers, made to address many issues from the python development community:
Download it here: https://marketplace.visualstudio.com/items?itemName=pancho111203.vscode-ipython


https://github.com/DonJayamanne/vscodeJupyter/issues/19
https://github.com/DonJayamanne/pythonVSCode/issues/480
https://github.com/DonJayamanne/pythonVSCode/issues/303
https://github.com/Microsoft/vscode-python/issues/727

## Usage

Currently it includes two commands:
- ipython.sendFileContentsToIPython
  Will send the complete file contents into the open ipython instance (or a new one if none is open)
- ipython.sendSelectedToIPython
  Will send the selected lines, or the one where the cursor is, to the open ipython instance (or a new one if none is open)


## Limitations

Only one ipython instance will work, can't have multiple at the same time.