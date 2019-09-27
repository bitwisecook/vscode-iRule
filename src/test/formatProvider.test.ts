//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
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

    // this form of if/elseif/else is valid in iRules
    // but not valid Tcl
    // I'm not convinced I should fix
    test("UglyIf", function () {
        const src: string = `
proc tmp {a b} {
if {$a} {
puts foo
} elseif {$b} { puts bar }
else { puts baz }
}
`;
        const dst: string = `
proc tmp {a b} {
    if {$a} {
        puts foo
    } elseif {$b} { puts bar }
    else { puts baz }
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("UglyStringMap", function () {
        const src: string = `
proc escape {value} {
return [string map {
"\\\\"	"\\\\\\\\"
"/"		"\\\\/"
"\\""	"\\\\\\""
} $value]
}
`;
        const dst: string = `
proc escape {value} {
    return [string map {
        "\\\\"	"\\\\\\\\"
        "/"		"\\\\/"
        "\\""	"\\\\\\""
    } $value]
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("UglyIf2", function () {
        const src: string = `
if {aaa &&
(bbb || ccc)} {
puts "cool"
}
`;
        const dst: string = `
if {aaa &&
    (bbb || ccc)} {
    puts "cool"
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("IfElseIfElse", function () {
        const src: string = `
proc tmp {a b} {
if {$a} {
puts foo
} elseif {$b} {
puts bar
} else {
puts baz
}
}
`;
        const dst: string = `
proc tmp {a b} {
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

    test("IfElseIfElse with Comments", function () {
        const src: string = `
proc tmp {a b} {
# my proc
if {$a} {
# foo
puts foo
} elseif {$b} {
# bar
puts bar
} else {
# baz
puts baz
}
}
`;
        const dst: string = `
proc tmp {a b} {
    # my proc
    if {$a} {
        # foo
        puts foo
    } elseif {$b} {
        # bar
        puts bar
    } else {
        # baz
        puts baz
    }
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

    test("RealRule1", function () {
        const src: string = `
when CLIENTSSL_CLIENTHELLO priority 150 {
# A comment
# a couple of 
# lines long
if { [SSL::command something] } {
set vs [class lookup "[string tolower [string trimright [string range [SSL::extensions -type 0] 9 end] .]] [IP::local_addr] [TCP::local_port]" something]
if { \$vs eq "" } {
    if {[SSL::command] > 0} {
        binary scan [SSL::command] H* ssl_thing
    } else {
        set ssl_thing ""
    }
            HSL::send [HSL::open -proto TCP -pool "/Common/loggingservers"] "..."
event disable all
    reject
} else {
    virtual \$vs
}
} else {
# anothe comment
# goes here
if {[SSL::command] > 0} {
     binary scan [SSL::command] H* ssl_thing
} else {
set ssl_thing ""
}
HSL::send [HSL::open -proto TCP -pool "/Common/loggingservers"] "..."
            event disable all
reject
}
unset -nocomplain -- vs
}        
`;
        const dst: string = `
when CLIENTSSL_CLIENTHELLO priority 150 {
    # A comment
    # a couple of
    # lines long
    if { [SSL::command something] } {
        set vs [class lookup "[string tolower [string trimright [string range [SSL::extensions -type 0] 9 end] .]] [IP::local_addr] [TCP::local_port]" something]
        if { \$vs eq "" } {
            if {[SSL::command] > 0} {
                binary scan [SSL::command] H* ssl_thing
            } else {
                set ssl_thing ""
            }
            HSL::send [HSL::open -proto TCP -pool "/Common/loggingservers"] "..."
            event disable all
            reject
        } else {
            virtual \$vs
        }
    } else {
        # anothe comment
        # goes here
        if {[SSL::command] > 0} {
            binary scan [SSL::command] H* ssl_thing
        } else {
            set ssl_thing ""
        }
        HSL::send [HSL::open -proto TCP -pool "/Common/loggingservers"] "..."
        event disable all
        reject
    }
    unset -nocomplain -- vs
}
`;
        const preIndent = '';
        const tabChar = ' ';
        const tabDepth = 4;
        assert.equal(fp.formatIRule(src, preIndent, tabChar, tabDepth), dst);
    });

});
