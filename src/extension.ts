import * as vscode from 'vscode';
import * as format from './formatProvider';
import * as complete from './completionProvider';

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider('irule-lang', {
        provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): vscode.TextEdit[] {
            const { tc, td, ts }: { tc: string; td: number, ts: number } = format.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }
            return [vscode.TextEdit.replace(format.fullDocumentRange(document), format.formatIRule(document.getText(), '', tc, td))];
        }
    });

    vscode.languages.registerDocumentRangeFormattingEditProvider('irule-lang', {
        provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions): vscode.TextEdit[] {
            const { tc, td, ts }: { tc: string; td: number, ts: number } = format.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }

            let preIndent = '';
            let priorLine = format.getPreviousLineContaintingText(document, range);
            if (priorLine !== undefined) {
                preIndent = format.guessPreIndentation(priorLine, tc, td, ts);
            }
            let selectedLines = format.getSelectedLines(document, range);
            return [vscode.TextEdit.replace(selectedLines, format.formatIRule(document.getText(selectedLines), preIndent, tc, td))];
        }
    });

    vscode.languages.registerCompletionItemProvider('irule-lang', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            return complete.complete(document, position);
        }
    }, ' ', '.' // triggered whenever a ' ' or '.' is being typed
    );
}

// this method is called when your extension is deactivated
export function deactivate() { }
