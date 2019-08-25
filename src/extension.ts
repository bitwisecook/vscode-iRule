"use strict";
import * as vscode from "vscode";
import * as dochelp from "./documentHelpers";
import * as format from "./formatProvider";
import * as complete from "./completionProvider";
import * as diagnostic from "./diagnosticsProvider";

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider("irule-lang", {
        provideDocumentFormattingEdits(
            document: vscode.TextDocument,
            options: vscode.FormattingOptions
        ): vscode.TextEdit[] {
            const {
                tc,
                td,
                ts
            }: {
                tc: string;
                td: number;
                ts: number;
            } = dochelp.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }
            return [
                vscode.TextEdit.replace(
                    dochelp.fullDocumentRange(document),
                    format.formatIRule(document.getText(), "", tc, td)
                )
            ];
        }
    });

    vscode.languages.registerDocumentRangeFormattingEditProvider("irule-lang", {
        provideDocumentRangeFormattingEdits(
            document: vscode.TextDocument,
            range: vscode.Range,
            options: vscode.FormattingOptions
        ): vscode.TextEdit[] {
            const {
                tc,
                td,
                ts
            }: {
                tc: string;
                td: number;
                ts: number;
            } = dochelp.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }

            let preIndent = "";
            let priorLine = dochelp.getPreviousLineContaintingText(
                document,
                range
            );
            if (priorLine !== undefined) {
                preIndent = format.guessPreIndentation(priorLine, tc, td, ts);
            }
            let selectedLines = dochelp.getSelectedLines(document, range);
            return [
                vscode.TextEdit.replace(
                    selectedLines,
                    format.formatIRule(
                        document.getText(selectedLines),
                        preIndent,
                        tc,
                        td
                    )
                )
            ];
        }
    });

    vscode.languages.registerCompletionItemProvider(
        "irule-lang",
        {
            provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position
            ) {
                return complete.complete(document, position);
            }
        },
        " ",
        "." // triggered whenever a ' ' or '.' is being typed
    );

    const collection = vscode.languages.createDiagnosticCollection(
        "irule-lang"
    );
    if (vscode.window.activeTextEditor) {
        diagnostic.updateDiagnostics(
            vscode.window.activeTextEditor.document,
            collection
        );
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                diagnostic.updateDiagnostics(editor.document, collection);
            }
        })
    );
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document =>
            diagnostic.updateDiagnostics(document, collection)
        )
    );
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(changeEvent =>
            diagnostic.updateDiagnostics(changeEvent.document, collection)
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
