NAME?=f5-iapp
VERSION?=1.4.1

out/extension.js: src/extension.ts
	npm run compile

build: out/extension.js

install: build
	mkdir -p ~/.vscode/extensions/$(NAME)
	cp -r LICENSE README.md CHANGELOG.md images language-configuration.json package.json snippets syntaxes src out ~/.vscode/extensions/$(NAME)
