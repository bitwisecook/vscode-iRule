VERSION?=1.3.0

install:
	mkdir -p ~/.vscode/extensions/f5-irule-$(VERSION)
	cp -r LICENSE README.md images irule.configuration.json package.json snippets syntaxes ~/.vscode/extensions/f5-irule-$(VERSION)/
