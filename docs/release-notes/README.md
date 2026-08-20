# Release Notes

Version history for IG Relations — Follower Analyzer.

| Version | Date | Notes |
|---|---|---|
| [1.1.0](v1.1.0.md) | 2026-08-20 | Multilingual support, list search, sidebar export, sync reliability fixes |
| [1.0.0](v1.0.0.md) | 2026-08-19 | Initial release |

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — incompatible changes to stored data or removal of features
- **MINOR** — new functionality, backwards compatible
- **PATCH** — bug fixes, backwards compatible

The version in `manifest.json` is the source of truth and must match the release tag.

## Release process

1. Update `version` in `manifest.json`.
2. Add a `docs/release-notes/vX.Y.Z.md` file and link it in the table above.
3. Update the version badge in `README.md`, `README.tr.md` and `README.es.md`.
4. Commit the changes.
5. Tag and push:

   ```bash
   git tag vX.Y.Z
   git push origin main --tags
   ```

Pushing a `v*` tag triggers the **Create Production Release** workflow
(`.github/workflows/release.yml`), which packages `src/` and `manifest.json`
into `ig-relations-analyzer.zip` and publishes a GitHub Release.
