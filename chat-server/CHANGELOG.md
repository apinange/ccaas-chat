# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Agent-assist script config (`src/config/agent-assist-script.js`) with RESUMO, SUGESTÕES, SENTIMENTOS and despedida examples.
- `getLastConsecutiveUserMessages` and `getRecentMessages` in message storage for script-based analysis input.
- `selectFromScript` and `buildAgentAssistPayloadFromScript` in OpenAI service: LLM selects suggestion and sentiment from script; summary only on despedida.

### Changed

- Update-analysis flow uses script: last consecutive user messages + recent context sent to LLM; LLM returns suggestion index, sentiment index, and is_despedida; payload built with reasoning (on top) and suggestion (below); sentiment as label + score for widget; script RESUMO sent only when client says goodbye.

## [1.0.0] - (existing)
