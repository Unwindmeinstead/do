// 15+ Card colors - rich saturated gradients for dark theme
export const CARD_COLORS = [
  { bg: "#e11d48", border: "#fb7185", name: "rose" },
  { bg: "#ea580c", border: "#fb923c", name: "orange" },
  { bg: "#d97706", border: "#fbbf24", name: "amber" },
  { bg: "#ca8a04", border: "#facc15", name: "yellow" },
  { bg: "#65a30d", border: "#a3e635", name: "lime" },
  { bg: "#059669", border: "#34d399", name: "emerald" },
  { bg: "#0d9488", border: "#2dd4bf", name: "teal" },
  { bg: "#0891b2", border: "#22d3ee", name: "cyan" },
  { bg: "#0284c7", border: "#38bdf8", name: "sky" },
  { bg: "#2563eb", border: "#60a5fa", name: "blue" },
  { bg: "#4f46e5", border: "#818cf8", name: "indigo" },
  { bg: "#7c3aed", border: "#a78bfa", name: "violet" },
  { bg: "#9333ea", border: "#c084fc", name: "purple" },
  { bg: "#c026d3", border: "#e879f9", name: "fuchsia" },
  { bg: "#db2777", border: "#f472b6", name: "pink" },
];

export const getRandomColor = () => {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
};

export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskType =
  | "work"
  | "personal"
  | "health"
  | "finance"
  | "learning"
  | "social"
  | "note"
  | "journal"
  | "idea"
  | "reminder"
  | "fitness"
  | "shopping"
  | "urgent"
  | "creative"
  | "general";

interface TaskCategory {
  priority: Priority;
  type: TaskType;
  label: string;
  extractedDate?: string;
  extractedTime?: string;
}

const TYPE_LABELS: Record<TaskType, string> = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  finance: "Finance",
  learning: "Learning",
  social: "Social",
  note: "Note",
  journal: "Journal",
  idea: "Idea",
  reminder: "Reminder",
  fitness: "Fitness",
  shopping: "Shopping",
  urgent: "Urgent",
  creative: "Creative",
  general: "Task",
};

/**
 * State of the art heuristic intent engine.
 * Uses a combination of pattern matching, keyword density, and contextual analysis.
 */
