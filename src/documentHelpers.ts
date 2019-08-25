'use strict';
import * as vscode from 'vscode';

export function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

export function getIndentationStyle(options: vscode.FormattingOptions) {
    let tc: string, td: number;
    if (options.insertSpaces) {
        tc = ' ';
        td = options.tabSize;
    }
    else {
        tc = '\t';
        td = 1;
    }
    const ts: number = options.tabSize;
    return { tc, td, ts };
}

export function getSelectedLines(document: vscode.TextDocument, range: vscode.Range): vscode.Range {
    return new vscode.Range(document.lineAt(range.start.line).range.start, document.lineAt(range.end.line).range.end);
}

export function getPreviousLineContaintingText(document: vscode.TextDocument, selectedLines: vscode.Range) {
    if (selectedLines.start.line > 0) {
        let priorLineNum: number = selectedLines.start.line;
        let priorLine: vscode.TextLine = document.lineAt(--priorLineNum);
        while (priorLine.text.trim() === '' && priorLineNum > 0) {
            priorLine = document.lineAt(--priorLineNum);
        }
        return priorLine;
    }
}
