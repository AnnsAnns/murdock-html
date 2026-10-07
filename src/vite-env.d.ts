/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MURDOCK_HTTP_BASE_URL?: string;
  readonly VITE_MURDOCK_WS_URL?: string;
  readonly VITE_GITHUB_REPO?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_GITHUB_GATEKEEPER_URL?: string;
  readonly VITE_GITHUB_REDIRECT_URI?: string;
  readonly VITE_GITHUB_SCOPE?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_ITEMS_DISPLAYED_STEP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
