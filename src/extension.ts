"use strict";
import * as vscode from "vscode";
import * as dochelp from "./documentHelpers";
import * as format from "./formatProvider";
import * as complete from "./completionProvider";
import * as diagnostic from "./diagnosticsProvider";
import * as fs from './fsProvider';
import { IcrFS } from './fsProvider';
import * as request from 'request';
import * as fetch from 'fetch';

export function activate(context: vscode.ExtensionContext) {
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


    console.log('IcrFS says "Hello"');

    const icrFs = new IcrFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('icrfs', icrFs, { isCaseSensitive: true }));
    let initialized = false;

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.reset', _ => {
        console.log('execute reset');
        for (const [name] of icrFs.readDirectory(vscode.Uri.parse('icrfs:/'))) {
            icrFs.delete(vscode.Uri.parse(`icrfs:/${name}`));
        }
        initialized = false;
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.addFile', _ => {
        console.log('execute addFile');
        if (initialized) {
            icrFs.writeFile(vscode.Uri.parse(`icrfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.deleteFile', _ => {
        console.log('execute deleteFile');
        if (initialized) {
            icrFs.delete(vscode.Uri.parse('icrfs:/file.txt'));
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.init', _ => {
        console.log('execute init');
        if (initialized) {
            return;
        }
        initialized = true;

        let apiUrl: string = 'https://' + vscode.workspace.getConfiguration().get('conf.resource.bigip.hostname') + '/mgmt/tm';
        let apiAuth: string = 'Basic ' + Buffer.from(vscode.workspace.getConfiguration().get('conf.resource.bigip.username') +
            ':' + vscode.workspace.getConfiguration().get('conf.resource.bigip.password')).toString('base64');
        let options: request.OptionsWithUrl = {
            method: 'GET',
            url: apiUrl + '/sys/folder',
            headers:
            {
                Connection: 'keep-alive',
                Host: vscode.workspace.getConfiguration().get('conf.resource.bigip.hostname'),
                'Cache-Control': 'no-cache',
                Accept: '*/*',
                Authorization: apiAuth
            },
            rejectUnauthorized: vscode.workspace.getConfiguration().get('conf.resource.bigip.validateCert')
        };

        console.log(options);

        let dirs: fs.Directory[] = [];

        request(options.url, options, function (error, response, body) {
            console.log('loading...');
            if (error) {
                throw new Error(error);
            }
            let json = JSON.parse(body);
            let items = json['items'];
            items.forEach((item: { [x: string]: string; }) => {
                if (item.fullPath === '/') {
                    return;
                }
                try {
                    icrFs.createDirectory(vscode.Uri.parse('icrfs://' + item.fullPath + '/'));
                } catch (error) {
                    console.log(error);
                }
            });
            options.url = apiUrl + '/ltm/rule';
            request(options.url, options, function (error, response, body) {
                if (error) {
                    throw new Error(error);
                }
                let json = JSON.parse(body);
                let items = json['items'];
                items.forEach((item: { [x: string]: string; }) => {
                    if (item.fullPath === '/') {
                        return;
                    }
                    try {
                        icrFs.writeFile(vscode.Uri.parse('icrfs://' + item.fullPath + '.irul'), Buffer.from(item.apiAnonymous), { create: true, overwrite: true });
                    } catch (error) {
                        console.log(error);
                    }
                });
                console.log('fetched ' + dirs.length + ' dirs');
            });
        });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.workspaceInit', _ => {
        console.log('execute workspaceInit');
        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('icrfs:/'), name: "IcrFS - Sample" });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {}
