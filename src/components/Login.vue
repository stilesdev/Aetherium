<template>
    <div id="app">
        <div class="container">
            <div class="login">
                <form v-on:submit="submit">
                    <div class="form-group">
                        <label for="emailInput">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>
                            <input type="email" class="form-control" id="emailInput" placeholder="Email Address" v-model="email">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="passwordInput">Password</label>
                        <div class="input-group">
                            <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                            <input type="password" class="form-control" id="passwordInput" placeholder="Password" v-model="password">
                        </div>
                    </div>
                    <button class="btn btn-default">Login</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import * as firebase from 'firebase';

    export default {
        data: function() {
            return {
                email: '',
                password: ''
            }
        },
        methods: {
            submit: function(event) {
                event.preventDefault();
                firebase.auth().signInWithEmailAndPassword(this.email, this.password);
            }
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