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

<script lang="ts">
    import Vue from 'vue'
    import { Component, Watch } from 'vue-property-decorator'
    import firebase from 'firebase/app'
    import 'firebase/auth'

    @Component
    export default class Login extends Vue {
        public email = ''
        public password = ''
        public loginError = ''

        get isLoggedIn(): boolean {
            return this.$store.getters.isLoggedIn
        }

        @Watch('isLoggedIn')
        public watchIsLoggedIn() {
            if (this.isLoggedIn) {
                this.$router.push('/')
            }
        }

        public submit(): void {
            firebase.auth()
                .signInWithEmailAndPassword(this.email, this.password)
                .catch((error: firebase.auth.Error) => {
                    switch (error.code) {
                        case 'auth/too-many-requests':
                            this.loginError = 'Too many login attempts. Wait a while and try again.'
                            break
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                        case 'auth/invalid-email':
                        case 'auth/user-disabled':
                            this.loginError = 'Invalid username or password.'
                            break
                        default:
                            this.loginError = 'Unknown error'
                            console.error(`${error.code}: ${error.message}`)
                            break
                    }
                })
        }
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
