import 'bootstrap/dist/js/bootstrap';
import * as firebase from 'firebase';
import 'jquery';
import Vue from 'vue';

import * as config from '../firebase.config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './style.css';

$(() => {
    window.vApp = new Vue({
        el: '#app',
        data: {
            message: 'Firebase SDK Loading&hellip;'
        }
    });

    try {
        firebase.initializeApp(config);
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        vApp.message = `Firebase SDK loaded with ${features.join(', ')}`;
    } catch (e) {
        console.error(e);
        vApp.message = 'Error loading the Firebase SDK, check the console.';
    }
});