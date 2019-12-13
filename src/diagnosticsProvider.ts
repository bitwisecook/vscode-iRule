"use strict";
import * as vscode from "vscode";

export function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
): void {
    if (document && document.languageId === 'irule-lang') {
        collection.clear();
        let diags: vscode.Diagnostic[] = [];
        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum).text;
            if (/^\s*#/.test(line)) {
                continue;
            }
            let match = /(^\s*((expr|eval|catch|after|if|for|while|foreach)\s+[^\{]+)|\[\s*((expr|eval|catch|after|uplevel)\s+[^\{\}\];]+)(;|]|$))/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.doublesubst.enable') && match) {
                const idx = line.indexOf((match[4] ? match[4] : match[2]));
                console.log(match);
                diags.push({
                    code: "",
                    message: `\`${match[5] || match[3]}\` permits double substitution, wrap the expression in \`{...}\``,
                    range: new vscode.Range(
                        new vscode.Position(lineNum, idx),
                        new vscode.Position(lineNum, line.length)
                    ),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: ""
                });
            }

            match = /(^\s*(switch|class\s+search|class\s+match|class\s+nextelement|regexp|regsub|unset)(?!.*\s+--)|\[(class\s+search|class\s+match|class\s+search|class\s+nextelement|regexp|regsub)(?!.*\s+--))\s*.*?/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.arginject.enable') && match) {
                const idx = line.indexOf((match[2] ? match[2] : match[4]));
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[2] || match[4]}\` permits argument injection, add \`--\` to terminate options`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }

            match = /(^\s*(table\s+(set|add|replace|lookup|incr|append|delete|timeout|lifetime|keys))(?!.*\s+--)|\[(table\s+(set|add|replace|lookup|incr|append|delete|timeout|lifetime|keys))\b(?!.*\s+--))\s*.*?/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.arginject.enable') && match) {
                const idx = line.indexOf((match[2] ? match[2] : match[4]));
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[2] || match [4]}\` permits argument injection, add \`--\` to terminate options (on v12+). Before v12 ensure the first argument doesn't start with a \`-\``,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
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
