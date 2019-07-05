BASENAME?=irule
NAME?=f5-$(BASENAME)
VERSION?=1.4.4
VSIX?=$(BASENAME)-$(VERSION).vsix

node_modules/:
	npm install

out/extension.js: src/extension.ts node_modules/
	npm run compile

clean:
	rm -rf out $(VSIX)

dist-clean: clean
	rm -rf node_modules

build: out/extension.js

install: build
	mkdir -p ~/.vscode/extensions/$(NAME)
	cp -r LICENSE README.md CHANGELOG.md images language-configuration.json package.json snippets syntaxes out ~/.vscode/extensions/$(NAME)

package: $(VSIX)

$(VSIX): build
	vsce package
