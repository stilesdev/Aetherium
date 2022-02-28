<template>
    <div id="app">
        <div class="container">
            <div class="login">
                <form @submit.prevent="submit">
                    <div class="form-group">
                        <label for="emailInput">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                            <input type="email" class="form-control" id="emailInput" placeholder="Email Address" autocomplete="email" v-model="email" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="passwordInput">Password</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                            <input type="password" class="form-control" id="passwordInput" placeholder="Password" autocomplete="current-password" v-model="password" />
                        </div>
                    </div>
                    <div v-if="loginError" class="alert alert-danger alert-dismissible" role="alert">
                        <button @click="loginError = ''" type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <strong>Error:</strong> {{ loginError }}
                    </div>
                    <button class="btn btn-default">Login</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'
    import { AuthError, getAuth, signInWithEmailAndPassword } from 'firebase/auth'

    const store = useStore()
    const router = useRouter()

    const email = ref('')
    const password = ref('')
    const loginError = ref('')

    const isLoggedIn = computed<boolean>(() => store.getters.isLoggedIn)

    watch(isLoggedIn, () => {
        if (isLoggedIn.value) {
            router.push('/')
        }
    })

    const submit = () => {
        signInWithEmailAndPassword(getAuth(), email.value, password.value).catch((error: AuthError) => {
            switch (error.code) {
                case 'auth/too-many-requests':
                    loginError.value = 'Too many login attempts. Wait a while and try again.'
                    break
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-email':
                case 'auth/user-disabled':
                    loginError.value = 'Invalid username or password.'
                    break
                default:
                    loginError.value = 'Unknown error'
                    console.error(`${error.code}: ${error.message}`)
                    break
            }
        })
    }
</script>

<style>
    .login {
        margin: auto;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 50%;
        height: 50%;
        min-width: 300px;
        max-width: 400px;
        padding: 40px;
    }
</style>
