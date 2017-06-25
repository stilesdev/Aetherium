import * as firebase from 'firebase';
import * as $ from 'jquery';

import './style.css';

$(() => {
    let config = require('../firebase.config.js');

    try {
        firebase.initializeApp(config);
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        $('#load').html(`Firebase SDK loaded with ${features.join(', ')}`);
    } catch (e) {
        console.error(e);
        $('#load').html('Error loading the Firebase SDK, check the console.');
    }
});