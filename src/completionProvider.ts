import * as vscode from 'vscode';

export function complete(document: vscode.TextDocument, position: vscode.Position) {
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
                    new vscode.CompletionItem('emerg', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('alert', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('crit', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('err', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('warning', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('notice', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('info', vscode.CompletionItemKind.EnumMember),
                    new vscode.CompletionItem('debug', vscode.CompletionItemKind.EnumMember),
                ];
            }
            break;
        }
        case "when": {
            if (words.length < 2) {
                return [
                    new vscode.CompletionItem('CLIENT_ACCEPTED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('FLOW_INIT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENT_CLOSED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENT_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVER_INIT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVER_CONNECTED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVER_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVER_CLOSED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('LB_SELECTED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('LB_FAILED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('LB_QUEUED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_REQUEST_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_REQUEST_RELEASE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_REQUEST_SEND', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_RESPONSE_CONTINUE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_RESPONSE_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_RESPONSE_RELEASE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_DISABLED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_REJECT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_PROXY_CONNECT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_PROXY_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTTP_PROXY_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_CLIENTCERT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_CLIENTHELLO', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_HANDSHAKE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_PASSTHROUGH', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLIENTSSL_SERVERHELLO_SEND', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVERSSL_CLIENTHELLO_SEND', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVERSSL_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVERSSL_HANDSHAKE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVERSSL_SERVERCERT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SERVERSSL_SERVERHELLO', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('DNS_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('DNS_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_ACL_ALLOWED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_ACL_DENIED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_PER_REQUEST_AGENT_EVENT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_POLICY_AGENT_EVENT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_POLICY_COMPLETED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SAML_ASSERTION', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SAML_AUTHN', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SAML_SLO_REQ', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SAML_SLO_RESP', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SESSION_CLOSED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ACCESS_SESSION_STARTED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ADAPT_REQUEST_HEADERS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ADAPT_REQUEST_RESULT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ADAPT_RESPONSE_HEADERS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ADAPT_RESPONSE_RESULT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ANTIFRAUD_ALERT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ANTIFRAUD_LOGIN', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ASM_REQUEST_BLOCKING', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ASM_REQUEST_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ASM_RESPONSE_VIOLATION', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('AUTH_RESULT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('BOTDEFENSE_ACTION', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('BOTDEFENSE_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CACHE_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CACHE_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CACHE_UPDATE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CATEGORY_MATCHED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('CLASSIFICATION_DETECTED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('DIAMETER_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('DIAMETER_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('DIAMETER_RETRANSMISSION', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('FIX_HEADER', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('FIX_MESSAGE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GENERICMESSAGE_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GENERICMESSAGE_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_GPDU_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_GPDU_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_PRIME_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_PRIME_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_SIGNALLING_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('GTP_SIGNALLING_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTML_COMMENT_MATCHED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('HTML_TAG_MATCHED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ICAP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('ICAP_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('IN_DOSL7_ATTACK', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('IVS_ENTRY_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('IVS_ENTRY_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('L7CHECK_CLIENT_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('L7CHECK_SERVER_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_CLIENT_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_CLIENT_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_CLIENT_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_CLIENT_SHUTDOWN', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_SERVER_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_SERVER_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MQTT_SERVER_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MR_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MR_EGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MR_FAILED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('MR_INGRESS', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PCP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PCP_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PEM_POLICY', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PEM_SUBS_SESS_CREATED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PEM_SUBS_SESS_DELETED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PEM_SUBS_SESS_UPDATED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PERSIST_DOWN', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PING_REQUEST_READY', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PING_RESPONSE_READY', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('PROTOCOL_INSPECTION_MATCH', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('QOE_PARSE_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RADIUS_AAA_ACCT_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RADIUS_AAA_ACCT_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RADIUS_AAA_AUTH_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RADIUS_AAA_AUTH_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('REWRITE_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('REWRITE_REQUEST_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('REWRITE_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('REWRITE_RESPONSE_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RTSP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RTSP_REQUEST_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RTSP_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RTSP_RESPONSE_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('RULE_INIT', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SA_PICKED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SIP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SIP_REQUEST_SEND', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SIP_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SIP_RESPONSE_SEND', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('SOCKS_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('STREAM_MATCHED', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('TAP_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('TDS_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('TDS_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('USER_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('USER_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_CLIENT_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_CLIENT_FRAME', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_CLIENT_FRAME_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_REQUEST', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_RESPONSE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_SERVER_DATA', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_SERVER_FRAME', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('WS_SERVER_FRAME_DONE', vscode.CompletionItemKind.Event),
                    new vscode.CompletionItem('XML_CONTENT_BASED_ROUTING', vscode.CompletionItemKind.Event),
                ];
            } else if (words.length === 2) {
                return [new vscode.CompletionItem('priority '),];
            }
        }
        case "class": {
            if (words.length < 2) {
                return [
                    new vscode.CompletionItem('match', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('search', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('lookup', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('element', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('type', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('exists', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('size', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('names', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('get', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('startsearch', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('nextelement', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('anymore', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('donesearch', vscode.CompletionItemKind.Method),
                ];
            } else {
                switch (words[1]) {
                    case "nextelement":
                    case "element":
                    case "search":
                    case "match": {
                        if (words.length === 2) {
                            return [
                                new vscode.CompletionItem('-value --', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-name --', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-index --', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-element --', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-all --', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('--', vscode.CompletionItemKind.Keyword),
                            ];
                        }
                    }
                    case "get":
                    case "names": {
                        if (words.length === 2) {
                            return [
                                new vscode.CompletionItem('-nocase', vscode.CompletionItemKind.Keyword),
                            ];
                        }
                    }

                }
            }
        }
        case "table": {
            if (words.length < 2) {
                return [
                    new vscode.CompletionItem('set', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('add', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('replace', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('lookup', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('incr', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('append', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('delete', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('timeout', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('lifetime', vscode.CompletionItemKind.Method),
                    new vscode.CompletionItem('keys', vscode.CompletionItemKind.Method),
                ];
            } else {
                switch (words[1]) {
                    case "set":
                    case "add":
                    case "replace":
                    case "lookup":
                    case "incr":
                    case "append": {
                        if (words.length === 2) {
                            return [
                                new vscode.CompletionItem('-notouch', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-subtable', vscode.CompletionItemKind.Keyword),
                            ];
                        } else if (words.length === 3 && words[2] === '-notouch') {
                            return [
                                new vscode.CompletionItem('-subtable', vscode.CompletionItemKind.Keyword),
                            ];
                        }
                    }
                    case "delete":
                    case "lifetime":
                    case "timeout": {
                        if (words.length === 2) {
                            return [
                                new vscode.CompletionItem('-subtable', vscode.CompletionItemKind.Keyword),
                            ];
                        } else if (words.length === 4) {
                            return [
                                new vscode.CompletionItem('-remaining', vscode.CompletionItemKind.Keyword),
                            ];
                        }
                    }
                    case "keys": {
                        if (words.length === 2) {
                            return [
                                new vscode.CompletionItem('-subtable', vscode.CompletionItemKind.Keyword),
                            ];
                        } else if (words.length === 4) {
                            return [
                                new vscode.CompletionItem('-count', vscode.CompletionItemKind.Keyword),
                                new vscode.CompletionItem('-notouch', vscode.CompletionItemKind.Keyword),
                            ];
                        }
                    }
                }
            }
        }
        default: {
            return undefined;
        }
    }
}