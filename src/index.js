import 'bootstrap/dist/js/bootstrap';
import * as $ from 'jquery';
import Vue from 'vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './style.css';

import Store from './store/Store';
import Aetherium from './components/Aetherium.vue';

$(() => {
    /*
    window.vApp = new Vue({
        el: '#app',
        data: {
            aetherium: null,
            ui: {
                activeTab: 'timer',
                emailField: '',
                passwordField: '',
                puzzleSelection: 333,
                categorySelection: 'default'
            },
            options: {
                showTimer: true,
                timerTrigger: 'spacebar'
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

            },
            openOptionsModal: function() {
                $('#optionsModal').modal();
            },
            onOptionsModalSave: function() {
                vApp.aetherium.options.showTimer = vApp.options.showTimer;
                vApp.aetherium.options.timerTrigger = vApp.options.timerTrigger
            },
            onPuzzleModalOpen: function() {
                vApp.ui.puzzleSelection = vApp.aetherium.activePuzzle.key;
                vApp.ui.categorySelection = vApp.aetherium.activeCategory.key;
            },
            onPuzzleModalSave: function() {
                vApp.aetherium.setPuzzle(vApp.ui.puzzleSelection);
                vApp.aetherium.setCategory(vApp.ui.categorySelection);
            }
        },
        components: {
            'timer-view': Timer,
            'stats-view': Stats,
            'history-view': History
        }
    });
    */



    window.firebase = require('firebase'); // For testing purposes in browser window only
    window.vApp = new Vue({
        el: '#app',
        render: h => h(Aetherium),
        store: Store
    });
});