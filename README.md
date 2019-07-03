# F5 Networks iRule Extension

F5 Networks iRule extension for Visual Studio Code. This extension gives Tcl based iRule language support for Visual Studio Code including syntax and intelliSense support for iRule events, commands and statements.

Very basic code formatting is included, as is some small parts of completion. The code formatting at this point will attempt to correctly tab out an iRule, but is very rudamentary and static.

The syntax highlighting will highlight some potential double-substitution issues, such as `expr` missing curly braces.

Since 1.4.0 this has been scratch rewritten.

## Installation
```sh
make install
```

Restart VSCode.  

### From the marketplace
https://marketplace.visualstudio.com/items?itemName=bitwisecook.iRule
