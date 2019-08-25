"use strict";
import * as vscode from "vscode";

export function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection
): void {
    if (document) {
        collection.clear();
        let diags : vscode.Diagnostic[] = [];
        // The following statements also allow some form of substitution, which may lead to unexpected behavior, but typically cannot be directly used to execute TCL commands:
        // regexp
        // regsub
        // list
        // set
        // string match
        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum).text;
            if (/^\s*#/.test(line)) {
                continue;
            }
            let matchDS = /(^\s*(expr|eval|catch|after|proc|uplevel|if|while|for|foreach)\s+[^\{;]+(;|$)|\[\s*(expr|eval|catch|after|proc|uplevel|if|while|for|foreach)\s+[^\{\}\];]+(\]|$))/.exec(
                line
            );
            if (matchDS) {
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${matchDS[4]}\` with possible double substitution issue, wrap the expression in \`{...}\``,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, matchDS.index),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: ""
                    }
                );
            }
            let matchDD = /(^\s*(switch|class\s+search|class\s+match|class\s+search|class\s+nextelement|regexp|regsub|unset)(?!.*--)\s+|\[(regexp|regsub)(?!.*--)\s+).*?/.exec(
                line
            );
            if (matchDD) {
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${matchDD[1]}\` missing \`--\` to terminate options`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, matchDD.index),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Error,
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
