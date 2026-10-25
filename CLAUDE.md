# Project guide

This repository contains a local-first IPv4 subnet calculator.

## Constraints

- `index.html` must remain a fully standalone file: no external scripts, styles, fonts, images, packages, APIs, or network requests.
- The same file is published from the root of `main` through GitHub Pages.
- Keep the implementation in vanilla HTML, CSS, and JavaScript unless a concrete requirement makes that impossible.
- Treat all text fields as untrusted. Accept only exact IPv4, CIDR, and contiguous subnet-mask syntax.
- Preserve `/31` point-to-point and `/32` single-host behavior.
- Keep all controls keyboard accessible and all dynamic errors/results available to assistive technology.

## Validation

Run the dependency-free test suite before committing:

```bash
node --test
```

For visual changes, also open `index.html` directly and check a narrow and desktop viewport. The calculation tests include 5,000 deterministic oracle comparisons.

## Release

`main` is the GitHub Pages release branch. Create annotated semantic-version tags only after tests and browser checks pass.
