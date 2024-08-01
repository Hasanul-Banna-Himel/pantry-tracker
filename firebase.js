// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8uR3juQ244uQITQBrEtmBaXPhRcR_pOM",
  authDomain: "pantry-management-959c1.firebaseapp.com",
  projectId: "pantry-management-959c1",
  storageBucket: "pantry-management-959c1.appspot.com",
  messagingSenderId: "50854047453",
  appId: "1:50854047453:web:ffe8b38ff7f8f25d577534",
  measurementId: "G-PDHPNRHMXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export { firestore };