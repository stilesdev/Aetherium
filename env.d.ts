/// <reference types="vite/client" />

interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN: string | undefined
}

interface ImportMetaEnv {
    readonly VITE_APPCHECK_DEBUG_TOKEN: string | undefined
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
