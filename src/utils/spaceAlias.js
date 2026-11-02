// A stable, friendly public nickname for Writing Space. No email or profile name is used.
// This is pseudonymity, not cryptographic anonymity: Firestore still retains uid for ownership.
const PLACES = ['Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Gdynia', 'Toruń', 'Lublin', 'Sopot', 'Zakopane', 'Łódź', 'Opole', 'Szczecin', 'Rzeszów', 'Białystok', 'Olsztyn', 'Katowice'];
const FRUITS = ['Jabłko', 'Gruszka', 'Śliwka', 'Wiśnia', 'Malina', 'Truskawka', 'Jagoda', 'Borówka', 'Porzeczka', 'Brzoskwinia', 'Morela', 'Czereśnia'];
const WORDS = [...PLACES, ...FRUITS];
export function spaceAlias(uid) {
  if (!uid || typeof uid !== 'string') return 'Polski Pisarz';
  let hash = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    hash ^= uid.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = hash >>> 0;
  return `${WORDS[unsigned % WORDS.length]} ${String((unsigned % 900) + 100)}`;
}
