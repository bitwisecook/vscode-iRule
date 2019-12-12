'use strict';
import * as vscode from 'vscode';

export function escapeToQuotedTcl(input: string): string {
    return input
        .replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/"/g, '\\"')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\x0b/g, '\\v')
        .replace(/\x07/g, '\\a')
        .replace(/\x08/g, '\\b')
        .replace(/\x0c/g, '\\f')
        ;
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
    let uglyif2 = false;

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
            // second part of fixing UglyIf2
            if (!uglyif2) {
                tabLevel += tabDepth;
            } else {
                uglyif2 = false;
            }
        } else if (/^\}$/.test(line)) {
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (!continuation && /^\}[^\{]+\{[^\}]+\}\s*\{[^\}]+\}$/.test(line)) {
            // this is a specific patch for UglyIf
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (!continuation && /^\}[^\]]+\]$/.test(line)) {
            // this is a specific patch for UglyStringMap
            tabLevel -= tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (!continuation && /\w+\s+\{[^\{\}]+$/.test(line)) {
            // this is a specific patch for UglyIf2
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
            uglyif2 = true;
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