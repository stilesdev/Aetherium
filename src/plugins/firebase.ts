import { type FirebaseApp, initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { Pinia } from 'pinia'
import type { Plugin } from 'vue'
import firebaseConfig from '@/../firebase.config'
import { getDatabase, get, ref, set } from 'firebase/database'
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
            console.log('[app-check]', 'initializing app-check with debug token: ' + import.meta.env.VITE_APPCHECK_DEBUG_TOKEN)
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN
        }
        initializeAppCheck(firebaseApp, {
            provider: new ReCaptchaV3Provider(firebaseConfig.reCaptchaV3SiteKey),
        })

        onAuthStateChanged(getAuth(firebaseApp), (firebaseUser) => {
            const db = getDatabase(firebaseApp)
            const user = useUser(pinia)

            if (firebaseUser) {
                // TODO: refactor this initial profile creation to a separate area?
                const userRef = ref(db, `users/${firebaseUser.uid}`)
                get(userRef).then((snapshot) => {
                    if (!snapshot.exists()) {
                        set(userRef, {
                            currentPuzzle: '333',
                            email: firebaseUser.email,
                            options: {
                                showTimer: true,
                                timerTrigger: 'spacebar',
                                holdToStart: true,
                                useInspection: true,
                            },
                        })
                    }

                    user.userId = firebaseUser.uid
                })
            } else {
                user.userId = undefined
            }
        })

        app.provide('firebaseApp', firebaseApp)
    },
})
