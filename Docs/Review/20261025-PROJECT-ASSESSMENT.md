# IP Subnet Calculator Project Assessment

**Review date:** 2026-10-25

**Reviewed checkout:** `develop` at `133b4f8` (`feat: add real-time input validation and smart field locking`)

**Review scope:** Repository reconstruction, code and history review, safe local validation, and improvement planning. No application, dependency, infrastructure, existing-documentation, remote, or production changes were made.
**Overall portfolio verdict:** **Needs remediation**

## Executive assessment

This is a small, understandable, dependency-free IPv4 subnet calculator intended for network engineers, system administrators, infrastructure teams, and learners. It is a static browser application: `index.html` owns the markup and all calculation/UI JavaScript, `style.css` owns presentation, and `.gitlab-ci.yml` is intended to publish the two files through GitLab Pages. There is no backend, persistence, account system, tenant boundary, external runtime integration, or client-side network call.

The current `develop` branch has a sound calculation core for valid IPv4/CIDR inputs. An independent BigInt oracle agreed with its subnet mask, network, and broadcast results for 10,000 randomized valid vectors, and focused checks passed for `/15`, `/24`, `/31`, and `/32`. The octet-based rewrite in commit `7a09c47` is an important correction worth preserving. The project also has a legitimately useful CIDR/wildcard reference table and a very low dependency and data-exposure footprint.

It is not yet credible to present as a finished portfolio project, for five principal reasons:

1. The advertised GitHub Pages source is `main`, but the locally recorded `origin/main` is two commits behind `develop` and still contains a confirmed signed-bitwise calculation defect. For `192.168.1.100/24`, that implementation produces network `0.87.255.0` and broadcast `0.0.0.255`. The local `main` has the fix but is one commit ahead of `origin/main`; `develop` adds input filtering. Production was deliberately not contacted, so the live site's exact state is unknown.
2. Current validation silently accepts malformed data. Empty IPv4 octets become zero, non-contiguous subnet masks are reinterpreted as shorter prefixes, and extra slash suffixes are ignored. A network-planning utility should reject ambiguous input rather than emit plausible but wrong results.
3. There is no repeatable test suite or validation job. A commit message says eight validation scenarios passed, but no test artifact exists. The historical broadcast regression and current parser defects demonstrate the practical consequence.
4. GitLab deployment is advertised but the checked-in pipeline does not produce the documented site: it publishes `.public` rather than the required/default `public` path and copies no stylesheet. The README shows a different, still incomplete pipeline example.
5. The “responsive” and accessibility claims are not borne out. At a 375 px viewport the page has horizontal overflow and clipped fields/table content; inputs lack labels, dynamic results are not announced, and clickable table rows cannot be operated as controls by keyboard or assistive technology.

The right next move is not a rewrite or framework migration. A focused first batch should establish one release branch, land the already-written arithmetic fix, make parsing exact, add a small dependency-free `node:test` suite and CI gate, fix or remove the GitLab Pages path, and make the README describe only verified behavior. This is a small project; those changes can be similarly small.

## 1. Reconstructed project

### 1.1 Purpose and users

Documented intent is consistent across `README.md:1-18`, `README.md:182-189`, and `CLAUDE.md:5-16`:

- Provide quick IPv4 subnet calculations without sending address data to a service.
- Support network engineers, system administrators, DevOps/compute teams, and learners.
- Run from static files on GitHub Pages, GitLab Pages, an internal server, or directly from disk.
- Remain understandable and dependency-free: vanilla HTML, CSS, and JavaScript, with no build step.
- Double as a CIDR/subnet-mask/wildcard reference.

The actual scope is **IPv4 subnet arithmetic only**. IPv6, VLSM planning, subnet splitting, persistence, collaboration, export, authentication, and APIs are neither implemented nor promised. They should not be added merely to make the portfolio look larger.

### 1.2 Principal workflows

1. **Separate input:** enter an IPv4 address in `#ip`, enter a numeric prefix or dotted subnet mask in `#cidr`, then click Calculate or press Enter (`index.html:12-15`, `38-45`, `149-207`).
2. **Combined input:** enter `address/prefix` in `#ip`; the CIDR field is cleared and disabled when a slash appears (`index.html:47-68`, `117-126`, `154-163`).
3. **Reference lookup:** scan the generated `/0`–`/32` table; click a row to copy its prefix to the CIDR input and return focus to the IP input (`index.html:235-271`).
4. **Static delivery:** load the repository root through a browser/server, configure GitHub Pages to publish a branch root, or run the GitLab Pages job (`README.md:70-113`, `.gitlab-ci.yml:1-10`).

### 1.3 Architecture and data flow

```text
Untrusted keyboard/paste input
        |
        v
UI character filters (input events)
        |
        v
parseIpInput / parseCidrInput / isValidIP
        |
        v
cidrToMask + octet-wise network/broadcast arithmetic
        |
        v
host-count/range formatting
        |
        v
#result.innerHTML in the same browser page

Repository branch --> Pages configuration/CI --> static index.html + style.css
```

