/*
API keys for Firebase are different from typical API keys

Unlike how API keys are typically used, API keys for Firebase services
are not used to control access to backend resources; that can only be
done with Firebase Security Rules (to control which users can access 
resources) and App Check (to control which apps can access resources).

Usually, you need to fastidiously guard API keys (for example, by using
a vault service or setting the keys as environment variables); however,
API keys for Firebase services are ok to include in code or checked-in
config files.
*/

export default {
    production: {
        apiKey: 'AIzaSyDmgBumGJVqzA2a93ELhP6-rqc-CoOvp6c',
        authDomain: 'aetherium-3cedf.firebaseapp.com',
        databaseURL: 'https://aetherium-3cedf.firebaseio.com',
        projectId: 'aetherium-3cedf',
        storageBucket: 'aetherium-3cedf.appspot.com',
        messagingSenderId: '837735335141',
        appId: '1:837735335141:web:356e2e768081b11da3800c',
    },
    development: {
        apiKey: 'AIzaSyD1xjSGWG3vUI1BBf3us07b0XJFZfuSMaE',
        authDomain: 'aetherium-development.firebaseapp.com',
        databaseURL: 'https://aetherium-development.firebaseio.com',
        projectId: 'aetherium-development',
        storageBucket: 'aetherium-development.appspot.com',
        messagingSenderId: '666697626864',
        appId: '1:666697626864:web:267987dc2b053814',
    },
    reCaptchaV3SiteKey: '6Ldwr6IeAAAAAOlegz_Skk3NngIbR4ScABgRuQKJ',
}
