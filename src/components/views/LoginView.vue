<script lang="ts" setup>
    import { computed, ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useUser } from '@/stores/user'

    const router = useRouter()
    const user = useUser()

    const email = ref('')
    const password = ref('')
    const loginError = ref('')

    const isLoggedIn = computed(() => user.isLoggedIn)

    watch(isLoggedIn, () => {
        if (isLoggedIn.value) {
            router.push('/')
        }
    })

    const submit = () => {
        user.login(email.value, password.value).catch((errorMessage: string) => {
            loginError.value = errorMessage
        })
    }
</script>

<template>
    <div id="app">
        <div class="container">
            <div class="login">
                <form @submit.prevent="submit">
                    <div class="form-group">
                        <label for="emailInput">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-envelope" /></span>
                            <input
                                id="emailInput"
                                v-model="email"
                                type="email"
                                class="form-control"
                                placeholder="Email Address"
                                autocomplete="email"
                            >
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="passwordInput">Password</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-lock" /></span>
                            <input
                                id="passwordInput"
                                v-model="password"
                                type="password"
                                class="form-control"
                                placeholder="Password"
                                autocomplete="current-password"
                            >
                        </div>
                    </div>
                    <div v-if="loginError" class="alert alert-danger alert-dismissible" role="alert">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="loginError = ''">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <strong>Error:</strong> {{ loginError }}
                    </div>
                    <button type="submit" class="btn btn-default">
                        Login
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

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
