## Development Setup ##

This project is built around [Firebase](https://firebase.google.com), and utilizes the Authentication, Realtime Database,
and Hosting products they provide. To run this project, you will need to first create a project in the Firebase console.

NodeJS must be installed on your local machine in order to build, run, and deploy this project to Firebase Hosting.

Clone the GitHub repository, then perform the following steps to get a development server up and running:

- `npm install`
- `npm install -g firebase-tools`
- `firebase login`, and follow the directions to get signed in
- `firebase use --add`, then select the project you created in the Firebase console
- Copy the `firebase.config.example.ts` file to `firebase.config.ts` and fill it with your details provided by Firebase

Now you should be all set for future development. Run `npm run watch` for Webpack to automatically build the bundle when
it detects changes to the source files. Run `npm run serve` to host a local development server, which is available at
[http://localhost:5000/](http://localhost:5000/).

When you are ready to deploy the project to Firebase hosting, simply run `firebase deploy`. You will be provided with
the URL to your hosted site once the deploy is complete, and you can set up your own custom domains in the Firebase
console.
