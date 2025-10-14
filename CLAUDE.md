# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static IP subnet calculator web application built with vanilla HTML, CSS, and JavaScript. The application calculates network addresses, broadcast addresses, usable hosts, and provides a CIDR-to-Subnet Mask reference table.

Live deployment: https://m3hr4nn.github.io/ip-calculator/

## Architecture

**Single-Page Application Structure:**
- `index.html` - Contains all HTML structure, inline JavaScript for subnet calculations, and calculator logic
- `style.css` - Red & gray theme styling
- No build process, bundler, or external dependencies required

**Core Calculation Logic (embedded in index.html):**
- IP/binary conversion functions: `ipToBinary()`, `binaryToIp()`
- CIDR operations: `cidrToMask()`, `cidrToWildcard()`
- Network calculations: bitwise operations for network/broadcast addresses
- IP manipulation: `incrementIp()`, `decrementIp()` for host range calculation
- Validation: `isValidIP()` for input validation

## Development Commands

**Local Preview:**
```bash
# Open in browser directly (no server required)
open index.html
# Or use any local HTTP server
python3 -m http.server 8000
```

**Testing:**
- No automated test suite currently exists
- Manual testing: verify calculations for various CIDR ranges (/8, /16, /24, /31, /32)
- Edge cases: /31 (point-to-point), /32 (host routes)

## Deployment

**GitHub Pages (current):**
```bash
git add index.html style.css
git commit -m "Update calculator"
git push origin main
```
Auto-deploys to: https://m3hr4nn.github.io/ip-calculator/

**GitLab Pages:**
- `.gitlab-ci.yml` configured for GitLab deployment
- Note: Current CI config only copies `index.html` (missing `style.css`) - needs fix
- Deploys to `.public` directory on push to main branch

## Version Management

Follow Semantic Versioning 2.0.0 for releases. Since this is a static site with no package.json, version tags should be applied via git tags:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Key Implementation Details

**CIDR Edge Cases:**
- /31: Point-to-point links (2 usable hosts, no network/broadcast)
- /32: Single host route (1 usable host)
- Standard subnets: Total hosts - 2 (exclude network and broadcast)

**Calculation Flow:**
1. Input validation (IP format + CIDR range 0-32)
2. Convert IP to 32-bit binary
3. Apply CIDR mask using bitwise AND for network address
4. Apply inverse mask using bitwise OR for broadcast address
5. Calculate usable host range based on CIDR rules

## Known Issues

`.gitlab-ci.yml` deployment script missing `style.css` in copy command. Should be:
```yaml
cp index.html style.css .public/
```