Components and boundaries:

| Component | Responsibility | State/integration | Trust notes |
|---|---|---|---|
| `index.html:1-31` | Page structure and controls | Browser DOM only | Inputs are the only runtime trust boundary. |
| `index.html:32-272` | Filtering, parsing, IPv4 calculations, table generation, DOM updates | No persistence or network I/O | Final validation must be authoritative; input-event filtering is bypassable and currently incomplete. |
| `style.css:1-144` | Theme, layout, animation, hover/focus presentation | No external fonts/assets | Small-screen layout and reduced-motion behavior are incomplete. |
| `.gitlab-ci.yml:1-10` | Intended GitLab Pages artifact | GitLab CI/Pages | Deployment boundary is misconfigured. |
| GitHub Pages settings | Advertised live deployment | External configuration, not stored here | Publishing source and deployed commit could not be verified without contacting the external service. |

There is no application storage. Values live only in DOM input elements until the page is closed or refreshed. There are no cookies, browser storage calls, analytics, remote fonts, `fetch`, XHR, WebSocket, form submission, backend, database, file upload, secrets at runtime, or third-party package supply chain.

### 1.4 Recovered design principles and decisions

The following distinctions matter because repository prose is evidence, not necessarily truth.

| Principle/decision | Status | Evidence and interpretation |
|---|---|---|
| Static, local-capable, dependency-free operation | Documented and observed | `README.md:3-18`, `48-52`, `99-107`; six tracked files and no manifest/build tool. This is a good fit for the task. |
| One-page implementation for simplicity | Documented and observed | `README.md:48-52`; markup and JavaScript are together in `index.html`. Keep the product simple, but extracting pure calculation code is justified if it enables testing. |
| Flexible input (`IP`, `IP/CIDR`, numeric CIDR, dotted mask) | Documented and implemented, validation partial | `README.md:24-27`; parsers at `index.html:106-147`. |
| Correct handling of `/31` and `/32` | Documented and mathematically implemented, wording inconsistent | `README.md:63-66`; `index.html:188-191`. `/31` has two usable endpoints as intended, but the result still labels them network/broadcast. |
| Educational interactive table | Documented and implemented | `README.md:31-36`; `index.html:235-271`. Pointer interaction works; accessible control semantics do not. |
| Responsive modern UI | Documented, only partially implemented | `README.md:38-42`; mobile browser validation found horizontal overflow. |
| Semantic Versioning | Documented intent only | `README.md:160-166`, `CLAUDE.md:55-62`; no tags are present in the local repository. |
| Binary-conversion calculation flow | Stale documentation/partly abandoned implementation | `README.md:54-60` and `CLAUDE.md:18-23,71-76` describe binary calculation. Commit `7a09c47` replaced it with octet-wise operations, leaving `ipToBinary()` unused at `index.html:82-85`. |

### 1.5 Feature status

| Feature | Assessment |
|---|---|
| Valid IPv4/CIDR network, broadcast, mask, wildcard, address count and host range | Implemented correctly on reviewed `develop`; fixed but not present in locally recorded `origin/main`. |
| `/31` two-endpoint and `/32` one-host arithmetic | Implemented; `/31` labels need clarification. |
| Numeric CIDR and contiguous dotted masks | Implemented. |
| Combined `IP/CIDR` input | Implemented; grammar accepts an extra suffix such as `/24/7`. |
| `/0`–`/32` reference table and pointer row selection | Implemented. |
| Keyboard calculation by Enter | Implemented for input fields. |
| Keyboard table-row selection | Not implemented. |
| Input validation | Partial and misleadingly described as comprehensive. |
| Responsive mobile layout | Partial; narrow viewport overflows. |
| GitHub Pages deployment | Documented/external; configuration and current live revision unknown. |
| GitLab Pages deployment | Present but nonfunctional as checked in. |
| Automated tests, CI quality gate, release automation | Not implemented. |
| SemVer releases | Documented only; no tags found. |
| Browser support matrix | Claimed, not evidenced. |

### 1.6 Previous findings and whether they were resolved

No prior audit, assessment, improvement plan, issue export, or test artifact exists in the working tree. `CLAUDE.md:78-83` is the only explicit prior finding: GitLab CI omits `style.css`. It remains unresolved in `.gitlab-ci.yml:5`. The README's pasted pipeline example copies the stylesheet (`README.md:83-95`) but does not match the real file and still publishes `.public` without renaming/configuring it as the Pages directory.

Commit `7a09c47` records and fixes a broadcast calculation defect by replacing JavaScript whole-number bitwise operations with octet-wise operations. That fix exists on local `main` and `develop`, but not on the locally recorded `origin/main`. Commit `133b4f8` says “All 8 validation test scenarios pass,” yet it adds no tests and misses the malformed inputs reproduced in this assessment.

## 2. Evidence-backed findings

