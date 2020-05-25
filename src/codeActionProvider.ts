import * as vscode from 'vscode';

export class InvalidCharFix implements vscode.CodeActionProvider {
    private badChars = {
        ' ': {
            from_name: 'non-breaking space',
            to_name: 'space',
            char: ' ',
        },
        '”': {
            from_name: 'open smart-quote',
            to_name: 'quote',
            char: '"',
        },
        '“': {
            from_name: 'close smart-quote',
            to_name: 'quote',
            char: '"',
        },
    };

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        console.log(`checking char '${document.lineAt(range.start.line).text[range.start.character]}'`);
        const replace = this.isAtInvalidCharAuto(document, range);
        console.log(`got '${replace}'`);
        if (!replace) {
            return;
        }
        console.log('at invalid char');

        const replaceChar = this.createFix(document, range, replace.from_name, replace.to_name, replace.char);

        return [
            replaceChar
        ];
    }

    private isAtInvalidCharAuto(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return this.badChars[line.text[start.character]];
    }

    private createFix(document: vscode.TextDocument, range: vscode.Range, from_name: string, to_name: string, char: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(`Convert ${from_name} to ${to_name}`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 1)), char);
        return fix;
    }
}
