import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

const POLISH_CITIES = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Łódź",
  "Poznań",
  "Gdańsk",
  "Szczecin",
  "Bydgoszcz",
  "Lublin",
  "Białystok"
];

const AdminDashboard = () => {
  const [email, setEmail] = useState("");
  const [assignedSpace, setAssignedSpace] = useState("A1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const createUserAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const randomCity =
      POLISH_CITIES[Math.floor(Math.random() * POLISH_CITIES.length)];

    try {
      // 🔎 Check if email is already invited
      const q = query(
        collection(db, "pending_users"),
        where("email", "==", normalizedEmail)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setMessage("Error: This email has already been invited.");
        setLoading(false);
        return;
      }

      // 📨 Create pending user invite
      await addDoc(collection(db, "pending_users"), {
        email: normalizedEmail,
        level: assignedSpace,
        cityName: randomCity,
        role: "user",
        streak: 0,
        vocabCount: 0,
        permissions: ["read", "write"],
        claimed: false,
        createdAt: serverTimestamp()
      });

      setMessage(
        `Invite sent! ${normalizedEmail} assigned to ${randomCity} (${assignedSpace}).`
      );
      setEmail("");
    } catch (error) {
      console.error(error);
      setMessage("Error: Failed to create invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
          Lebwpolish Manager
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Invite User */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Invite New Student
          </h2>

          <form onSubmit={createUserAccount} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-600">
                User Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-600">
                Assign Level
              </label>
              <select
                value={assignedSpace}
                onChange={(e) => setAssignedSpace(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg rounded-lg bg-white"
              >
                <option value="A1">A1 – Beginner</option>
                <option value="B1">B1 – Intermediate</option>
                <option value="C1">C1 – Advanced</option>
              </select>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                loading
                  ? "bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
            >
              {loading ? "Creating Invite..." : "Generate Polish Identity"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded text-sm ${
                message.startsWith("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Permissions Info */}
        <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300">
          <h3 className="font-bold text-slate-700 mb-2">Permissions Guide</h3>
          <ul className="text-sm text-slate-600 space-y-3">
            <li>
              <strong className="text-blue-600">READ:</strong> Access their level
              space
            </li>
            <li>
              <strong className="text-green-600">WRITE:</strong> Post progress
              and vocabulary
            </li>
            <li>
              <strong className="text-red-600">BRUTAL:</strong> Enable strict
              feedback
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
