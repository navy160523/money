import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBejIcQwYnvKuGSLchBMhYjZG1FG4pxdJs",
    authDomain: "money-b72e6.firebaseapp.com",
    projectId: "money-b72e6",
    storageBucket: "money-b72e6.firebasestorage.app",
    messagingSenderId: "814042038157",
    appId: "1:814042038157:web:46ef7334e673a0ca4d87c4",
    measurementId: "G-LXCS4DDBMZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

export { db, messaging, analytics };
