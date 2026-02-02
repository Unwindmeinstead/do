// 15+ Card colors - rich saturated gradients for dark theme
export const CARD_COLORS = [
  { bg: "from-rose-500 to-pink-600", border: "border-rose-300/40", name: "rose" },
  { bg: "from-orange-500 to-red-600", border: "border-orange-300/40", name: "orange" },
  { bg: "from-amber-500 to-orange-600", border: "border-amber-300/40", name: "amber" },
  { bg: "from-yellow-500 to-amber-600", border: "border-yellow-300/40", name: "yellow" },
  { bg: "from-lime-500 to-green-600", border: "border-lime-300/40", name: "lime" },
  { bg: "from-emerald-500 to-green-600", border: "border-emerald-300/40", name: "emerald" },
  { bg: "from-teal-500 to-cyan-600", border: "border-teal-300/40", name: "teal" },
  { bg: "from-cyan-500 to-teal-600", border: "border-cyan-300/40", name: "cyan" },
  { bg: "from-sky-500 to-blue-600", border: "border-sky-300/40", name: "sky" },
  { bg: "from-blue-500 to-indigo-600", border: "border-blue-300/40", name: "blue" },
  { bg: "from-indigo-500 to-violet-600", border: "border-indigo-300/40", name: "indigo" },
  { bg: "from-violet-500 to-purple-600", border: "border-violet-300/40", name: "violet" },
  { bg: "from-purple-500 to-indigo-600", border: "border-purple-300/40", name: "purple" },
  { bg: "from-fuchsia-500 to-pink-600", border: "border-fuchsia-300/40", name: "fuchsia" },
  { bg: "from-pink-500 to-rose-600", border: "border-pink-300/40", name: "pink" },
];

export const getRandomColor = () => {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
};

// Priority keywords and categorization
export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskType = "work" | "personal" | "health" | "finance" | "learning" | "social" | "general";

interface TaskCategory {
  priority: Priority;
  type: TaskType;
  label: string;
}

const PRIORITY_KEYWORDS: Record<Priority, string[]> = {
  urgent: ["urgent", "asap", "emergency", "critical", "immediately", "now", "deadline", "today"],
  high: ["important", "priority", "must", "need", "required", "soon", "tomorrow"],
  medium: ["should", "want", "plan", "schedule", "week", "consider"],
  low: ["maybe", "someday", "idea", "later", "eventually", "optional", "could"],
};

const TYPE_KEYWORDS: Record<TaskType, string[]> = {
  work: ["work", "meeting", "email", "project", "client", "boss", "office", "report", "presentation", "deadline", "task"],
  personal: ["home", "clean", "organize", "buy", "fix", "repair", "laundry", "groceries", "cook"],
  health: ["gym", "exercise", "doctor", "medicine", "run", "workout", "sleep", "diet", "meditation", "yoga", "walk"],
  finance: ["pay", "bill", "bank", "money", "budget", "invest", "tax", "save", "expense", "invoice"],
  learning: ["learn", "study", "read", "course", "book", "research", "practice", "tutorial", "class"],
  social: ["call", "meet", "friend", "family", "party", "birthday", "gift", "visit", "dinner", "lunch"],
  general: [],
};

const TYPE_LABELS: Record<TaskType, string> = {
  work: "Work",
  personal: "Personal",
  health: "Health",
  finance: "Finance",
  learning: "Learning",
  social: "Social",
  general: "Task",
};

export const categorizeTask = (text: string): TaskCategory => {
  const lowerText = text.toLowerCase();
  
  // Determine priority
  let priority: Priority = "medium";
  for (const [p, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      priority = p as Priority;
      break;
    }
  }
  
  // Determine type
  let type: TaskType = "general";
  let maxMatches = 0;
  
  for (const [t, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (t === "general") continue;
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      type = t as TaskType;
    }
  }
  
  return {
    priority,
    type,
    label: TYPE_LABELS[type],
  };
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
