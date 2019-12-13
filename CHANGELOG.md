# Change Log

All notable changes to the "irule" extension will be documented in this file.

## [Unreleased]

## 1.0.0

## Added
Support for TMOS 12.1.0

## 1.3.0

### Added
Support for TMOS 15.0.0 and below

### Changed
Fixed pairings
Removed unused files from inside syntaxes
Fixed some typos in snippets

## 1.3.1

### Changed
Improve the basic snippets to get some suggestions in

## 1.3.2

### Added
Add a simple Makefile
Fix up missing Tcl commands
Start trying to add an error for double-substitution

## 1.4.0

### Added
A stub of a code formatter
A stub of a more complex completion provider
Numeric and operator recognition (including octal and hex)
Highlight potential double-substitution errors

### Changed
Update to a more modern structure

## 1.4.1

### Changed
Improve code completion

## 1.4.2

### Changed
Improve highlighting double-substitution errors

## 1.4.3

### Changed
Improve the code formatter to support selected regions
Improve the code formatter to use the defined tab style

## 1.4.4

### Changed
Improve the code formatter to ignore braces inside lines that are comments

## 1.4.5

### Added
Completions for table and class

### Changed
Improve the code formatter around escaped open curlies at the end of a line
Improve the build system
Improve completion triggers

## 1.4.6

### Changed
Improve the code formatter around continuations

## 1.5.0

### Added
Create actual diagnostics for easy double-substitution and missing options terminator

## 1.5.1

### Changed
Make the diagnostics bail out if the languageId isn't 'irule-lang'

## 1.5.4

### Changed
Make the formatter work with some ugly cases
Fix the regexp/regsub detection

### Added
Options for disabling diagnostics
Tests for formatting

## 1.5.9

### Changed
Fixed sytax highlighting on case-sensitive file system installations
Fixed proc/foreach/while diagnostic excessive warnings
Fixed extension node_modules inclusion

### Added
Nothing

## 1.5.10

### Changed
Fixed #2 by detecting command boundaries more reliably

### Added
Nothing

## 1.5.11

### Changed
Fix how events are syntax highlighted
Mark more deprecated commands as illegal (v4.x compat commands)

### Added
BIG-IP version 15.1.0 new commands
A menu command to escape selections as a quoted Tcl string

## 1.5.12

### Changed
Improve the highlighting of all the diagnostics

### Added
Add diagnostics for double substitution around if, while, for
