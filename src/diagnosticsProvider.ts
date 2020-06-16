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
            let match = /(?<=^|;|\[)\s*(expr|eval|catch)\s+[^{].*($|;|])/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.doublesubst.enable') && match) {
                console.log(match);
                const idx = line.indexOf(match[1]);
                diags.push({
                    code: "",
                    message: `\`${match[1]}\` permits double substitution or may have small performance impact, wrap the expression in \`{...}\``,
                    range: new vscode.Range(
                        new vscode.Position(lineNum, idx),
                        new vscode.Position(lineNum, line.length)
                    ),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: ""
                });
            }

            match = /(?<=^|;|\[)\s*(if|while|uplevel)\s+[^{"$\[]*(\$|\[|("[^"$\[]*[$\[][^"$\[]*"))\s*.*?({|$)/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.doublesubst.enable') && match) {
                console.log(match);
                const idx = line.indexOf(match[1]);
                diags.push({
                    code: "",
                    message: `\`${match[1]}\` permits double substitution, wrap the first argument in \`{...}\``,
                    range: new vscode.Range(
                        new vscode.Position(lineNum, idx),
                        new vscode.Position(lineNum, line.length)
                    ),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: ""
                });
            }

            match = /(?<=^|;|\[)\s*(after)\s+\d+(\s+-periodic)?\s+[^{"$\[]*(\$|\[|("[^"$\[]*[$\[][^"$\[]*"))/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.doublesubst.enable') && match) {
                console.log(match);
                const idx = line.indexOf(match[1]);
                diags.push({
                    code: "",
                    message: `\`${match[1]}\` permits double substitution, wrap the second argument in \`{...}\``,
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

            match = /^\s*when\s+(ASM_REQUEST_VIOLATION|AUTH_ERROR|AUTH_FAILURE|AUTH_SUCCESS|AUTH_WANTCREDENTIAL|HTTP_CLASS_FAILED|HTTP_CLASS_SELECTED|NAME_RESOLVED|QOE_PARSE_DONE|XML_BEGIN_DOCUMENT|XML_BEGIN_ELEMENT|XML_CDATA|XML_END_DOCUMENT|XML_END_ELEMENT|XML_EVENT)/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.deprecated_events.enable') && match) {
                const idx = line.indexOf(match[1]);
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[1]}\` event is deprecated`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }

            match = /(^\s*|[\[;\{]\s*)(accumulate|ANTIFRAUD::alert_forbidden_added_element|ANTIFRAUD::alert_device_id|ANTIFRAUD::alert_bait_signatures|ASM::violation_data|client_addr|client_port|decode_uri|findclass|http_cookie|http_header|http_host|http_method|http_uri|http_version|HTTP::class|imid|ip_protocol|ip_tos|ip_ttl|link_qos|local_addr|local_port|matchclass|NAME::lookup|NAME::response|PLUGIN::disable|PLUGIN::enable|PROFILE::httpclass|QOE::disable|QOE::enable|QOE::video|redirect|remote_addr|remote_port|ROUTE::age|server_addr|server_port|SSL::nextproto|urlcatblindquery|urlcatquery|use|vlan_id|WAM::disable|WAM::enable|XML::address|XML::collect|XML::element|XML::event|XML::eventid|XML::parse|XML::release|XML::soap|XML::subscribe)\b/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.deprecated_commands.enable') && match) {
                const idx = line.indexOf(match[2]);
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[2]}\` is deprecated`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, line.length)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }

            match = /([”“ ])/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.invalid_char_auto.enable') && match) {
                const idx = line.indexOf(match[1]);
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[1]}\` is an invalid character`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, idx + 1)
                        ),
                        severity: vscode.DiagnosticSeverity.Warning,
                        source: ""
                    }
                );
            }

            match = /([^\x20-\x7E\r\n\t”“ ])/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.invalid_char_manual.enable') && match) {
                const idx = line.indexOf(match[1]);
                diags.push(
                    {
                        code: "",
                        message:
                            `\`${match[1]}\` is an invalid character`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, idx + 1)
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
                            `\`${match[2] || match[4]}\` permits argument injection, add \`--\` to terminate options (on v12+). Before v12 ensure the first argument doesn't start with a \`-\``,
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

            match = /(^|;|\[)\s*(set\s+(\$[^\s;\]]+))/.exec(
                line
            );
            if (vscode.workspace.getConfiguration().get('conf.irule-lang.diag.set.dynamic.enable') && match) {
                const idx = line.indexOf(match[2]);
                diags.push(
                    {
                        code: "",
                        message:
                            `\`set\` targeting variable instead of name (${match[3]}), check if this is intended.`,
                        range: new vscode.Range(
                            new vscode.Position(lineNum, idx),
                            new vscode.Position(lineNum, idx+match[2].length)
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
