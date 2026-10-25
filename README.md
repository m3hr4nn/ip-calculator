# IP Subnet Calculator

A private, dependency-free IPv4 subnet calculator that works as a single local HTML file and on GitHub Pages.

**Live demo:** https://m3hr4nn.github.io/ip-calculator/

## What it calculates

- Network/subnet base and directed broadcast address
- Subnet and wildcard masks
- Total addresses, usable hosts, and usable range
- RFC 3021-style `/31` point-to-point endpoints and `/32` host routes
- Every CIDR prefix from `/0` through `/32` in an interactive reference table

Input can be an address plus a numeric prefix, a contiguous subnet mask, or a combined value such as `192.168.1.100/24`. Invalid and ambiguous values are rejected rather than silently corrected.

## Use it locally

Download [index.html](index.html) and open it in a modern browser. It contains all styles and JavaScript, uses no external resources, makes no network requests, and stores no data.

You can also serve the checkout locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Examples

| Input | Network | Directed broadcast | Usable hosts |
|---|---|---|---:|
| `192.168.1.100/24` | `192.168.1.0` | `192.168.1.255` | 254 |
| `10.0.255.1/15` | `10.0.0.0` | `10.1.255.255` | 131,070 |
| `192.0.2.0/31` | `192.0.2.0` | Not applicable | 2 |
| `192.0.2.9/32` | `192.0.2.9` | Not applicable | 1 |

## Test it

Node.js 18 or later is sufficient; there are no packages to install.

```bash
node --test
```

The suite covers normal and boundary prefixes, malformed input, non-contiguous masks, standalone/offline behavior, and 5,000 deterministic comparisons against an independent BigInt oracle. GitHub Actions runs the same command on pushes and pull requests.

## GitHub Pages

The repository is designed to publish directly from the root of `main`:

1. Open **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select `main` and `/(root)`, then save.

No build workflow is required. Each push to `main` publishes the standalone page.

## Structure

```text
index.html                    Standalone application, styles, and logic
tests/calculator.test.js      Dependency-free Node test suite
.github/workflows/test.yml    Test-only CI workflow
Docs/Review/                  Dated engineering assessments
```

## Design choices

- Static and local-first: no server, account, analytics, persistence, or external assets.
- Exact parsing: malformed IPv4 addresses and non-contiguous masks fail visibly.
- Accessible interaction: labeled form controls, keyboard-operable actions, announced results, reduced-motion support, and a responsive table.
- Small on purpose: vanilla HTML, CSS, and JavaScript remain appropriate for this utility.

## License

[MIT](LICENSE)
