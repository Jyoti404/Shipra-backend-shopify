import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./shipra-fashion-firebase-adminsdk-fbsvc-4d2ab74a16.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
