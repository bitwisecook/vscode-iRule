VERSION?=1.4.1

install:
	mkdir -p ~/.vscode/extensions/f5-irule
	cp -r LICENSE README.md images irule.configuration.json package.json snippets syntaxes ~/.vscode/extensions/f5-irule/