Severity reflects this project's modest, client-only scope: **High** can make the advertised calculator materially wrong or unavailable; **Medium** impairs a supported workflow, maintainability, or a meaningful group of users; **Low** is limited-impact debt. Confidence is about the evidence, not the severity.

### Confirmed defects

#### F-01 — The advertised publish branch contains the historical arithmetic defect

- **Category:** Correctness / delivery / portfolio credibility
- **Severity:** High
- **Confidence:** High for the locally recorded branch; medium for current production exposure
- **Evidence:** `README.md:5,72-76` says the live demo publishes `main`. Local refs show `origin/main` at `7daa63c`, local `main` at `7a09c47`, and `develop` at `133b4f8`; `origin/main...develop` is `0 2`. The `origin/main` implementation at former `index.html:138-147` performs 32-bit JavaScript bitwise operations on whole addresses. Reproduction with that exact expression for `192.168.1.100/24` produced `0.87.255.0` as the network and `0.0.0.255` as broadcast. Commit `7a09c47` replaces that path at current `index.html:176-187`.
- **Affected workflow/scenario:** A reviewer following the documented GitHub Pages route may receive invalid results for ordinary addresses whose 32-bit value triggers signed bitwise behavior. Using the value for firewall rules or addressing plans would be operationally dangerous.
- **Correction:** Make one branch the canonical release source, merge/cherry-pick the current octet-wise fix into it, require tests before publishing, and verify Pages is configured for that branch/root. Do not maintain equivalent fixes independently on long-lived branches.
- **Effort/dependencies/risk:** Small (hours), dependent on repository/Pages access; low code regression risk because the fix already exists and passed randomized checking. Deployment state must be checked separately.
- **Verification:** Run deterministic vectors covering first octets below and above 128 and prefixes crossing octet boundaries; run the randomized oracle suite; confirm the Pages deployment commit SHA and execute the same examples on the deployed site.

#### F-02 — IPv4 and mask validation accepts malformed values and returns plausible wrong networks

- **Category:** Correctness / input validation
- **Severity:** High
- **Confidence:** High
- **Evidence:** `isValidIP()` uses `Number(p)` without requiring a non-empty decimal octet (`index.html:227-233`), so JavaScript converts `''` to `0`. `subnetMaskToCidr()` finds only the first zero and never checks that no later one bit occurs (`index.html:106-115`). `parseIpInput()` splits only at the first slash, while `parseInt()` accepts a valid numeric prefix before trailing text (`index.html:117-146`). Executed reproductions:

  | Input | Actual reviewed behavior |
  |---|---|
  | `192.168..1`, CIDR `24` | Accepted and calculated as network `192.168.0.0/24`. |
  | `192.168.1.`, CIDR `24` | Accepted and calculated as `192.168.1.0/24`. |
  | `192.168.1.10`, mask `255.0.255.0` | Accepted as `/8`, yielding `192.0.0.0`–`192.255.255.255`. |
  | `192.168.1.1/24/7` | Accepted as `/24`; the extra suffix is ignored. |

- **Affected workflow/scenario:** A typo in an infrastructure plan is silently normalized to a different network rather than rejected. The output looks authoritative and may be copied into routing, ACL, or address-management work.
- **Correction:** Parse against exact grammars. Require exactly four non-empty ASCII-decimal octets, each `0..255`; require an embedded prefix to match only `0`–`32` with exactly one slash; require a dotted mask's 32-bit representation to match `^1*0*$`. Return field-specific errors. Character filtering may remain as convenience but must not be considered validation.
- **Effort/dependencies/risk:** Small (roughly half a day including tests), no new dependency; medium regression risk around previously tolerated leading zeros or punctuation. Decide and test whether leading-zero octets are accepted or rejected.
- **Verification:** Table-driven tests for valid boundaries and malformed values (empty octets, signs, whitespace, extra dots/slashes, numeric suffixes, non-contiguous masks, values over 255/32), plus browser-level input tests.

#### F-03 — No executable test or quality gate protects core arithmetic

- **Category:** Testing / maintainability / release control
- **Severity:** Medium
- **Confidence:** High
- **Evidence:** The repository has no test/spec files, package manifest, GitHub Actions workflow, or validation command. `CLAUDE.md:35-38` explicitly says there is no automated suite. `.gitlab-ci.yml:1-10` contains only a deployment job. Commit `133b4f8` claims eight scenarios passed, but no inputs, expected outputs, runner, or report were committed. The parser failures in F-02 and prior arithmetic fix in `7a09c47` are concrete escaped regressions.
- **Affected workflow/scenario:** A one-line parser or bitwise change can silently corrupt results, and publishing has no objective stop condition. A portfolio reviewer cannot reproduce the claimed validation.
- **Correction:** Extract only the pure parsing/calculation functions into one browser-compatible JavaScript module and test it with Node's built-in `node:test`/`assert`; avoid adding a framework. Add deterministic vectors, malformed input cases, `/0`, `/31`, `/32`, cross-octet boundaries, and a fixed-seed property/oracle test. Gate the release branch in whichever CI provider is canonical.
- **Effort/dependencies/risk:** Small-to-medium (one day); requires deciding the supported Node version in CI. Low runtime risk if the DOM adapter remains thin and behavior is captured first.
- **Verification:** A documented one-command test run succeeds from a fresh checkout; deliberately mutating one expected calculation makes CI fail; deployment cannot run after failed tests.

