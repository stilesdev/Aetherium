import 'bootstrap/dist/js/bootstrap';
import * as firebase from 'firebase';
import 'jquery';
import Vue from 'vue';

import * as config from '../firebase.config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './style.css';
import Aetherium from './modules/Aetherium.js';

$(() => {
    window.vApp = new Vue({
        el: '#app',
        data: {
            aetherium: null,
            puzzles: null,
            ui: {
                activeTab: 'timer',
                emailField: '',
                passwordField: ''
            }
        },
        methods: {
            emailLogin: function(event) {
                firebase.auth().signInWithEmailAndPassword(vApp.ui.emailField, vApp.ui.passwordField).catch(function (error) {
                    alert(error.message);
                })
            },
            logout: function(event) {
                firebase.auth().signOut().then(() => {

                }).catch((error) => {
                    alert(error.message);
                })
            },
            runImport: function(event) {

            },
            runExport: function(event) {

            }
        }
    });

    try {
        firebase.initializeApp(config);
    } catch (e) {
        console.error(e);
    }

    vApp.aetherium = new Aetherium();

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            vApp.aetherium.user = user;
            vApp.aetherium.initUserListeners();
        } else {
            vApp.aetherium.detachListeners();
            vApp.aetherium.user = null;
        }
    })
});