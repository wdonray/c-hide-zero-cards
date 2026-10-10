# Vendored dependencies

## Why

`@wdonray/analytics-core` is published to GitHub Packages as a private
package. CI can authenticate via `GITHUB_TOKEN`, but **AWS Amplify builds
cannot** — Amplify has no access to GitHub Packages credentials, so
`npm ci` fails with a 401 during production builds.

Vendoring the tarball directly in the repo sidesteps registry auth
entirely: npm installs from the local file, no credentials needed.

## How to update

1. From the `wdonray/analytics-core` repo, run `npm pack` to produce
   `wdonray-analytics-core-<version>.tgz`.
2. Copy the new tarball here, replacing the old one:
   `vendor/wdonray-analytics-core-<version>.tgz`.
3. Update the `file:` reference in `package.json`:
   `"@wdonray/analytics-core": "file:vendor/wdonray-analytics-core-<version>.tgz"`.
4. Run `npm install` to update `package-lock.json`.
5. Delete the old tarball.

## Reversibility

If Amplify ever gains GitHub Packages auth (or the package goes public),
revert to a registry reference:

```json
"@wdonray/analytics-core": "^<version>"
```

plus an `.npmrc` with `@wdonray:registry=https://npm.pkg.github.com`
and `NODE_AUTH_TOKEN` wired in CI. Then delete this directory.