export const categorizeTask = (text: string): TaskCategory => {
  const input = text.toLowerCase().trim();
  if (!input) return { priority: "medium", type: "general", label: "Task" };

  const scores: Record<TaskType, number> = {
    work: 0, personal: 0, health: 0, finance: 0, learning: 0,
    social: 0, note: 0, journal: 0, idea: 0, reminder: 0,
    fitness: 0, shopping: 0, urgent: 0, creative: 0, general: 1
  };

  let priority: Priority = "medium";

  // --- 1. INTENT PATTERNS (Strongest signals) ---

  // JOURNAL: Personal reflection, "Today I...", sentiment words
  if (/^(today|i feel|i'm feeling|reflect|thought|journal|dear diary|meditation|gratitude)/.test(input) || input.split(' ').length > 12) {
    scores.journal += 12;
  }

  // REMINDER: Tactical, "Don't forget", "Remind me", time-based
  if (/^(remind|don't forget|reminder|alarm|check on|verify|notify|call)/.test(input)) {
    scores.reminder += 10;
  }

  // IDEA: Abstract, "What if", "Project idea", "Concept"
  if (/^(idea|concept|what if|imagine|maybe|could we|dream|blueprint|prototype)/.test(input)) {
    scores.idea += 10;
  }

  // URGENT: High pressure words at the start
  if (/^(urgent|asap|critical|emergency|now!|immediately|deadline|high priority)/.test(input) || input.includes('!!!')) {
    scores.urgent += 15;
    priority = "urgent";
  }

  // --- 2. KEYWORD CLUSTERS (Semantic signals) ---

  const CLUSTERS: Partial<Record<TaskType, string[]>> = {
    work: ["meeting", "email", "project", "client", "boss", "office", "report", "presentation", "slack", "zoom", "huddle", "standup", "sprint", "code", "debug", "deployment", "jira", "proposal", "contract", "agenda", "sync"],
    finance: ["pay", "bill", "bank", "money", "budget", "invest", "tax", "save", "expense", "invoice", "crypto", "stock", "portfolio", "dividend", "wallet", "rent", "mortgage", "subscription", "price", "transfer"],
    learning: ["learn", "study", "read", "course", "book", "research", "practice", "tutorial", "class", "lecture", "university", "assignment", "language", "skill", "podcast", "masterclass", "exam", "quiz"],
    social: ["call", "meet", "friend", "family", "party", "birthday", "gift", "visit", "dinner", "lunch", "date", "hangout", "wedding", "anniversary", "invite", "drinks", "coffee"],
    health: ["doctor", "medicine", "pill", "appointment", "dentist", "therapy", "psychologist", "clinic", "hospital", "sick", "pain", "sleep", "water", "meditation", "checkup"],
    fitness: ["gym", "exercise", "run", "workout", "yoga", "training", "cardio", "weights", "protein", "tracking", "calories", "marathon", "cycle", "swim", "athlete", "stretch", "lift"],
    shopping: ["buy", "shop", "groceries", "order", "amazon", "market", "store", "purchase", "item", "stock up", "restock", "cart"],
    creative: ["draw", "paint", "write", "music", "song", "design", "ui", "ux", "art", "photography", "video", "edit", "build", "craft", "woodworking", "garden", "sketch", "canvas", "lens", "creative"],
    personal: ["home", "clean", "organize", "laundry", "cook", "fix", "repair", "house", "apartment", "mail", "box", "package", "trash", "maintenance", "chores"],
    note: ["note:", "memo:", "remember:", "context:", "info:", "details:", "fact:", "reference"]
  };

  // Calculate scores based on cluster hits
  Object.entries(CLUSTERS).forEach(([type, keywords]) => {
    keywords.forEach(keyword => {
      if (input.includes(keyword)) {
        // Multiplier if it is a whole word match vs just a substring
        const isWordMatch = new RegExp(`\\b${keyword}\\b`).test(input);
        const isStart = input.startsWith(keyword);
        scores[type as TaskType] += isStart ? 6 : (isWordMatch ? 3 : 1);
      }
    });
  });

  // --- 3. PRIORITY DETECTION ---
  if (/(asap|urgent|immediately|today|now|deadline|critical)/.test(input)) priority = "urgent";
  else if (/(important|must|required|high priority|needed)/.test(input)) priority = "high";
  else if (/(later|someday|optional|maybe|could|whenever)/.test(input)) priority = "low";

  // --- 4. WINNER DETERMINATION ---
  let winner: TaskType = "general";
  let maxScore = 0.5; // Baseline threshold

  // Weighted victory: Specific categories (Creative, Finance, Health) get a slight boost over general ones
  const BOOSTS: Partial<Record<TaskType, number>> = {
    creative: 1.2,
    finance: 1.2,
    journal: 1.5,
    urgent: 1.5,
    idea: 1.3
  };

  Object.entries(scores).forEach(([type, score]) => {
    const finalScore = score * (BOOSTS[type as TaskType] || 1);
    if (finalScore > maxScore) {
      maxScore = finalScore;
      winner = type as TaskType;
    }
  });

  // --- 5. TEMPORAL EXTRACTION (For Reminders) ---
  let extractedDate: string | undefined;
  let extractedTime: string | undefined;

  if (["reminder", "general", "work", "fitness", "social"].includes(winner)) {
    // Basic date patterns
    const datePatterns = [
      { regex: /\btomorrow\b/i, label: "Tomorrow" },
      { regex: /\btoday\b/i, label: "Today" },
      { regex: /\bnext week\b/i, label: "Next Week" },
      { regex: /\bmonday\b/i, label: "Mon" },
      { regex: /\btuesday\b/i, label: "Tue" },
      { regex: /\bwednesday\b/i, label: "Wed" },
      { regex: /\bthursday\b/i, label: "Thu" },
      { regex: /\bfriday\b/i, label: "Fri" },
      { regex: /\bsaturday\b/i, label: "Sat" },
      { regex: /\bsunday\b/i, label: "Sun" },
    ];

    for (const pattern of datePatterns) {
      if (pattern.regex.test(input)) {
        extractedDate = pattern.label;
        break;
      }
    }

    // Basic time patterns: "at 5pm", "at 10:30", "at 5", "noon", "midnight"
    const timeMatch = input.match(/\bat\s+(\d{1,2}(:\d{2})?\s*(am|pm)?|noon|midnight)\b/i);
    if (timeMatch) {
      extractedTime = timeMatch[1].toUpperCase();
    } else {
      // Fallback: check just for "5pm" etc without "at"
      const simpleTimeMatch = input.match(/\b(\d{1,2}(:\d{2})?\s*(am|pm))\b/i);
      if (simpleTimeMatch) {
        extractedTime = simpleTimeMatch[1].toUpperCase();
      }
    }
  }

  return {
    priority,
    type: winner,
    label: TYPE_LABELS[winner],
    extractedDate,
    extractedTime
  };
};

export const TYPE_COLORS: Record<TaskType, string> = {
  work: "text-blue-400",
  personal: "text-purple-400",
  health: "text-emerald-400",
  finance: "text-amber-400",
  learning: "text-sky-400",
  social: "text-pink-400",
  note: "text-gray-400",
  journal: "text-indigo-400",
  idea: "text-yellow-400",
  reminder: "text-blue-400",
  fitness: "text-lime-400",
  shopping: "text-rose-400",
  urgent: "text-red-400",
  creative: "text-fuchsia-400",
  general: "text-white/70",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export const getPriorityFromText = (text: string): Priority => {
  if (!text.trim()) return "medium";
  return categorizeTask(text).priority;
};
