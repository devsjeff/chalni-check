import type { RelationshipStatus } from "@/types";

export type HusbandCard = {
  id: string;
  title: string;
  emoji: string;
  husband: string;
  reaction: string;
};

export const HUSBAND_CARDS: HusbandCard[] = [
  {
    id: "anniversary",
    title: "Anniversary Bhool Gaya",
    emoji: "🎭",
    husband: "Wait, aaj anniversary tha?! Main toh cricket dekh raha tha...",
    reaction: "Dekha? Yeh hai shaadi ka sach! 😂",
  },
  {
    id: "chand",
    title: "Chand Dekhne Ka Drama",
    emoji: "🌝",
    husband: "Tum chand dekh rahi ho? Main Netflix dekhta hoon...",
    reaction: "At least honest hai! 💀",
  },
  {
    id: "chalni",
    title: "Chalni Se Dekho",
    emoji: "🪞",
    husband: "Chalni se dekhogi toh bhi yahi dikhunga baby!",
    reaction: "Savage! 🔥",
  },
  {
    id: "gift",
    title: "Gift Kya Laaye?",
    emoji: "🎁",
    husband: "Gift? Umm... ₹20 hai, chai pi lo!",
    reaction: "At least UPI ke liye ready hai! 😂",
  },
];

const CAMERA_DARE = "Ab asli test hoga. Camera on karne ki himmat hai? 👀";

export function statusReaction(name: string, status: RelationshipStatus): string {
  switch (status) {
    case "single":
      return `Single? Best, ${name}! Aaj hum tumhara fake husband banate hain! 😂💍`;
    case "complicated":
      return `Complicated? Matlab drama guaranteed, ${name}! 🍿`;
    case "situationship":
      return `Situationship?! Bestie ${name}, delulu is NOT the solulu! 😭`;
    case "taken":
      return `Taken? Flex toh karna banta hai, ${name}! 💅`;
  }
}

export function roastLines(name: string, status: RelationshipStatus): string[] {
  switch (status) {
    case "single":
      return [
        `${name} ji, Karwa Chauth ka naam suna hai ya sirf Zomato ka time yaad hai? 😂`,
        "Chand ka wait karoge ya pehle Swiggy check karoge? 🌝",
        "Single ho toh samose ke saath loyalty nibhao! Best relationship! 🥟",
        "No cap, samosa kabhi ghost nahi karta. 😌",
        CAMERA_DARE,
      ];
    case "taken":
      return [
        "Taken ho? Toh phir asli test aata hai... 👀",
        `${name} ji, partner ke liye vrat rakhti/rakhte ho? Ya bas Insta story ke liye? 😂`,
        "Chand ko dekhna zaroori hai... ya phone flashlight se kaam chal jayega? 💀",
        "It's giving... loyal, ya it's giving... low battery? 🔋",
        CAMERA_DARE,
      ];
    case "situationship":
      return [
        `${name} ji, situationship mein vrat? Bold choice! 💅`,
        "Chand dekh ke text karoge? Delulu much? 😂",
        "Seen pe chhod denge ya double tick pe atak jaoge? 👀",
        "It's giving... Karwa Chauth energy, with a side of confusion. ✨",
        CAMERA_DARE,
      ];
    case "complicated":
      return [
        `${name} ji, complicated relationship mein Karwa Chauth? Full drama! 🍿`,
        "Chand ki jagah telescope se dekhoge toh better hai! 🔭",
        "Plot twist ready hai. Interval mein popcorn le aao. 😌",
        "Bestie, complicated ho, par smile simple rakh lo. ❤️",
        CAMERA_DARE,
      ];
  }
}

const TITLES: Record<RelationshipStatus, string[]> = {
  single: [
    "Certified Chand Observer",
    "Single But Slaying",
    "Fake Husband Survivor",
    "Samosa Loyalty Award",
    "Moonlight MVP",
  ],
  taken: [
    "Certified Chand Observer",
    "Official Chand Co-Star",
    "Loyalty Poster Child",
    "Patience Pro Max",
    "Digital Vrat Champion",
  ],
  situationship: [
    "Certified Chand Observer",
    "Situationship Scholar",
    "Certified Delulu Icon",
    "Moonlight MVP",
    "Swiggy Survivor",
  ],
  complicated: [
    "Certified Chand Observer",
    "Plot Twist Professional",
    "Drama Popcorn Captain",
    "Patience Pro Max",
    "Digital Vrat Champion",
  ],
};

export function pickTitle(status: RelationshipStatus): string {
  const pool = TITLES[status];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? "Certified Chand Observer";
}

export const STATUS_OPTIONS: {
  id: RelationshipStatus;
  label: string;
  hint: string;
}[] = [
  {
    id: "single",
    label: "Single",
    hint: "Ready to mingle... with samosas",
  },
  {
    id: "complicated",
    label: "Complicated",
    hint: "Plot thick hai, popcorn ready hai",
  },
  {
    id: "situationship",
    label: "Situationship",
    hint: "Delulu is the solulu",
  },
  {
    id: "taken",
    label: "Taken",
    hint: "Flex kar rahe ho?",
  },
];