#### F-04 — Checked-in GitLab Pages configuration cannot publish the styled application as documented

- **Category:** Delivery / portfolio credibility
- **Severity:** Medium
- **Confidence:** High
- **Evidence:** `.gitlab-ci.yml:4-8` creates and artifacts `.public`, but does not rename it to `public` or configure `pages.publish`; `.gitlab-ci.yml:5` copies only `index.html`, which references `style.css` at `index.html:7`. Current GitLab documentation says Pages publishes `public` by default, or a path explicitly selected with `pages.publish`; its plain-HTML example moves `.public` to `public`. The repository's own `CLAUDE.md:50-53,78-83` acknowledges the missing stylesheet. `README.md:83-95` presents different YAML that adds CSS but retains the unconfigured `.public` artifact and claims automatic deployment.
- **Affected workflow/scenario:** A user follows the advertised internal-GitLab workflow and gets a failed Pages deployment or an incomplete artifact; even if an instance accepts the artifact, the page has no stylesheet.
- **Correction:** If GitLab is supported, use current explicit Pages syntax and publish a directory containing both files, then validate on the minimum supported self-managed GitLab version. If it is not actually supported, remove the pipeline and claim rather than carrying an untested second deployment route.
- **Effort/dependencies/risk:** Small (hours); depends on selecting a supported GitLab version and access to a safe CI project. Low application risk, medium compatibility risk across old self-managed GitLab versions.
- **Verification:** Lint the YAML for the selected GitLab version; inspect the generated artifact for `index.html` and `style.css`; deploy to a non-production Pages project and load both assets successfully.

#### F-05 — Core controls and dynamic feedback are not accessibly represented

- **Category:** Accessibility / user experience
- **Severity:** Medium
- **Confidence:** High from code; screen-reader behavior was not manually tested
- **Evidence:** The two inputs have placeholder text but no visible or programmatic labels (`index.html:12-13`). The result region has no live-region/status semantics (`index.html:15`, `165-206`). Table rows are given click handlers and pointer cursors but are not native controls, focusable, keyboard-operable, or named as controls (`index.html:235-265`). WCAG 2.2 calls for labels/instructions for inputs, programmatically determinable names and roles, keyboard equivalents for pointer actions, and announcement of status/error changes. The separate Enter shortcut calculates but does not expose row selection to keyboard users.
- **Affected workflow/scenario:** A screen-reader user encounters unnamed edit fields and may not hear validation/results; a keyboard-only user cannot use the advertised quick-reference row action.
- **Correction:** Use a semantic `<form>`, visible `<label>` elements, a submit button, and an appropriately scoped `aria-live`/status or alert region. Put a native button in each selectable row or remove row-as-control behavior and provide an accessible select/control. Preserve normal table semantics.
- **Effort/dependencies/risk:** Small-to-medium (about one day including manual checks); no dependency. Low calculation risk, medium interaction regression risk.
- **Verification:** Keyboard-only walkthrough with Tab/Shift+Tab/Enter/Space; inspect the accessibility tree; test errors and successful results with at least one screen reader; run an automated accessibility check as a supplement, not a substitute.

#### F-06 — The claimed responsive layout horizontally overflows on mobile

- **Category:** User experience / portfolio credibility
- **Severity:** Medium
- **Confidence:** High
- **Evidence:** `README.md:41` says the layout works on desktop and mobile. There is no media query, global `box-sizing`, table wrapper, or overflow rule in `style.css`. Inputs/buttons use `width: 100%` plus padding/border under content-box sizing (`style.css:30-40`), and the four-column table has non-wrapping intrinsic content (`style.css:113-140`). A real headless Chrome render at 375×812 showed horizontal page scrolling, clipped placeholders, and clipped wildcard/host columns.
- **Affected workflow/scenario:** Phone users must pan the entire page to read or operate controls and cannot see the complete reference table at once.
- **Correction:** Apply `box-sizing: border-box` to controls (preferably globally), constrain the container to the viewport, and place the reference table in a labeled horizontal-scroll wrapper or provide a deliberate stacked/narrow representation. Do not hide columns that carry calculator meaning.
- **Effort/dependencies/risk:** Small (hours); no dependency. Low regression risk, but desktop and zoom behavior need rechecking.
- **Verification:** Visual and interaction checks at 320, 375, 768, and desktop widths, at 200% and 400% zoom; assert no page-level horizontal overflow while allowing deliberate table-local scrolling.

#### F-07 — Published documentation overstates validation, reproducibility, release practice, and implementation details

