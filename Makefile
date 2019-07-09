BASENAME?=irule
NAME?=f5-$(BASENAME)
VERSION?=$(shell jq -r .version package.json)
VSIX?=$(BASENAME)-$(VERSION).vsix
PKG_ID?=bitwisecook.$(BASENAME)

node_modules/:
	npm install

out/extension.js: src/extension.ts node_modules/
	npm run compile

clean:
	rm -rf out $(VSIX)

dist-clean: clean
	rm -rf node_modules

build: out/extension.js

install: package
	code --install-extension $(VSIX)

uninstall:
	code --uninstall-extension $(PKG_ID)

package: $(VSIX)

$(VSIX): build
	vsce package
