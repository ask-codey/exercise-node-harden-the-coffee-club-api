// Bean There Coffee Club's roasts and members, kept in memory. Ready to use: you don't need to change this file.
// Passwords are never stored, only their bcrypt hashes. For trying the API, each member's test password is
// <first name in lower case>-test-password, such as dana-test-password.
// resetData() puts every member back as they were; the tests call it before each test.
export const roasts = [
  { id: 1, name: "Morning Mist", origin: "Colombia", roast: "light" },
  { id: 2, name: "Night Owl", origin: "Sumatra", roast: "dark" },
  { id: 3, name: "Sunrise Blend", origin: "Ethiopia and Brazil", roast: "medium" },
];

const startingMembers = [
  {
    id: 1, name: "Dana", email: "dana@beanthere.example", role: "member", favoriteRoast: "Morning Mist", cupsLeft: 4,
    passwordHash: "$2b$10$64/ouq4wbdSyk.o1nnulneFBevRaK9xFZFwZA5.5RSs5HFZ2/2lwi",
  },
  {
    id: 2, name: "Marcus", email: "marcus@beanthere.example", role: "admin", favoriteRoast: "Night Owl", cupsLeft: 10,
    passwordHash: "$2b$10$dBgbQsQ/RuWH2l4r98r6NOXNi/Z6LFRV76tOPamkx1UYLAtZaEPBe",
  },
  {
    id: 3, name: "Lucia", email: "lucia@beanthere.example", role: "member", favoriteRoast: "Sunrise Blend", cupsLeft: 0,
    passwordHash: "$2b$10$uQYvG.TGv3fRI1O/6.qhlOqUnsx02fdF8A2tcs3kvcDBmEvnRTabC",
  },
];

export const members = startingMembers.map((member) => ({ ...member }));

export function resetData() {
  members.length = 0;
  members.push(...startingMembers.map((member) => ({ ...member })));
}

// A member as the API shows them: everything except the password hash.
export function publicMember(member) {
  const { passwordHash, ...rest } = member;
  return rest;
}
