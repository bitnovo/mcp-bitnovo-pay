# Contributing to MCP Bitnovo Pay

Thank you for your interest in contributing to MCP Bitnovo Pay! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)
- Relevant logs (with sensitive data masked)

### Suggesting Features

Feature requests are welcome! Please open an issue with:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**:
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Run checks**:
   ```bash
   npm run lint        # Check code style
   npm run lint:fix    # Auto-fix issues
   npm test            # Run tests
   npm run build       # Verify build works
   ```
5. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Reference issues if applicable
6. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- A Bitnovo Pay account with Device ID

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bitnovo/mcp-bitnovo-pay.git
   cd mcp-bitnovo-pay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure MCP client** (Claude Desktop, etc.):
   - Add configuration to your MCP client config file
   - Include your Bitnovo Device ID in the env section
   - See setup guides in `docs/setup/`

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm test            # Run all tests
   npm run test:watch  # Watch mode
   npm run test:coverage # With coverage
   ```

## Project Structure

```
src/
├── index.ts           # MCP server entry point
├── tools/             # MCP tool implementations
├── services/          # Business logic layer
├── api/               # Bitnovo API client
├── utils/             # Utilities (logging, validation, etc.)
├── types/             # TypeScript type definitions
└── config/            # Configuration management

tests/
├── contract/          # MCP contract tests
├── integration/       # Integration tests
└── unit/              # Unit tests
```

## Coding Standards

### TypeScript
- Use strict mode (configured in tsconfig.json)
- Avoid `any` types when possible
- Export types from `src/types/index.ts`
- Use meaningful variable and function names

### Code Style
- Format with Prettier (runs automatically on commit)
- Follow ESLint rules
- Use async/await over promises
- Add JSDoc comments for public APIs

### Testing
- Write tests for new features
- Maintain 80%+ code coverage
- Test both success and error cases
- Use descriptive test names

### Security
- **Never commit secrets** or credentials
- Mask sensitive data in logs
- Validate all user inputs
- Use HTTPS for all API calls

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new APIs
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
- Update type definitions for new data structures

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Run full test suite: `npm test`
4. Build production bundle: `npm run build`
5. Create git tag: `git tag v1.x.x`
6. Push tag: `git push --tags`
7. Publish to npm: `npm publish`

## Questions?

If you have questions about contributing:
- Open an issue on GitHub
- Check existing issues and documentation
- Review the `docs/` directory

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make MCP Bitnovo Pay better!