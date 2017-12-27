import 'bootstrap/dist/js/bootstrap';
import * as $ from 'jquery';
import Vue from 'vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'
import './style.css';

import Store from './store/Store';
import Aetherium from './components/Aetherium.vue';

$(() => {
    window.firebase = require('firebase'); // For testing purposes in browser window only
    window.vApp = new Vue({
        el: '#app',
        render: h => h(Aetherium),
        store: Store
    });
});