- **Category:** Documentation / portfolio credibility
- **Severity:** Medium
- **Confidence:** High
- **Evidence:** `README.md:55-60` and `CLAUDE.md:71-76` describe binary conversion even though current arithmetic is octet-based and `ipToBinary()` is dead code. `CLAUDE.md:15` calls the theme red/gray although it is navy/gold. `README.md:41` claims mobile support contradicted by F-06. `README.md:70-97` claims both deployments without a stored GitHub workflow/settings record or working GitLab job. `README.md:160-166` claims SemVer but the local repository has no tags. `README.md:170-178` lists exact browser floors without a compatibility test matrix. There are no screenshots or recorded expected-output examples that a reviewer can compare.
- **Affected workflow/scenario:** A portfolio reviewer follows setup/deployment claims that cannot be reproduced and finds source behavior inconsistent with architecture claims, reducing confidence even where the code is good.
- **Correction:** After fixes, rewrite claims as verified facts: name the tested commit/branch and commands, show deterministic example outputs, state IPv4-only scope and no data transmission, document supported browsers only if actually tested, show the true deployment path, and add one current desktop/mobile screenshot. Remove the SemVer claim unless releases/tags are actually maintained.
- **Effort/dependencies/risk:** Small (hours after behavior stabilizes); depends on release/deployment decisions. Negligible runtime risk; risk is documentation becoming stale again, mitigated by keeping verification commands executable.
- **Verification:** Follow the README from a clean checkout on a second machine/browser; compare every feature and deployment claim with an automated check or named manual check; verify links and screenshots against the release commit.

#### F-08 — `/31` output terminology contradicts the project's stated special-case semantics

- **Category:** Correctness of presentation / networking semantics
- **Severity:** Low
- **Confidence:** High
- **Evidence:** `README.md:64` says `/31` point-to-point links have “2 usable hosts, no network/broadcast.” The arithmetic correctly returns both endpoints as the usable range (`index.html:188-191`), but the same output always labels the lower address “Network Address” and upper address “Broadcast Address” (`index.html:200-205`). RFC 3021 requires both values on a `/31` point-to-point link to be interpreted as host addresses and says directed broadcast is not possible there.
- **Affected workflow/scenario:** A learner receives mutually inconsistent explanations, and an operator may misread the upper endpoint as unusable despite the “2 usable” count.
- **Correction:** For `/31`, identify the subnet/prefix separately and label the two values as endpoints/usable addresses; show directed broadcast as “not applicable on RFC 3021 point-to-point links.” Keep `/32` wording similarly explicit. State the point-to-point assumption.
- **Effort/dependencies/risk:** Small (hours including tests); no dependency. Low risk.
- **Verification:** Snapshot expected text for `/30`, `/31`, and `/32`; compare `/31` terminology with RFC 3021 and have a network practitioner review it.

### Plausible risks requiring validation

#### R-01 — Live demo and remote branch state may differ from the local refs

- **Category:** Release / operations
- **Severity:** High if the stale branch is deployed
- **Confidence:** Medium
- **Evidence:** Local refs and README imply the risk, but this review intentionally did not fetch GitHub, inspect Pages settings, or open the live URL. The checkout's remote-tracking refs may be stale.
- **Scenario:** The public portfolio link may expose the broken pre-`7a09c47` arithmetic, a newer unreviewed version, or no site at all.
- **Recommendation:** The owner should verify remote branch SHAs, Pages source/settings, last deployment result, and live deterministic vectors. Record the deployed commit visibly or in release evidence.
- **Effort/dependencies/risk:** Minutes with GitHub access; read-only. No application regression risk.
- **Verification:** Compare remote `main`, Pages deployment SHA, and page behavior with the reviewed/tested commit.

#### R-02 — Hosting security headers are unknown; inline script constrains future CSP

- **Category:** Security hardening
- **Severity:** Low
- **Confidence:** Medium
- **Evidence:** Hosting configuration/headers are not in the repository. `index.html:14` uses inline `onclick`, and all JavaScript is inline (`index.html:32-272`), so a strong script CSP would require hashes/nonces or moving script to a file. The application writes with `innerHTML` (`index.html:167,172,196,243`), but user-controlled output is constrained to numeric punctuation by final parsing in intended flows; no practical remote XSS path was confirmed.
- **Scenario:** If future features introduce URL-loaded values or less restrictive input, the existing DOM sink could become exploitable; a deployment cannot simply adopt `script-src 'self'` while inline handlers/scripts remain.
- **Recommendation:** When extracting logic for tests, move event binding/script to a same-origin file and render values with `textContent`/DOM nodes. Then choose CSP and other headers at the actual hosting layer. Do not claim CSP support before headers are verified.
- **Effort/dependencies/risk:** Small if combined with F-03; hosting headers depend on the chosen platform. Low regression risk with DOM tests.
- **Verification:** Confirm no inline executable code, run browser smoke tests under the selected CSP, and inspect deployed response headers.

#### R-03 — Exact cross-browser compatibility remains unknown

