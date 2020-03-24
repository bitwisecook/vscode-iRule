const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

const inputYamlTMLanguageFile = "./syntaxes/irule.YAML-tmLanguage";
const outputTMLanguageFile = "./out/syntaxes/irule.tmLanguage";

console.log('reading YAML Language File');
const yamlTMLanguageText = fs.readFileSync(inputYamlTMLanguageFile, "utf8");
const data = yaml.safeLoad(yamlTMLanguageText);

console.log('writing Textmate Language File');
const tmLanguageText = plist.build(data);
fs.mkdirSync('./out/syntaxes', { recursive: true }, (err) => {
    return;
});
fs.writeFileSync(outputTMLanguageFile, tmLanguageText, "utf8");

console.log('complete');
