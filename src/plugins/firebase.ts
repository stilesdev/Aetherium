import { type FirebaseApp, initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { Pinia } from 'pinia'
import type { Plugin } from 'vue'
import firebaseConfig from '@/../firebase.config'
import { useDatabase } from '@/stores/database'
import { useDatabaseListener } from '@/stores/databaseListener'
import { useUser } from '@/stores/user'

export const createFirebase = (pinia: Pinia): Plugin => ({
    install: (app) => {
        let firebaseApp: FirebaseApp

        if (import.meta.env.PROD) {
            firebaseApp = initializeApp(firebaseConfig.production)
        } else {
            firebaseApp = initializeApp(firebaseConfig.development)
        }

        if (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
            console.log('[app-check]', `initializing app-check with debug token: ${import.meta.env.VITE_APPCHECK_DEBUG_TOKEN}`)
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
        }
        initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaV3Provider(firebaseConfig.reCaptchaV3SiteKey),
        })

        onAuthStateChanged(getAuth(firebaseApp), async (firebaseUser) => {
            const database = useDatabase(pinia)
            const databaseListener = useDatabaseListener(pinia)
            const user = useUser(pinia)

            if (firebaseUser && firebaseUser.email) {
                user.userId = firebaseUser.uid
                await database.createUserProfileIfNotExists(firebaseUser.email)
            } else {
                user.userId = undefined
            }

            databaseListener.setUpDatabaseOnAuthStateChanged()
        })

        app.provide('firebaseApp', firebaseApp)
    },
})
