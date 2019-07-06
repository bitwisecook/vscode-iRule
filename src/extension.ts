// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

function getIndentationStyle(options: vscode.FormattingOptions) {
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

function getSelectedLines(document: vscode.TextDocument, selection: vscode.Selection): vscode.Range {
    return new vscode.Range(document.lineAt(selection.start.line).range.start, document.lineAt(selection.end.line).range.end);
}

function getPreviousLineContaintingText(document: vscode.TextDocument, selectedLines: vscode.Range) {
    if (selectedLines.start.line > 0) {
        let priorLineNum: number = selectedLines.start.line;
        let priorLine: vscode.TextLine = document.lineAt(--priorLineNum);
        while (priorLine.text.trim() === '' && priorLineNum > 0) {
            priorLine = document.lineAt(--priorLineNum);
        }
        return priorLine;
    }
}

function guessPreIndentation(priorLine: vscode.TextLine, tabChar: string, tabDepth: number, tabSize: number) {
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

function formatRule(inputCode: string, preIndent: string = '', tabChar: string = ' ', tabDepth: number = 4): string {
    let tabLevel = 0;
    let out: string[] = [];
    inputCode.split('\n').forEach(element => {
        let line = element.trim();
        if (line === '') {
            out.push('');
        } else if (/^#/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (/\b([^\\]+(\\\\)+|[^\\])\{\s*\}$/.test(line)) {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else if (/([^\\]+(\\\\)+|[^\\]){$/.test(line) || /^\{$/.test(line)) {
            if (/^\}/.test(line)) {
                tabLevel = tabLevel - tabDepth;
                if (tabLevel < 0) {
                    tabLevel = 0;
                    preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
                }
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
            tabLevel += tabDepth;
        } else if (/^\}$/.test(line)) {
            tabLevel = tabLevel - tabDepth;
            if (tabLevel < 0) {
                tabLevel = 0;
                preIndent = preIndent.substr(tabDepth, preIndent.length - tabDepth);
            }
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        } else {
            out.push(preIndent + tabChar.repeat(tabLevel) + line);
        }
    });
    return out.join('\n');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider('irule-lang', {
        provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): vscode.TextEdit[] {
            const { tc, td, ts }: { tc: string; td: number, ts: number } = getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }

            const selection = editor.selection;
            if (selection.isEmpty) {
                return [vscode.TextEdit.replace(fullDocumentRange(document), formatRule(document.getText(), '', tc, td))];
            }

            let preIndent = '';
            let priorLine = getPreviousLineContaintingText(document, selection);
            if (priorLine !== undefined) {
                preIndent = guessPreIndentation(priorLine, tc, td, ts);
            }
            let selectedLines = getSelectedLines(document, selection);
            return [vscode.TextEdit.replace(selectedLines, formatRule(document.getText(selectedLines), preIndent, tc, td))];
        }
    });

    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'irule-lang',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                let words = document.lineAt(position).text.substr(0, position.character).trim().split(' ');
                switch (words[0]) {
                    case "log": {
                        if (words.length === 1 || (words.length === 2 && !(words[1].includes('.')))) {
                            return [
                                new vscode.CompletionItem('local0.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local1.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local2.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local3.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local4.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local5.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local6.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('local7.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('kern.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('user.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('mail.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('daemon.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('auth.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('syslog.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('lpr.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('news.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('uucp.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('cron.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('authpriv.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ftp.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ntp.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('security.', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('console.', vscode.CompletionItemKind.EnumMember),
                            ];
                        } else if (words.length === 2 && words[1].includes('.')) {
                            return [
                                new vscode.CompletionItem('emerg ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('alert ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('crit ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('err ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('warning ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('notice ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('info ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('debug ', vscode.CompletionItemKind.EnumMember),
                            ];
                        }
                        break;
                    }
                    case "when": {
                        if (words.length < 2) {
                            return [
                                new vscode.CompletionItem('CLIENT_ACCEPTED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('FLOW_INIT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENT_CLOSED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENT_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVER_INIT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVER_CONNECTED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVER_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVER_CLOSED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('LB_SELECTED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('LB_FAILED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('LB_QUEUED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_REQUEST_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_REQUEST_RELEASE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_REQUEST_SEND', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_RESPONSE_CONTINUE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_RESPONSE_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_RESPONSE_RELEASE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_DISABLED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_REJECT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_PROXY_CONNECT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_PROXY_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTTP_PROXY_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_CLIENTCERT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_CLIENTHELLO', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_HANDSHAKE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_PASSTHROUGH', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLIENTSSL_SERVERHELLO_SEND', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVERSSL_CLIENTHELLO_SEND', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVERSSL_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVERSSL_HANDSHAKE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVERSSL_SERVERCERT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SERVERSSL_SERVERHELLO', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('DNS_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('DNS_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_ACL_ALLOWED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_ACL_DENIED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_PER_REQUEST_AGENT_EVENT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_POLICY_AGENT_EVENT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_POLICY_COMPLETED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SAML_ASSERTION', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SAML_AUTHN', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SAML_SLO_REQ', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SAML_SLO_RESP', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SESSION_CLOSED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ACCESS_SESSION_STARTED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ADAPT_REQUEST_HEADERS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ADAPT_REQUEST_RESULT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ADAPT_RESPONSE_HEADERS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ADAPT_RESPONSE_RESULT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ANTIFRAUD_ALERT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ANTIFRAUD_LOGIN', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ASM_REQUEST_BLOCKING', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ASM_REQUEST_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ASM_RESPONSE_VIOLATION', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('AUTH_RESULT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('BOTDEFENSE_ACTION', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('BOTDEFENSE_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CACHE_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CACHE_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CACHE_UPDATE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CATEGORY_MATCHED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('CLASSIFICATION_DETECTED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('DIAMETER_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('DIAMETER_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('DIAMETER_RETRANSMISSION', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('FIX_HEADER', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('FIX_MESSAGE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GENERICMESSAGE_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GENERICMESSAGE_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_GPDU_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_GPDU_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_PRIME_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_PRIME_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_SIGNALLING_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('GTP_SIGNALLING_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTML_COMMENT_MATCHED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('HTML_TAG_MATCHED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ICAP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ICAP_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('IN_DOSL7_ATTACK', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('IVS_ENTRY_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('IVS_ENTRY_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('L7CHECK_CLIENT_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('L7CHECK_SERVER_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_CLIENT_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_CLIENT_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_CLIENT_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_CLIENT_SHUTDOWN', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_SERVER_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_SERVER_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MQTT_SERVER_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MR_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MR_EGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MR_FAILED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('MR_INGRESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('NAME_RESOLVED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PCP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PCP_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PEM_POLICY', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PEM_SUBS_SESS_CREATED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PEM_SUBS_SESS_DELETED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PEM_SUBS_SESS_UPDATED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PERSIST_DOWN', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PING_REQUEST_READY', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PING_RESPONSE_READY', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('PROTOCOL_INSPECTION_MATCH', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('QOE_PARSE_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RADIUS_AAA_ACCT_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RADIUS_AAA_ACCT_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RADIUS_AAA_AUTH_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RADIUS_AAA_AUTH_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('REWRITE_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('REWRITE_REQUEST_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('REWRITE_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('REWRITE_RESPONSE_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RTSP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RTSP_REQUEST_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RTSP_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RTSP_RESPONSE_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('RULE_INIT', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SA_PICKED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SIP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SIP_REQUEST_SEND', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SIP_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SIP_RESPONSE_SEND', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('SOCKS_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('STREAM_MATCHED', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('TAP_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('TDS_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('TDS_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('USER_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('USER_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_CLIENT_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_CLIENT_FRAME', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_CLIENT_FRAME_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_REQUEST', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_RESPONSE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_SERVER_DATA', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_SERVER_FRAME', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('WS_SERVER_FRAME_DONE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('AUTH_ERROR', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('AUTH_FAILURE', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('AUTH_SUCCESS', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('AUTH_WANTCREDENTIAL', vscode.CompletionItemKind.EnumMember),
                                new vscode.CompletionItem('ASM_REQUEST_VIOLATION', vscode.CompletionItemKind.EnumMember),
                            ];
                        } else if (words.length === 2) {
                            return [new vscode.CompletionItem('priority '),];
                        }
                    }
                    default: {
                        return undefined;
                    }
                }
            }
        },
        ' ' // triggered whenever a '.' is being typed
    );

    context.subscriptions.push(completionProvider);
}


// this method is called when your extension is deactivated
export function deactivate() { }
