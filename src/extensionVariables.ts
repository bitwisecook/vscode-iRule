

import { ExtensionContext, TreeView, StatusBarItem } from "vscode";
import { setHostStatusBar } from './utils'


/**
 * Namespace for common variables used throughout the extension. 
 * They must be initialized in the activate() method of extension.ts
 */

export namespace ext {
    export let context: ExtensionContext;
    export let hostStatusBar: StatusBarItem;
    // export let setHostStatusBar: set;
}