- **Category:** Compatibility
- **Severity:** Low
- **Confidence:** High that evidence is absent; behavior risk is low
- **Evidence:** `README.md:170-178` lists Chrome/Edge 88+, Firefox 85+, Safari 14+, and Opera 74+, but no matrix or CI/manual record exists. Only local Google Chrome was exercised during this review.
- **Recommendation:** Either test and record the minimums or replace precise version claims with a modest “current evergreen browsers” statement. Test direct `file://` and HTTP serving if both remain supported.
- **Verification:** Run the deterministic smoke workflow on the declared minimum/current browser set and retain a short dated matrix.

### Subjective design preferences and optional debt

These are not release blockers by themselves:

- **P-01 — Inline application code:** Separating calculation logic is justified by testability (F-03), not by a desire for layers. A framework, bundler, TypeScript migration, state manager, or component library would add more project than value.
- **P-02 — Dead and duplicated calculation concepts:** `ipToBinary()` at `index.html:82-85` is unused after `7a09c47`; host-count logic appears in the result and table paths (`index.html:188-189`, `241`). Remove dead code and share a tiny pure helper only while adding tests, not as a standalone refactor campaign.
- **P-03 — Motion preference:** Result and hover animations (`style.css:40,88-112,134-143`) have no `prefers-reduced-motion` override. Adding one is a worthwhile accessibility polish after functional barriers are fixed.
- **P-04 — Portfolio presentation:** A concise architecture/testing section and one verified screenshot would help. Badges, elaborate demos, analytics, and feature inflation would not.

## 3. Security and operational assessment

### Security posture

The attack surface is unusually small and that is a genuine strength. There is no server-side code, identity, authorization, tenant data, upload, filesystem access, dependency tree, outbound call, or stored sensitive data. Authentication, authorization, tenant isolation, database injection, transactions, concurrency, retry/duplicate processing, backups, migrations, and server-side secret handling are **not applicable** to the present architecture.

A history-wide pattern scan found no likely private keys, common provider tokens, or password/secret assignments. This is a heuristic, not proof. The only personal information observed is ordinary Git author identity. Because there are no third-party packages or lockfiles, dependency-vulnerability scanning is **not applicable**; browser and hosting platform security still depend on the user's environment.

`innerHTML` is used, but a remotely exploitable injection was not confirmed: accepted calculation output can contain only parsed numeric IPv4/prefix material, and generated table values are internal. Treat R-02 as forward-looking hardening, not a current high-severity vulnerability.

### Reliability and operations

- Runtime dependency failure is not meaningful: the application has no network dependencies after static assets load.
- Failures are immediate and local; no transaction, retry, duplicate-processing, or recovery mechanism is needed.
- Browser console/error monitoring and analytics are absent. For a privacy-friendly utility this is reasonable; automated smoke tests and Pages deployment status are more valuable than adding telemetry.
- Backups are the Git repository and hosting history. No user data requires backup.
- Resource limits and timeouts are not material for constant-size IPv4 calculations. Performance is effectively O(1), and generating 33 table rows is trivial. No demonstrable bottleneck was found.
- Rollback is not documented. For this project, redeploying a known-good commit/tag is sufficient once releases actually identify tested commits.

## 4. Validation performed

### Repository and history inspection

- Confirmed the initial worktree was clean on `develop` before creating this report.
- Inspected every tracked project file: `.gitlab-ci.yml`, `CLAUDE.md`, `LICENSE`, `README.md`, `index.html`, and `style.css`.
- Inspected all reachable commits, branch topology, commit diffs for the broadcast fix and input validation, tags, remotes, and unreachable WIP objects. No prior audit/report was found.
- Confirmed there are no test/spec files, package/dependency manifests, GitHub workflow, or release tags.

### Executed behavior checks

- Ran the current inline JavaScript in an isolated Node VM with a minimal DOM stub.
- Verified expected detailed output for:
  - `192.168.1.100/24` → network `192.168.1.0`, broadcast `192.168.1.255`, 254 usable.
  - `10.0.255.1/15` → network `10.0.0.0`, broadcast `10.1.255.255`.
  - `192.0.2.0/31` → two usable endpoints.
  - `192.0.2.9/32` → one host.
- Compared mask/network/broadcast calculation against an independently implemented BigInt oracle for **10,000 random valid IPv4/prefix vectors**: all passed.
- Generated all 33 reference-table rows successfully in both the VM harness and a real browser.
- Reproduced all malformed-input results in F-02.
- Re-executed the locally recorded `origin/main` whole-address bitwise expressions and reproduced F-01.
- Loaded the page from `file://` in local Google Chrome, dumped the rendered DOM, and captured a 375×812 rendering. This confirmed JavaScript execution and mobile overflow without contacting a service.
- Calculated relevant color ratios from source colors: placeholder `#6a7485` on `#0f1821` is about **3.79:1**; gold `#d4af37` on the blue gradient endpoint `#2a5298` is about **3.62:1**. Both are below the WCAG 2.2 AA 4.5:1 threshold for normal text. The latter affects portions of button/table-header backgrounds. This should be confirmed using computed styles across the gradient after redesign.
- Ran a history-wide heuristic secret-pattern scan: zero matches.

