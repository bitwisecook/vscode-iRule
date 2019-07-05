NAME?=f5-iapp
VERSION?=1.4.3

node_modules/:
	npm install

out/extension.js: src/extension.ts node_modules/
	npm run compile

build: out/extension.js

install: build
	mkdir -p ~/.vscode/extensions/$(NAME)
	cp -r LICENSE README.md CHANGELOG.md images language-configuration.json package.json snippets syntaxes src out ~/.vscode/extensions/$(NAME)

package: irule-$(VERSION).vsix

irule-$(VERSION).vsix:
	vsce package
