// src/pages/Signup.jsx
import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Check if Admin has pre-invited this email
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError("This email hasn't been invited by an Admin yet!");
      return;
    }

    try {
      // 2. Create the Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Link the Auth UID to the Firestore document created by Admin
      const userDocId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, "users", userDocId), {
        uid: user.uid,
        status: "active"
      });

      alert("Welcome to Poland! Your identity is now active.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSignup} className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md border-t-4 border-red-600">
        <h2 className="text-2xl font-bold mb-2">Claim Your Polish Identity</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter the email your admin used to invite you.</p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <input type="email" placeholder="Email Address" className="w-full p-3 mb-4 border rounded-lg" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Choose a Password" className="w-full p-3 mb-6 border rounded-lg" onChange={e => setPassword(e.target.value)} required />
        
        <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition">
          Join Lebwpolish
        </button>
      </form>
    </div>
  );
}