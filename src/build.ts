import * as converter from 'converter';
import { createReadStream, createWriteStream, mkdir } from 'fs';

/*
    Create syntax directory
*/
mkdir('./out/syntaxes', (callback) => { return; });

const language = (l: any[], i: number, a: { length: any; }) => {
    console.info(`${l[1]} (${i + 1}/${a.length})`);
    const options = { from: 'yml', to: 'plist' };
    const from = createReadStream(`./syntaxes/${l[0]}.YAML-tmLanguage`);
    const to = createWriteStream(`./out/syntaxes/${l[0]}.tmLanguage`);
    const via = converter(options);
    from.pipe(via).pipe(to);
};

const syntax = [
    ['irule', 'F5 iRule'],
];

console.info('Building Grammar\n');
syntax.forEach(language);
