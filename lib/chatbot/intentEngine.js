const INTENT_KEYWORDS = {
  greeting: ["hi", "hello", "hey", "namaste", "help", "what can you do", "assist"],
  shop: ["shop", "buy", "product", "accessories", "cart", "purchase", "toys", "food", "treats"],
  track: ["track", "tracking", "where is my order", "delivery status", "order status", "grooming status", "live tracking"],
  book_vet: ["vet", "doctor", "clinic", "vaccine", "vaccination", "checkup", "appointment", "sick", "medicine"],
  book_groomer: ["groom", "grooming", "bath", "trim", "spa", "haircut", "wash", "clean", "nail trim"],
  subscription: ["subscription", "premium", "plan", "membership", "upgrade", "benefits"],
  payment: ["payment", "pay", "bill", "invoice", "upi", "card", "refund", "charged", "checkout"],
  dashboard: ["dashboard", "my orders", "my bookings", "my account", "notifications", "profile"],
  support_chat: ["support", "customer care", "contact", "chat", "help me", "agent", "message"],
  food_help: ["food", "diet", "feed", "meal", "kibble", "cat food", "dog food", "best food"],
  symptom_help: ["stomach pain", "vomit", "vomiting", "diarrhea", "fever", "itching", "cough", "cold", "pain", "sick", "medicine"],
  exercise_help: ["exercise", "activity", "walk", "play", "fitness", "weight", "indoor games", "training"],
  thanks: ["thanks", "thank you", "got it", "perfect", "bye"]
};

function normalize(text = "") {
  return String(text).trim().toLowerCase();
}

function extractPetType(text) {
  const value = normalize(text);
  if (value.includes("cat") || value.includes("kitten")) return "cats";
  if (value.includes("dog") || value.includes("puppy")) return "dogs";
  return null;
}

function extractRating(text) {
  const value = normalize(text);
  const match = value.match(/([0-5](?:\.\d)?)/);
  if (!match) return null;
  const rating = Number(match[1]);
  if (Number.isNaN(rating)) return null;
  return Math.max(0, Math.min(5, rating));
}

function extractCity(text) {
  const value = normalize(text);
  if (value.includes("chennai")) return "Chennai";
  if (value.includes("bangalore") || value.includes("bengaluru")) return "Bangalore";
  return null;
}

function extractVetSpecialization(text) {
  const value = normalize(text);
  if (value.includes("dental")) return "Dental";
  if (value.includes("emergency")) return "Emergency";
  if (value.includes("surgery") || value.includes("surgical")) return "Surgery";
  if (value.includes("general")) return "General Veterinary";
  return null;
}

function scoreIntent(value, keywords) {
  return keywords.reduce((sum, keyword) => {
    if (value === keyword) return sum + 4;
    if (value.includes(keyword)) return sum + (keyword.includes(" ") ? 3 : 2);
    return sum;
  }, 0);
}

export function detectIntent(text, context = {}) {
  const value = normalize(text);
  if (!value) return { intent: "fallback", score: 0, entities: {} };

  let bestIntent = "fallback";
  let bestScore = 0;

  Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
    const score = scoreIntent(value, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  const entities = {
    petType: extractPetType(value),
    minRating: extractRating(value),
    city: extractCity(value),
    specialization: extractVetSpecialization(value),
  };

  if (value.includes("best groomer") || value.includes("best spa") || value.includes("groomer") || value.includes("spa")) {
    bestIntent = "book_groomer";
    bestScore += 3;
  }

  if (value.includes("best vet") || value.includes("best doctor") || value.includes("doctor") || value.includes("clinic")) {
    bestIntent = "book_vet";
    bestScore += 3;
  }

  if (value.includes("food") && entities.petType) {
    bestIntent = "food_help";
    bestScore += 4;
  }

  if ((value.includes("exercise") || value.includes("walk") || value.includes("play")) && entities.petType) {
    bestIntent = "exercise_help";
    bestScore += 4;
  }

  if (context.activeOrderCount || context.activeGroomingCount) {
    if (bestIntent === "track") bestScore += 2;
  }

  if (bestScore <= 0) return { intent: "fallback", score: 0, entities };
  return { intent: bestIntent, score: bestScore, entities };
}
