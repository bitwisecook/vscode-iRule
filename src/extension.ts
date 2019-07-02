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
					tab += tabdepth;
				}
				if (t.endsWith('}')) {
					tab -= tabdepth;
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

	const completionProvider = vscode.languages.registerCompletionItemProvider(
		'irule-lang',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				console.log('completion');
				let linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('log ')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('local0.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local1.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local2.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local3.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local4.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local5.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local6.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('local7.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('kern.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('user.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('mail.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('daemon.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('auth.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('syslog.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('lpr.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('news.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('uucp.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('cron.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('authpriv.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('ftp.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('ntp.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('security.', vscode.CompletionItemKind.EnumMember),
					new vscode.CompletionItem('console.', vscode.CompletionItemKind.EnumMember),
				];
			}
		},
		' ' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(completionProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
