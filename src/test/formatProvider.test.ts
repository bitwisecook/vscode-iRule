//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as fp from '../formatProvider';

// Defines a Mocha test suite to group tests of similar kind together
suite("Format Tests", function () {

    // Defines a Mocha unit test
    test("Single Line", function () {
        const src: string = `
set a 1
`;
        const dst: string = `
set a 1
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("Simple If", function () {
        const src: string = `
if {$a eq "a"} {
set a 1
}
`;
        const dst: string = `
if {$a eq "a"} {
    set a 1
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("Simple IfElse", function () {
        const src: string = `
if {$a eq "a"} {
set a 1
} else {
set b 2
}
`;
        const dst: string = `
if {$a eq "a"} {
    set a 1
} else {
    set b 2
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("UglyIf", function () {
        const src: string = `
proc tmp {} {
    if {$a} {
        puts foo
    } elseif {$b} { puts bar }
    else { puts baz }
}
`;
        const dst: string = `
proc tmp {} {
    if {$a} {
        puts foo
    } elseif {$b} {
        puts bar 
    } else {
        puts baz
    }
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });
});
