const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = 3000;

// Firebase Admin Setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codebygs-4265d-default-rtdb.firebaseio.com/",
});

const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());

// Sign Up
app.post("/signup", async (req, res) => {
  const { email, password, name,phone,country} = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phone,
      country,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
    });

    res.status(200).send({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

async function checkFirestoreConnection() {
  try {
    await db.collection("test").limit(1).get();
    console.log("✅ Firestore connected successfully");
  } catch (error) {
    console.error("❌ Firestore connection failed:", error.message);
  }
}

checkFirestoreConnection();


// Sign In - Just validate if user exists
app.post("/business", async (req, res) => {
  const {email} = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log(user,email);
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set(
  {
   business: req.body
  },
  { merge: true }          // IMPORTANT: Prevents overwriting
);
    res.status(200).send({ message: "User found", uid: user.uid });
  } catch (error) {
    res.status(404).send({ error: "User not found" });
  }
});

app.post("/custom", async (req, res) => {
  const {email} = req.body

  try {
    const user = await admin.auth().getUserByEmail(email);
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set(
  {
   custom: req.body
  },
  { merge: true }          
);
    res.status(200).send({ message: "User found", uid: user.uid });
  } catch (error) {
    res.status(404).send({ error: "User not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
