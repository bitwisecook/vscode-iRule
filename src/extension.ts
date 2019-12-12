"use strict";
import * as vscode from "vscode";
import * as dochelp from "./documentHelpers";
import * as format from "./formatProvider";
import * as complete from "./completionProvider";
import * as diagnostic from "./diagnosticsProvider";
import * as fs from './fsProvider';
import { IcrFS } from './fsProvider';
import * as request from 'request';
import * as Keychain from './auth/keychain';

export function activate(context: vscode.ExtensionContext) {
    console.log('init keychain');

    Keychain.init(context);

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

    context.subscriptions.push(vscode.commands.registerCommand('irule-lang.escapeToQuotedTcl', _ => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const selections: vscode.Selection[] = editor.selections;

        editor.edit(builder => {
            for (const selection of selections) {
                builder.replace(selection, format.escapeToQuotedTcl(editor.document.getText(selection)));
            }
        });
    }));

    const icrFs = new IcrFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('icrfs', icrFs, { isCaseSensitive: true }));
    let initialized = false;

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.settings', _ => {
        return vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "@ext:conf.icrfs.bigip"
        );
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.refresh', _ => {
        console.log('execute refresh');
        for (const [name] of icrFs.readDirectory(vscode.Uri.parse('icrfs:/'))) {
            icrFs.delete(vscode.Uri.parse(`icrfs:/${name}`));
        }
        initialized = false;
        vscode.commands.executeCommand('icrfs.connect');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.disconnect', _ => {
        console.log('disconnecting...');
        initialized = false;

    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.connect', async _ => {
        console.log('execute init');
        // if (initialized) {
        //     return;
        // }
        // initialized = true;

        let host = '';
        let password: string | null | undefined = '';
        const hostPick = vscode.window.createQuickPick();
        hostPick.items = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hosts', ['']).map(label => ({ label }));
        hostPick.onDidAccept(() => {
            const selection = hostPick.activeItems;
            hostPick.dispose();
            if (selection[0]) {
                host = selection[0].label;
                Keychain.getToken(host).then((result) => {
                    console.log(`found password '${result}' for ${host}`);
                    if (result && result !== null) {
                        password = result;
                        console.log('using stored password');
                    } else {
                        console.log('password was empty or null');
                        password = '';
                    }
                }).catch(() => {
                    console.log(`couldn't find password for ${host}`);
                    password = '';
                }).then(() => {
                    console.log(`step 2 '${selection[0].label}' '${password}'`);

                    if (host !== '' && password === '') {
                        const authInput = vscode.window.createInputBox();
                        authInput.title = 'Password';
                        authInput.placeholder = 'password';
                        authInput.password = true;
                        authInput.onDidHide(() => authInput.dispose());
                        authInput.onDidAccept(() => {
                            const input = authInput.value;
                            authInput.dispose();
                            if (input) {
                                console.log(input);
                                const saveAuth = vscode.window.createQuickPick();
                                saveAuth.items = ['Encrypt and Save', 'Never store, ask every time', 'Ask again next time'].map(label => ({ label }));
                                saveAuth.onDidHide(() => saveAuth.dispose());
                                saveAuth.onDidAccept(() => {
                                    console.log(saveAuth);
                                    const saveAuthSelection = saveAuth.activeItems;
                                    saveAuth.dispose();
                                    console.log(saveAuthSelection[0].label.toString());
                                    if (saveAuthSelection[0].label.toString() === 'Encrypt and Save') {
                                        console.log('saving password');
                                        Keychain.setToken(host, input);
                                    } else {
                                        console.log('storing to not ask about saving again');
                                        Keychain.setToken(host, '');
                                    }
                                });
                                saveAuth.show();
                            }
                        });
                        authInput.show();
                    }
                    if (password && password !== '') {
                        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('icrfs:/'), name: host });
                        icrFs.connect(host.split('@')[1], host.split('@')[0], password, false, true);
                        initialized = true;
                    }
                });
            }
        });
        hostPick.onDidHide(() => hostPick.dispose());
        hostPick.show();

        // let hostname: string = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hostname', '');
        // let username: string = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.username', '');
        // let password: string = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.password', '');
        // let ignoreSys: boolean = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.ignoreSys', true);
        // let validateCert: boolean = vscode.workspace.getConfiguration().get('conf.icrfs.bigip.validateCert', false);

        // if (hostname === '') {
        //     console.error('missing configuration conf.icrfs.bigip.hostname');
        //     throw EvalError;
        // }
        // if (username === '') {
        //     console.error('missing configuration conf.icrfs.bigip.username');
        //     throw EvalError;
        // }
        // if (password === '') {
        //     console.error('missing configuration conf.icrfs.bigip.password');
        //     throw EvalError;
        // }
        // vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('icrfs:/'), name: hostname });
        // icrFs.connect(hostname, username, password, validateCert);

    }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
