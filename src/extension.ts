// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDocumentFormattingEditProvider('irule-lang', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			console.log('formatting');
			let tab = 0;
			let tabdepth = 4;
			let edits: vscode.TextEdit[] = [];
			for (let line: number = 0; line < document.lineCount - 1; line++) {
				let dl: vscode.TextLine = document.lineAt(line);
				let t: string = dl.text;
				if (t.endsWith(' {')) {
					tab += tabdepth
				}
				if (t.endsWith('}')) {
					tab -= tabdepth
				}
				if (tab > 0) {
					console.log('redoing line ' + line);
					edits.push(vscode.TextEdit.delete(new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, dl.firstNonWhitespaceCharacterIndex))));
					edits.push(vscode.TextEdit.insert(dl.range.start, ' '.repeat(tab)));
				}
				console.log('line ' + line + ' "' + t + '"');
			}

			// const firstLine = document.lineAt(0);
			// if (firstLine.text !== '42') {
			// 	return [vscode.TextEdit.insert(firstLine.range.start, '42\n')];
			// }
			return edits;
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
