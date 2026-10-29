// src/lib/Activatestudent.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";

/**
 * Activates an invited student:
 *  1. Verifies email + access key against `pending_users`
 *  2. Creates the Firebase Auth account (access key = password, same as Login)
 *  3. In ONE atomic batch: creates `users/{uid}` and deletes the `pending_users` doc
 *
 * Safe to retry: if the Auth account already exists with the same key (e.g. a
 * previous attempt failed half-way), it signs in and finishes the move.
 */
export async function activateStudent(auth, db, email, key) {
  // 1. Verify the invite
  const q = query(collection(db, "pending_users"), where("email", "==", email), where("passcode", "==", key));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw Object.assign(new Error("Invalid email or access key."), {
      code: "app/invalid-key"
    });
  }
  const pendingDoc = snap.docs[0];

  // 2. Create the Auth account (or recover if it already exists with this key)
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, email, key);
  } catch (err) {
    if (err.code !== "auth/email-already-in-use") throw err;
    try {
      cred = await signInWithEmailAndPassword(auth, email, key);
    } catch {
      // Account exists but with a different password
      throw Object.assign(new Error("Account exists with a different key."), {
        code: "auth/email-already-in-use"
      });
    }
  }

  // 3. Move pending -> active atomically (never store the passcode in `users`)
  const {
    passcode,
    ...profile
  } = pendingDoc.data();
  const batch = writeBatch(db);
  batch.set(doc(db, "users", cred.user.uid), {
    ...profile,
    email,
    uid: cred.user.uid,
    status: "active",
    claimed: true,
    activatedAt: serverTimestamp()
  }, {
    merge: true
  });
  batch.delete(pendingDoc.ref);
  await batch.commit();
  return cred.user;
}
