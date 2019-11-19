"use strict";
import * as vscode from "vscode";

export function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
): void {
    if (document && document.languageId === 'irule-lang') {
        collection.clear();
        let diags : vscode.Diagnostic[] = [];
        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum).text;
            if (/^\s*#/.test(line)) {
                continue;
            }
            let match = /(^\s*(expr|eval|catch|after|proc|uplevel|if|while|for|foreach)\s+[^\{]|\[\s*(expr|eval|catch|after|proc|uplevel|if|while|for|foreach)\s+[^\{\}\];]+(\]|$))/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.doublesubst.enable') && match) {
                diags.push({
                    code: "",
                    message: `\`${match[4] || match[2]}\` permits double substitution, wrap the expression in \`{...}\``,
                    range: new vscode.Range(
                        new vscode.Position(lineNum, match.index),
                        new vscode.Position(lineNum, line.length)
                    ),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: ""
                });
            }

            match = /^\s*((switch|class\s+search|class\s+match|class\s+search|class\s+nextelement|regexp|regsub|unset)(?!.*--)|\[(class\s+search|class\s+match|class\s+search|class\s+nextelement|regexp|regsub)(?!.*--))\s*.*?/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.arginject.enable') && match) {
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[1]}\` permits argument injection, add \`--\` to terminate options`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, match.index),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }

            match = /^\s*((when)(?!.*priority\s+\d+))\s*.*?/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.whenprio.enable') && match) {
                diags.push(
                    {
                        code: "",
                        message:
                            `\`when\` missing an explicit priority, add an explicit \`priority\``,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, match.index),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }
            
        }
        collection.set(document.uri, diags);
    } else {
        collection.clear();
    }
}
