import { useAuth } from "../context/useAuth";

const DAY_MS = 1000 * 60 * 60 * 24;

export default function Profile() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow text-center">
        <h2 className="text-xl font-bold">Profile not ready</h2>
        <p className="text-gray-500 mt-2">
          Your account is being prepared. Please check back shortly.
        </p>
      </div>
    );
  }

  // ✅ Pure calculation based only on props/state
  const lastWriteDate = profile.lastWrite?.toDate?.();
  const diffDays = lastWriteDate
    ? Math.floor((new Date().getTime() - lastWriteDate.getTime()) / DAY_MS)
    : 0;

  const isBroken = diffDays > 1;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-2xl text-center">
      <h2 className="text-3xl font-bold mb-2">{profile.cityName}</h2>

      <p className="text-gray-500 mb-6 uppercase tracking-widest">
        Level: {profile.level}
      </p>

      <div
        className={`p-6 rounded-lg ${
          isBroken ? "bg-black text-white" : "bg-green-100 text-green-800"
        }`}
      >
        {isBroken ? (
          <>
            <h3 className="text-2xl font-black italic">BRUTAL ALERT!</h3>
            <p>
              You missed {diffDays} days. Your Polish is getting rusty. WRITE NOW.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold">
              STREAK: {profile.streak ?? 0} DAYS 🔥
            </h3>
            <p>Good job! Keep the momentum going.</p>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-left">
        <div className="p-4 border rounded">
          <p className="text-xs text-gray-400">VOCABULARY</p>
          <p className="text-2xl font-bold">{profile.vocabCount ?? 0}</p>
        </div>

        <div className="p-4 border rounded">
          <p className="text-xs text-gray-400">RANK</p>
          <p className="text-2xl font-bold font-serif italic">
            Mieszczanin
          </p>
        </div>
      </div>
    </div>
  );
}
