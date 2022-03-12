import { type FirebaseApp, initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import type { Plugin } from 'vue'
import firebaseConfig from '@/../firebase.config'

export const createFirebase = (): Plugin => ({
    install: (app) => {
        let firebaseApp: FirebaseApp

        if (import.meta.env.PROD) {
            firebaseApp = initializeApp(firebaseConfig.production)
        } else {
            firebaseApp = initializeApp(firebaseConfig.development)
        }

        if (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
            console.log('[app-check]', 'initializing app-check with debug token: ' + import.meta.env.VITE_APPCHECK_DEBUG_TOKEN)
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
        }
        initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaV3Provider(firebaseConfig.reCaptchaV3SiteKey),
        })

        app.provide('firebaseApp', firebaseApp)
    },
})
