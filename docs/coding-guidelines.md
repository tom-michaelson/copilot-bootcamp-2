# Coding Guidelines

## TODO App Coding Standards

This document outlines the coding standards and quality principles for the TODO application.

### Code Formatting

- **General Formatting Rules**: Follow consistent formatting conventions throughout the codebase
  - Maintain consistent indentation (2 or 4 spaces)
  - Use meaningful variable and function names
  - Keep line lengths reasonable for readability

### Import Management

- **Sort Imports**: Organize imports in a consistent order
  - Group imports logically (e.g., external libraries, internal modules, relative imports)
  - Sort imports alphabetically within each group
  - Remove unused imports to keep the code clean

### Code Quality Tools

- **Use a Linter**: Enforce coding standards automatically
  - Configure and use linting tools (e.g., ESLint for JavaScript)
  - Address linter warnings and errors before committing code
  - Maintain consistent linting rules across the entire project

### Best Practices

- **DRY Principle (Don't Repeat Yourself)**
  - Avoid code duplication by extracting common logic into reusable functions or components
  - Create utility functions for repeated operations
  - Use inheritance, composition, or mixins to share functionality

- **IOC (Inversion of Control)**
  - Design components with loose coupling and high cohesion
  - Use dependency injection to make code more testable and maintainable
  - Prefer composition over inheritance where appropriate
  - Write code that depends on abstractions rather than concrete implementations

### Code Review

- All code should be reviewed for adherence to these guidelines before merging
- Use automated tools to catch common issues early
- Focus on maintainability, readability, and performance during reviews
