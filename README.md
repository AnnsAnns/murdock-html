# murdock-html

The web UI for the [Murdock](https://ci.riot-os.org) continuous integration
server. A single-page app built with **Vite + React** and **vanilla CSS**
(native nesting, no CSS framework), styled after the Bort/Kaeru design language
and built around the two RIOT-OS brand colours (green `#40A687`, red `#BC202A`).
The palette follows the system light/dark preference (`prefers-color-scheme`).

It talks to the Murdock API at `ci.riot-os.org` and to the live status
WebSocket, and lets maintainers cancel, abort or restart jobs after signing in
with GitHub.

## Requirements

- Node.js 20+ and npm.

## Development

```sh
npm install
npm run dev
```

The dev server prints a local URL (default <http://localhost:5173>). The API and
WebSocket bases are configured in `.env` (see `.env.example`).

## Build

```sh
npm run build     # output in dist/
npm run preview   # serve the production build locally
```

`dist/` is a static bundle that can be served by any web server. Because the app
uses client-side routing, the server must fall back to `index.html` for unknown
paths.

## Tests and lint

```sh
npm test          # vitest + coverage (offline, fetch is mocked)
npm run lint      # eslint
```

## Configuration

All settings are Vite env vars (prefix `VITE_`), read from `.env`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_MURDOCK_HTTP_BASE_URL` | Murdock REST base URL | `https://ci.riot-os.org` |
| `VITE_MURDOCK_WS_URL` | Live status WebSocket | `wss://ci.riot-os.org/ws/status` |
| `VITE_GITHUB_REPO` | Repository the CI builds | `RIOT-OS/RIOT` |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth app client id (empty hides login) | — |
| `VITE_GITHUB_GATEKEEPER_URL` | OAuth gatekeeper base URL | `{api}/github` |
| `VITE_GITHUB_REDIRECT_URI` | OAuth redirect URI | `{origin}/` |
| `VITE_PRIVACY_URL` | Privacy policy link | riot-os.org |
| `VITE_ITEMS_DISPLAYED_STEP` | Jobs fetched per page | `25` |

### GitHub login

Maintainer actions (cancel / abort / restart) require a GitHub OAuth token,
which the API expects in the `authorization` header. The login uses the standard
OAuth code flow with a **gatekeeper** that exchanges the code for a token:

```
GET {VITE_GITHUB_GATEKEEPER_URL}/authenticate/{code}  ->  { "token": "..." }
```

The gatekeeper URL is configurable; deploy one (for example
[prose/gatekeeper](https://github.com/prose/gatekeeper)) and register
`VITE_GITHUB_REDIRECT_URI` as the OAuth app callback. The GitHub client id and
secret live with the gatekeeper, never in this app. Set `VITE_GITHUB_CLIENT_ID`
to enable the login button.

## Project layout

```
src/
  api/        REST client, endpoints, query <-> URL serialisation
  auth/       GitHub OAuth context and helpers
  components/ presentational UI (job list/rows, tabs, results, toasts, ...)
  hooks/      WebSocket, document title
  pages/      routed pages (job list, job detail, application results)
  styles/     tokens.css, base.css, components.css (nested CSS)
  utils/      formatting and job helpers
```

## License

Apache-2.0, see [LICENSE](LICENSE).
