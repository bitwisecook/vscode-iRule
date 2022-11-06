BASENAME?=irule
NAME?=f5-$(BASENAME)
VERSION?=$(shell jq -r .version package.json)
VSIX?=$(BASENAME)-$(VERSION).vsix
PKG_ID?=bitwisecook.$(BASENAME)

.DEFAULT_GOAL := vsix

node_modules/:
	npm install

out/%.js: src/%.ts node_modules/ out/syntaxes
	npx webpack

clean:
	rm -rf out $(VSIX)

dist-clean: clean
	rm -rf node_modules

build: out/extension.js

install: package
	code --install-extension $(VSIX) --force

uninstall:
	code --uninstall-extension $(PKG_ID)

package: $(VSIX)

$(VSIX): syntax
	npx vsce package

vsix: $(VSIX)

out/syntaxes:
	mkdir -p $@

out/syntaxes/%.json: syntaxes/%.tmlanguage.yaml out/syntaxes
	npx js-yaml $< > $@

syntax: out/syntaxes/irule.json
