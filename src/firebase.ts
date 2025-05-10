// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// These are public keys so its ok to expose them :) maybe hahah
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
const app = getApps().length ===0 ? initializeApp(firebaseConfig): getApp(); // here we are initalizing app for first-time of already intialized then we get it so to prevent several firebase instances which can cause unexpected issues
const auth = getAuth(app);
auth.useDeviceLanguage(); // this is to set the language of the auth to the device language
auth.useDeviceLanguage(); // this is to set the language of the auth to the device language
export { app, auth};
