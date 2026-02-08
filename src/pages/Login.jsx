// src/pages/Login.jsx
import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, pass)
      .then(() => alert("Cześć! Welcome back."))
      .catch(err => alert(err.message));
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Lebwpolish Login</h2>
        <input type="email" placeholder="Email" className="w-full p-2 mb-4 border rounded" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Hasło" className="w-full p-2 mb-6 border rounded" onChange={e => setPass(e.target.value)} />
        <button className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">Zaloguj się</button>
      </form>
    </div>
  );
}