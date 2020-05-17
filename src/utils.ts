import * as vscode from 'vscode';

import { ext } from './extensionVariables';
import * as Keychain from './auth/keychain';

/**
 * Host Connectivity Status Bar
 * Feed it text, it will show up
 * Feed it nothing, it will disappear!
 * @param host selected host/device from config
 */
export function setHostStatusBar(host: string = '') {

    ext.hostStatusBar.command = 'f5.disconnect';
    ext.hostStatusBar.text = host ? host || '' : '';
    ext.hostStatusBar.tooltip = 'test for connected?';

    if (host) {
        ext.hostStatusBar.show();
    } else {
        ext.hostStatusBar.hide();
    }
};


/**
 * Get password from keytar/memento or prompt
 * @param device BIG-IP/Host/Device in <user>@<host/ip> format
 */
export async function getPassword(device: string): Promise<any> {

    let password = await Keychain.getToken(device);
    
    if (!password) {
        password = await vscode.window.showInputBox({ password: true})
        .then( password => {
            if (!password) {
                throw new Error('User cancelled password input');
            }
            return password;
            });
    }
    return password;
}