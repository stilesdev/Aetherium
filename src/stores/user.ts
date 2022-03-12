import { getAuth, signInWithEmailAndPassword, type AuthError } from 'firebase/auth'
import { defineStore } from 'pinia'

export const useUser = defineStore('user', {
    state: () => ({
        userId: undefined as string | undefined,
    }),
    getters: {
        isLoggedIn: (state) => state.userId !== undefined,
    },
    actions: {
        login(email: string, password: string) {
            return new Promise<void>((resolve, reject) => {
                signInWithEmailAndPassword(getAuth(), email, password)
                    .then(() => {
                        resolve()
                    })
                    .catch((error: AuthError) => {
                        let errorString = ''

                        switch (error.code) {
                            case 'auth/too-many-requests':
                                errorString = 'Too many login attempts. Wait a while and try again.'
                                break
                            case 'auth/user-not-found':
                            case 'auth/wrong-password':
                            case 'auth/invalid-email':
                            case 'auth/user-disabled':
                                errorString = 'Invalid username or password.'
                                break
                            default:
                                errorString = 'Unknown error'
                                console.error(`${error.code}: ${error.message}`)
                                break
                        }

                        reject(errorString)
                    })
            })
        },
        logout() {
            return new Promise<void>((resolve, reject) => {
                getAuth()
                    .signOut()
                    .then(() => {
                        resolve()
                    })
                    .catch((error) => {
                        reject(error.message)
                    })
            })
        },
    },
})
