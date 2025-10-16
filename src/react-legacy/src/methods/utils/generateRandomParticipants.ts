import type { Participant } from "../../@types/types";

export interface GenerateRandomParticipantsOptions {
  member: string;
  coHost?: string;
  host: string;
  forChatBroadcast?: boolean;
}

// Export the type definition for the function
export type GenerateRandomParticipantsType = (options: GenerateRandomParticipantsOptions) => Participant[];

/**
 * Generates a list of random participants with specified options.
 *
 * @param {Object} options - The options for generating participants.
 * @param {string} options.member - The member to include in the participants list.
 * @param {string} [options.coHost=""] - The co-host to include in the participants list.
 * @param {string} options.host - The host to include in the participants list.
 * @param {boolean} [options.forChatBroadcast=false] - Whether the participants are for a chat broadcast.
 * @returns {Participant[]} An array of generated participants.
 *
 * @example
 * ```typescript
 * generateRandomParticipants({
 *   member: "Alice",
 *   coHost: "Bob",
 *   host: "Carol",
 *   forChatBroadcast: true,
 * });
 * // Returns an array of Participant objects, e.g., [{ name: "Alice", islevel: "1", muted: false, id: "0", audioID: "audio-0", videoID: "video-0" }, ...]
 * ```
 */

const generateRandomParticipants = (
  { member, coHost = "", host, forChatBroadcast = false }: GenerateRandomParticipantsOptions
): Participant[] => {
  const participants: Participant[] = [];
  let names: string[] = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Hank",
    "Ivy",
    "Jack",
    "Kate",
    "Liam",
    "Mia",
    "Nina",
    "Olivia",
    "Pete",
    "Quinn",
    "Rachel",
    "Steve",
    "Tina",
    "Ursula",
    "Vince",
    "Wendy",
    "Xander",
    "Yvonne",
    "Zack",
  ];

  // Limit names to 2 for chat broadcast
  if (forChatBroadcast) {
    names.splice(2);
  }

  // Place member, coHost, and host at the beginning if not already included
  if (!names.includes(member)) {
    names.unshift(member);
  }
  if (!names.includes(coHost) && !forChatBroadcast) {
    names.unshift(coHost);
  }
  if (!names.includes(host)) {
    names.unshift(host);
  }

  // Limit names to 2 for chat broadcast
  if (forChatBroadcast) {
    names.splice(2);
  }

  // Remove names of length 1 or less
  names = names.filter((name) => name.length > 1);

  // Shuffle the names array to ensure unique names for each participant
  const shuffledNames = [...names];
  for (let i = shuffledNames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const currentName = shuffledNames[i];
    const swapName = shuffledNames[j];

    if (currentName === undefined || swapName === undefined) {
      continue;
    }

    shuffledNames[i] = swapName;
    shuffledNames[j] = currentName;
  }

  let hasLevel2Participant = false;

  // Generate participant objects
  for (let i = 0; i < shuffledNames.length; i++) {
    const randomName = shuffledNames[i];
    if (!randomName) {
      continue;
    }
    const randomLevel = hasLevel2Participant
      ? "1"
      : randomName === host
      ? "2"
      : "1"; // Set islevel to '2' only once
    const randomMuted = forChatBroadcast ? true : Math.random() < 0.5; // Set muted to false for chat broadcast

    if (randomLevel === "2") {
      hasLevel2Participant = true;
    }

    participants.push({
      name: randomName,
      islevel: randomLevel,
      muted: randomMuted,
      id: i.toString(),
      audioID: `audio-${i}`,
      videoID: `video-${i}`,
    });
  }

  return participants;
};

export { generateRandomParticipants};
