"use strict";
import * as vscode from "vscode";
import * as dochelp from "./documentHelpers";
import * as format from "./formatProvider";
import * as complete from "./completionProvider";
import * as diagnostic from "./diagnosticsProvider";
import * as codeAction from "./codeActionProvider";
import * as hover from "./hoverProvider";
import { IcrFS } from './fsProvider';
import * as Keychain from './auth/keychain';


import { ext } from './extensionVariables';
import { setHostStatusBar, getPassword } from './utils';

export function activate(context: vscode.ExtensionContext) {

    // https://github.com/Microsoft/vscode/issues/42649
    // settig the wordpattern in language-configuration isn't sufficent
    const lang = vscode.languages.setLanguageConfiguration('irule-lang', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\\"\,\.\<\>\/\?\s]+)/
    });
    console.log('loading schema');


    // assign context to global
    ext.context = context;
    
    // Create a status bar item
	ext.hostStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 20);
	context.subscriptions.push(ext.hostStatusBar);

    /**
     * Command to find schema: find / -name "*irule-schema*" -print
     *      /usr/local/www/docs/irule/irule-schema.json
     * 
     * schemas should probably be included in vsix since using the editor doesn't alwasy mean they will be connecting to an F5
     */
    // const schema = require("../data/irule-schema-15.1.0.json");
    // const ben1 = context.extensionPath
    // const schema = require(`${context.extensionPath}/src/irule-schema-14.1.2.3.json`);
    // const schemaLookup = new Map();

    // for (const el of schema) {
    //     if (el.eventName) {
    //         schemaLookup.set(el.eventName, el);
    //     } else {
    //         schemaLookup.set(el.commandName, el);
    //     }
    // }

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

    // vscode.languages.registerHoverProvider('irule-lang', {
    //     provideHover(document, position, token) {
    //         if (!vscode.window.activeTextEditor) {
    //             return;
    //         }
    //         const range = document.getWordRangeAtPosition(position);
    //         const word = document.getText(range);
    //         const data = schemaLookup.get(word);
    //         if (data) {
    //             return new vscode.Hover({ language: 'markdown', value: data.description }, range);
    //         } else {
    //             return null;
    //         }
    //     }
    // });

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('irule-lang', new codeAction.InvalidCharFix(), {
            providedCodeActionKinds: codeAction.InvalidCharFix.providedCodeActionKinds
        })
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

    /**
     * 
     * icrfs/fsProvider/treeView
     * another idea/plan is to iniate and fill the fs(fileSystem) provider like normal
     *      but instead of registering the FS as a "workspace", we're gonna read it into a custome view
     * bascially, implement this:  https://github.com/microsoft/vscode-extension-samples/blob/master/tree-view-sample/src/fileExplorer.ts
     * moving the irules tree/fs to it's own view, should keep the window from needing to refresh the workspace to load the fs as a workspace
     * then we can just update/refresh the view data when connected instead of the entire workspace
     * 
     * Or we just need to find out why the workspace refreshes after the initial connect...
     */


    const icrFs = new IcrFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('icrfs', icrFs, { isCaseSensitive: true }));
    // let initialized = false;
    // let initialized = true;

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.settings', _ => {
        return vscode.commands.executeCommand("workbench.action.openSettings", "bigip");
        // return vscode.commands.executeCommand(
        //     "workbench.action.openSettings",
        //     "@ext:conf.icrfs.bigip"
        // );
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.refresh', _ => {
        console.log('execute refresh');

        // not sure this is needed since the fs provider has a refresh function

        // for (const [name] of icrFs.readDirectory(vscode.Uri.parse('icrfs:/'))) {
        //     icrFs.delete(vscode.Uri.parse(`icrfs:/${name}`));
        // }
        // initialized = false;

        // const device = ext.hostStatusBar.text
        // vscode.commands.executeCommand('icrfs.connect', device);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.disconnect', async () => {
        console.log('disconnecting...');
        await vscode.workspace.updateWorkspaceFolders(0, 1);
        //clearing connected device in memento
        ext.context.workspaceState.update('connectedF5', '')
        // await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
        // initialized = false;

    }));

    context.subscriptions.push(vscode.commands.registerCommand('icrfs.clearAllPasswords', async () => {
        console.log('CLEARING ALL KEYTAR PASSWORD CACHE');
        const hosts = await Keychain.listHosts().then( list => {
            list.map(item => Keychain.deleteToken(item));
        })

        // if (!hosts) {
        //     console.log(`keychainHosts: ${hosts}`);
        // }
    }));


    // testing command for reading the directories of icrfs - was starting to implement new irule 'view'
    context.subscriptions.push(vscode.commands.registerCommand('icrfs.readDirectory', async () => {
        console.log('disconnecting...');
        const directories = await icrFs.readDirectory(vscode.Uri.parse('icrfs:/'));
        console.log(`FS DIRECTORIES:  ${directories}`);
    }));


    // mock of refresh view command - didn't finish
    // was gonna refresh the new f5 irule view
    context.subscriptions.push(vscode.commands.registerCommand('icrfs.refreshView', async () => {
        console.log('disconnecting...');
        const directories = await icrFs.readDirectory(vscode.Uri.parse('icrfs:/'));
        console.log(`FS DIRECTORIES:  ${directories}`);
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('icrfs.connect', async (device) => {
        console.log('execute init');
        // if (initialized) {
        //     return;
        // }
        // initialized = true;


        /**
         * ######################################################################
         * new stuff
         */

        const connectedDevice = ext.context.workspaceState.get('connectedF5')

        if(connectedDevice) {
            device = connectedDevice
        }

        // get list of bigips from config
        const bigipHosts: vscode.QuickPickItem[] | undefined = await vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hosts');

        // if config empty...
        if (bigipHosts === undefined) {
			throw new Error('no hosts in configuration');
		}

        // no device passed in to main extension command call - used for tree view  select and connect
        //  prompt to select device
        if (!device) {
			device = await vscode.window.showQuickPick(bigipHosts, {placeHolder: 'Select Device'});
			if (!device) {
				throw new Error('user exited device input');
			}
			// console.log(`connectDevice, device quick pick answer: ${device}`);
		}
        // console.log(`connectDevice, pre-password device: ${device}`);

        // get password for device - reused current keytar implementation
        const newPassword: string = await getPassword(device);
        // const newPassword = await Keychain.getToken(device);



        if (device && newPassword){
            const workLoad = await icrFs.connect(device.split('@')[1], device.split('@')[0], newPassword, false, true);

            // add the connnected device to a memento to survice the workspace refresh
            ext.context.workspaceState.update('connectedF5', device)
            //when everything refreshed and we connect, enable a status bar at bottom - just for looks right now
            setHostStatusBar(device);

            // debugger;
            await vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('icrfs:/'), name: device });
            // initialized = true;
        }

        // ############################################################################################################


        // let host = '';
        // let password: string | null | undefined = '';
        // const hostPick = vscode.window.createQuickPick();
        // hostPick.items = await vscode.workspace.getConfiguration().get('conf.icrfs.bigip.hosts', ['']).map(label => ({ label }));

        // hostPick.onDidAccept(() => {
        //     const selection = hostPick.activeItems;
        //     hostPick.dispose();
        //     if (selection[0]) {
        //         host = selection[0].label;
        //         Keychain.getToken(host).then((result) => {
        //             console.log(`found password '${result}' for ${host}`);
        //             if (result && result !== null) {
        //                 password = result;
        //                 console.log('using stored password');
        //             } else {
        //                 console.log('password was empty or null');
        //                 password = '';
        //             }
        //         }).catch(() => {
        //             console.log(`couldn't find password for ${host}`);
        //             password = '';
        //         }).then(() => {
        //             console.log(`step 2 '${selection[0].label}' '${password}'`);

        //             if (host !== '' && password === '') {
        //                 const authInput = vscode.window.createInputBox();
        //                 authInput.title = 'Password';
        //                 authInput.placeholder = 'password';
        //                 authInput.password = true;
        //                 authInput.onDidHide(() => authInput.dispose());
        //                 authInput.onDidAccept(() => {
        //                     const input = authInput.value;
        //                     authInput.dispose();
        //                     if (input) {
        //                         console.log(input);
        //                         const saveAuth = vscode.window.createQuickPick();
        //                         saveAuth.items = ['Encrypt and Save', 'Never store, ask every time', 'Ask again next time'].map(label => ({ label }));
        //                         saveAuth.onDidHide(() => saveAuth.dispose());
        //                         saveAuth.onDidAccept(() => {
        //                             console.log(saveAuth);
        //                             const saveAuthSelection = saveAuth.activeItems;
        //                             saveAuth.dispose();
        //                             console.log(saveAuthSelection[0].label.toString());
        //                             if (saveAuthSelection[0].label.toString() === 'Encrypt and Save') {
        //                                 console.log('saving password');
        //                                 Keychain.setToken(host, input);
        //                             } else {
        //                                 console.log('storing to not ask about saving again');
        //                                 Keychain.setToken(host, '');
        //                             }
        //                         });
        //                         saveAuth.show();
        //                     }
        //                 });
        //                 authInput.show();
        //             }
        //             if (password && password !== '') {
        //                 vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('icrfs:/'), name: host });
        //                 icrFs.connect(host.split('@')[1], host.split('@')[0], password, false, true);
        //                 initialized = true;
        //             }
        //         });
        //     }
        // });
        // hostPick.onDidHide(() => hostPick.dispose());
        // hostPick.show();

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


    // see if we have a connected device specified in memento
    //  if we do, then re-connect as needed
    // Disconnect command is the only way to clear the connected device
    // can setup the status bar to execute a command, like 'disconnect'
    const connectedDevice = ext.context.workspaceState.get('connectedF5')
    if(connectedDevice) {
        vscode.commands.executeCommand("icrfs.connect", connectedDevice)
    }
}

// this method is called when your extension is deactivated
export function deactivate() { }
