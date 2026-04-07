/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CK_EDITOR_LICENSE_KEY: string;
  readonly VITE_TINY_CLOUD_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