### Primary references consulted

- [RFC 3021: Using 31-Bit Prefixes on IPv4 Point-to-Point Links](https://www.rfc-editor.org/info/rfc3021/) for `/31` endpoint and broadcast semantics.
- [GitLab Pages settings and plain-HTML configuration](https://docs.gitlab.com/user/project/pages/introduction/) for current `public`/`pages.publish` behavior.
- [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for branch/root publication behavior.
- W3C WCAG 2.2 explanations for [labels/instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions), [keyboard operation](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [name/role/value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages), and [minimum contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).

### Limitations and unverified items

- Per scope, the live demo, GitHub API/Pages settings, GitLab, and all production/external systems were not contacted; remotes were not fetched. Live availability, current remote SHAs, deployed commit, headers, TLS, cache behavior, and production correctness are unknown.
- GitLab CI was not run or linted against a specific self-managed version because no target version/instance was identified and external execution was prohibited.
- Firefox, Safari, Edge, Opera, assistive technologies, and actual mobile devices were not tested.
- The randomized harness was review-only and intentionally kept outside the repository; it is not a substitute for a committed deterministic suite.
- No dependency scanner was run because no third-party dependency manifest exists.
- No load test was run because input and work are bounded and no performance concern was observed.

Passing arithmetic checks apply only to exact valid inputs on reviewed `develop`; they do not establish release correctness, parser correctness, accessibility, or deployment behavior.

## 5. Portfolio-readiness assessment

**Verdict: Needs remediation.** The codebase is small enough that remediation should be fast, but a calculator whose advertised release path may return wrong networks cannot be presented with a caveat alone.

### Misleading or unsupported claims to correct

- “Current Live Demo” (`README.md:5`) is not locally verifiable, and the locally recorded publishing branch lacks two later commits.
- “Comprehensive”/valid input support (`README.md:27`, commit `133b4f8`) overstates the boundary checks demonstrated in F-02.
- “Responsive Layout: Works on desktop and mobile” (`README.md:41`) is contradicted by the 375 px render.
- Binary calculation descriptions (`README.md:56-60`, `CLAUDE.md:18-23,71-76`) do not match current octet-based behavior.
- GitLab deployment steps (`README.md:78-97`) do not match the checked-in file and neither form correctly establishes the current Pages publish directory.
- Exact browser versions (`README.md:170-178`) are unsupported by test evidence.
- Semantic Versioning (`README.md:160-166`) is aspirational; there are no tags.
- `CLAUDE.md:15` describes a red/gray theme that no longer exists.

### Unsafe examples or exposed information

- No credential, private key, token, unsafe shell interpolation, data exfiltration, or user-sensitive example was found.
- The production copy command at `README.md:109-113` uses `sudo` and assumes a destination exists; it is illustrative rather than reproducible deployment guidance. Prefer server-specific documented ownership/atomic deployment or omit this generic production instruction.
- Publishing from a public branch makes all repository content public; no sensitive content exists now, but the README should not imply internal privacy merely because the tool has no outbound calls.

### Nonfunctional advertised features and setup gaps

- GitLab Pages as checked in is nonfunctional/incomplete (F-04).
- Current published revision and live functionality are unknown; local release evidence suggests a potentially broken version (F-01/R-01).
- “Open `index.html`” worked in local Chrome, but `open` is macOS-specific and is not a portable command. Document opening the file conceptually, or provide platform-neutral HTTP-server instructions.
- There is no one-command correctness check a reviewer can run.
- There are no screenshots, expected outputs, or deployment status artifacts to validate presentation claims.

### What is already portfolio-worthy

- The product scope is clear and appropriately small.
- The static/no-dependency/no-data-transfer architecture is a meaningful privacy, deployment, and maintainability advantage.
- Current valid-input arithmetic is independently validated and handles `/0`, cross-octet networks, `/31`, and `/32` without integer precision problems.
- The full CIDR/mask/wildcard table is useful and generated from shared primitives.
- The source is short enough for a reviewer to understand end to end, and the MIT license is clear.
- The octet-wise correction in `7a09c47` shows an appropriate root-cause response to JavaScript signed-bitwise behavior.

## 6. Phased improvement plan

### Phase 0 — Immediate correctness and honest release (necessary)

**Goal:** Ensure every advertised release computes only from valid input and can be reproduced.

1. Choose the canonical release branch/host and determine the currently deployed SHA.
2. Ensure the octet-wise fix from `7a09c47` is on that release branch.
3. Implement exact IPv4, prefix, slash, and contiguous-mask parsing (F-02).
4. Add a minimal pure-core `node:test` suite and make it a pre-deploy CI gate (F-03).
5. Either fix GitLab Pages for a named supported version or remove that deployment claim (F-04).
6. Correct the README/`CLAUDE.md` claims affected by those decisions; include the real test command and deterministic outputs.

**Acceptance criteria:**

- All valid deterministic vectors and a fixed-seed randomized oracle suite pass locally and in CI.
- Every malformed case in F-02 yields a clear error and no calculation result.
- The release branch contains the tested fix; deployment identifies that commit.
- A fresh checkout can run tests using documented prerequisites/one command.
- Each retained deployment route produces an artifact containing both HTML and CSS and successfully loads them in a safe test environment.
- Documentation contains no known mismatch with code, tags, branches, or tested browser support.

**Estimated effort:** 1–2 focused days plus access/queue time for safe deployment verification.

**Regression risk:** Medium, concentrated in accepted-input policy and branch/release changes. Capture behavior in tests before moving code.

### Phase 1 — Focused UI and maintainability correction (worthwhile)

**Goal:** Make the small application usable to keyboard, screen-reader, zoom, and mobile users without adding framework complexity.

1. Introduce semantic form labels, submission, result/error announcements, and an accessible alternative to clickable rows (F-05).
2. Correct page-level overflow and table behavior at narrow widths; retune failing contrast colors and honor reduced motion (F-06/P-03).
3. Clarify `/31` endpoint/broadcast presentation and `/32` wording (F-08).
4. Complete the minimal calculation/DOM separation started for tests; delete `ipToBinary()` and consolidate host-count logic only where this reduces demonstrated duplication.

**Acceptance criteria:**

- All functionality can be completed with keyboard alone using conventional keys and visible focus.
- Inputs have persistent visible labels; errors and results are announced in a screen-reader check.
- Normal text/placeholder contrast meets WCAG 2.2 AA based on computed colors.
- At 320 px and up, no page-level horizontal scrolling is required; table-local scrolling, if used, is obvious and keyboard reachable.
- `/30`, `/31`, and `/32` text agrees with tested behavior and RFC 3021 assumptions.
- The Phase 0 suite remains green; a browser smoke test covers form submission and table selection.

**Estimated effort:** 1–2 days.

**Regression risk:** Low for arithmetic, medium for DOM/focus behavior.

### Phase 2 — Portfolio polish and optional operations (optional)

**Goal:** Provide restrained, durable evidence of quality.

- Add one current desktop and one mobile screenshot after accessibility/responsive fixes.
- Record a small browser matrix or soften the browser-version claim.
- Create a release/tag only when there is a defined tested version; document rollback as redeploying that commit.
- Adopt a deploy-time CSP/security-header policy if the selected host supports it, after removing inline executable code.
- Consider IPv6 only if intended users actually need it; treat it as a separate feature with its own model/tests, not a cosmetic extension.

**Acceptance criteria:** All portfolio claims link to or name reproducible evidence; screenshots match the tagged/deployed version; optional security headers are verified from the deployed response; no analytics, framework, or infrastructure is added without a concrete requirement.

## 7. Decisions that genuinely require owner input

1. **Canonical release path:** Is GitHub Pages the only real target, or must self-managed GitLab Pages remain supported? If GitLab remains, what minimum GitLab version must the pipeline support?
2. **Release branch:** Should `main` be the tested/published branch, with `develop` merged through review, or is another branch intentionally deployed? Current local and remote-tracking states do not match the README.
3. **Input policy:** Should IPv4 octets with leading zeros be rejected to avoid ambiguity, or accepted and normalized as decimal? Empty octets, non-contiguous masks, and extra slashes should be rejected regardless.
4. **`/31` intent:** Is the calculator explicitly modeling RFC 3021 point-to-point links for `/31`? The present “2 usable hosts” behavior says yes; the UI should say so.
5. **Compatibility/accessibility target:** The pragmatic recommendation is current evergreen browsers and WCAG 2.2 AA for this simple interface. Exact legacy browser floors should exist only if there is a real user constraint and a matching test matrix.
6. **Live verification:** The deployed commit, Pages settings, headers, and current live behavior require owner-authorized access or a later explicit production-check phase.

## Concise handoff

1. **What it does/how it is structured:** A no-backend, no-dependency IPv4 subnet calculator and CIDR reference table, implemented as one HTML file with inline JavaScript plus one stylesheet and an intended GitLab Pages job.
2. **Most important verified problems:** The locally recorded advertised publish branch has broken arithmetic; current parsing accepts malformed IPv4/masks; no automated tests or release gate exist; GitLab Pages is misconfigured; mobile/accessibility claims are not met.
3. **What is implemented well:** Current valid-input arithmetic, including cross-octet prefixes and `/31`/`/32`, passed focused and 10,000-vector oracle checks; the architecture is appropriately simple, private by default, and free of runtime/package dependencies.
4. **First recommended batch:** Align and verify the release branch, land the octet fix, make parsing exact, add a tiny built-in Node test suite/CI gate, fix or remove GitLab deployment, and make documentation strictly factual. This addresses wrong answers and unreproducible claims before cosmetic work.
5. **Owner decisions:** Choose canonical host/branch, GitLab support/version, leading-zero policy, explicit `/31` semantics, browser/accessibility target, and whether to authorize later live-system verification.
