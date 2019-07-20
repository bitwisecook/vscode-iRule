import * as vscode from 'vscode';
import * as format from './formatProvider';
import * as complete from './completionProvider';
import * as fs from './fsProvider';
import { IcrFS } from './fsProvider';
import * as request from 'request';

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider(
        [
            { scheme: 'file', language: 'irule-lang' },
            { scheme: 'icrfs', language: 'irule-lang' },
        ], {
            provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): vscode.TextEdit[] {
                const { tc, td, ts }: { tc: string; td: number, ts: number } = format.getIndentationStyle(options);

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return []; // No open text editor
                }
                return [vscode.TextEdit.replace(format.fullDocumentRange(document), format.formatIRule(document.getText(), '', tc, td))];
            }
        });

    vscode.languages.registerDocumentRangeFormattingEditProvider(
        [
            { scheme: 'file', language: 'irule-lang' },
            { scheme: 'icrfs', language: 'irule-lang' },
        ], {
            provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions): vscode.TextEdit[] {
                const { tc, td, ts }: { tc: string; td: number, ts: number } = format.getIndentationStyle(options);

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return []; // No open text editor
                }

                let preIndent = '';
                let priorLine = format.getPreviousLineContaintingText(document, range);
                if (priorLine !== undefined) {
                    preIndent = format.guessPreIndentation(priorLine, tc, td, ts);
                }
                let selectedLines = format.getSelectedLines(document, range);
                return [vscode.TextEdit.replace(selectedLines, format.formatIRule(document.getText(selectedLines), preIndent, tc, td))];
            }
        });

    vscode.languages.registerCompletionItemProvider([
        { scheme: 'file', language: 'irule-lang' },
        { scheme: 'icrfs', language: 'irule-lang' },
    ], {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return complete.complete(document, position);
            }
        }, ' ', '.' // triggered whenever a ' ' or '.' is being typed
    );

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

        let apiUrl: string = 'https://' + vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hostname') + '/mgmt/tm';
        let apiAuth: string = 'Basic ' + Buffer.from(vscode.workspace.getConfiguration().get('conf.icrfs.bigip.username') +
            ':' + vscode.workspace.getConfiguration().get('conf.icrfs.bigip.password')).toString('base64');
        let options: request.OptionsWithUrl = {
            method: 'GET',
            url: apiUrl + '/sys/folder',
            headers:
            {
                Connection: 'keep-alive',
                Host: vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hostname'),
                'Cache-Control': 'no-cache',
                Accept: '*/*',
                Authorization: apiAuth
            },
            rejectUnauthorized: vscode.workspace.getConfiguration().get('conf.icrfs.bigip.validateCert')
        };

        console.log(options);

        let dirs: fs.Directory[] = [];

        // not sure why the compiler is whining about the type without me redefining it here
        options.url = apiUrl + '/sys/folder';
        request(options.url, options, (error, response, body) => {
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
            request(options.url, options, (error, response, body) => {
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
export function deactivate() { }
