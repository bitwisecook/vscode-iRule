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

export function guessPreIndentation(priorLine: vscode.TextLine, tabChar: string, tabDepth: number, tabSize: number) {
    let whiteSpace: string = priorLine.text.substr(0, priorLine.firstNonWhitespaceCharacterIndex);
    let preIndent = 0;
    let preIndentRemainder = 0;
    if (tabChar === ' ') {
        preIndent = Math.floor(whiteSpace.replace(/\t/g, ' '.repeat(tabSize)).length / tabSize) * tabDepth;
        preIndentRemainder = whiteSpace.replace(/\t/g, ' '.repeat(tabSize)).length % tabSize;
    } else {
        preIndent = whiteSpace.replace(new RegExp(' '.repeat(tabSize), 'g'), '\t').length;
    }
    if (/^#/.test(priorLine.text.trim())) {
        // do nothing
    } else if (/\{$/.test(priorLine.text.trim())) {
        preIndent += tabDepth;
    } else if (/\{\s*\}$/.test(priorLine.text.trim())) {
        // do nothing
    } else if (/\}$/.test(priorLine.text.trim()) && preIndent > 0) {
        preIndent -= tabDepth;
    }
    return tabChar.repeat(preIndent) + ' '.repeat(preIndentRemainder);
}

export function formatIRule(inputCode: string, preIndent: string = '', tabChar: string = ' ', tabDepth: number = 4): string {
    let tabLevel = 0;
    let out: string[] = [];
    let continuation = false;

    inputCode.split('\n').forEach(element => {
        let line = element.trim();
        if (line === '') {
            out.push('');
        } else if (/^#/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (/\b\{\s*\}$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (/\{$/.test(line) || /^\{$/.test(line)) {
            if (/^\}/.test(line)) {
                tabLevel -= tabDepth;
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
        } else if (/^\}$/.test(line)) {
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (!continuation && /\\$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
            continuation = true;
        } else if (continuation && /\{\s+\\$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
        } else if (continuation && /\[[^\t {\[["()\]}]+\s+\\$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
        } else if (continuation && /^\\?[\]})]\s*\\$/.test(line)) {
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (continuation && (/^\\?[\]})"]$/.test(line))) {
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel -= tabDepth;
            continuation = false;
        } else if (continuation && (/\\?[\]})"]$/.test(line))) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel -= tabDepth;
            continuation = false;
        } else if (continuation && /\\$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (continuation && !(/\\$/.test(line))) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel -= tabDepth;
            continuation = false;
        } else {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        }
        if (tabLevel < 0) {
            tabLevel = 0;
            preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
        }
    });
    return out.join('\n');
}