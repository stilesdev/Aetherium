# Aetherium

A web-based twisty puzzle timer with real-time syncing of times and stats across devices.

## Development Setup ##

This project relies on [Firebase](https://firebase.google.com) Authentication, Realtime Database, and Hosting.
To run this project, you will need to first create a project in the Firebase console.

NodeJS must be installed on your local machine in order to build, run, and deploy this project to Firebase Hosting.

Clone the GitHub repository, then perform the following steps to get a development server up and running:

- `npm install`
- `npm install -g firebase-tools`
- `firebase login`, and follow the directions to get signed in
- `firebase use --add`, then select the project you created in the Firebase console
- Update `firebase.config.ts` with the details from your Firebase console.

Now you should be all set for future development. Run `npm run dev` to start Vite, and the local development server
will be started at [http://localhost:3000/](http://localhost:3000/).

Run `npm run build` to build the production version of the app into the `dist` directory. Run `npm run preview` to
start a local server from the production build on [http://localhost:5050/](http://localhost:5050/).

To deploy the current contents of the `dist` directory to Firebase Hosting, run `firebase deploy`. You will be provided
with the URL to your hosted site once the deploy is complete, and you can set up your own custom domains in the
Firebase console.
