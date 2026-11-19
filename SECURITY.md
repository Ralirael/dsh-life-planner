# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.9.x | ✅ |
| < 0.9 | ❌ |

Only the latest release receives security fixes.

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Use GitHub's private reporting channel:

1. Open the repository's **Security** tab: https://github.com/Ralirael/dsh-life-planner/security
2. Click **Report a vulnerability** (private vulnerability reporting is enabled)
3. Include: affected version, platform, reproduction steps, and the impact you expect

If the Security tab is unavailable, contact the maintainer through the GitHub profile:
https://github.com/Ralirael

## Scope

In scope:

- the plugin host (`plugin/index.js`) and client bundle (`plugin/client.js`)
- the study preset (`study-preset/`)
- the release archives published under **Releases**
- installation and update instructions that could expose user data

Out of scope:

- vulnerabilities in DSH Desktop itself, Node.js, or third-party dependencies (report them upstream)
- issues that require an already-compromised machine or GitHub account
- social engineering

## What to expect

- Acknowledgement within a few days (best effort, solo maintainer)
- A fix or mitigation in the next patch release when the report is valid
- Credit in the release notes if you want it

## Local data

The plugin stores data only on the local machine (`~/.dsh/life-planner/` and the
conversation workspace). A report that involves uploading user data must not include
real personal data; use synthetic examples.
