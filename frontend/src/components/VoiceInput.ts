import { showToast } from "./Toast.js";

const numberWords: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

function parseAmount(text: string): number | null {
  const numMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) return Math.round(parseFloat(numMatch[1]) * 100);

  const words = text.toLowerCase().split(/[\s,]+/);
  let total = 0;
  let current = 0;
  for (const w of words) {
    const val = numberWords[w];
    if (val === undefined) continue;
    if (val >= 100) {
      current = current === 0 ? val : current * val;
    } else {
      current += val;
    }
  }
  if (current > 0) total += current;
  return total > 0 ? Math.round(total * 100) : null;
}

function extractDescription(text: string, amountStr: string): string {
  let desc = text.replace(/\b(add|new|create)\b/i, "").trim();
  const numMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) desc = desc.replace(numMatch[1], "").trim();
  const amountWords = amountStr.toLowerCase().split(/[\s,]+/).filter((w: string) => numberWords[w] !== undefined);
  for (const w of amountWords) {
    desc = desc.replace(new RegExp(`\\b${w}\\b`, "i"), "").trim();
  }
  desc = desc.replace(/\b(rupees?|rs)\b/i, "").trim();
  return desc;
}

let isListening = false;
let currentRecognition: any = null;
let pendingContext: { description: string } | null = null;

interface Expense {
  id: string;
  description: string;
  amount_cents: number;
}

export function initVoiceInput(
  micBtn: HTMLElement,
  actions: {
    addExpense: (description: string, amountCents: number) => Promise<void>;
    toggleTheme: () => void;
    deleteExpense: (index: number) => Promise<void>;
    editExpense: (index: number) => Promise<void>;
    getExpenses: () => Expense[];
  }
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.style.display = "none";
    return;
  }

  micBtn.addEventListener("click", () => {
    if (isListening) {
      stopListening();
      pendingContext = null;
      showToast("Stopped", false);
      return;
    }
    pendingContext = null;
    startRecognition(actions, micBtn, "Listening...");
  });
}

function stopListening() {
  isListening = false;
  pendingContext = null;
  if (currentRecognition) {
    try { currentRecognition.abort(); } catch {}
    currentRecognition = null;
  }
}

function startRecognition(
  actions: {
    addExpense: (description: string, amountCents: number) => Promise<void>;
    toggleTheme: () => void;
    deleteExpense: (index: number) => Promise<void>;
    editExpense: (index: number) => Promise<void>;
    getExpenses: () => Expense[];
  },
  micBtn: HTMLElement,
  prompt: string,
  context?: { description: string }
) {
  try {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (currentRecognition) {
      try { currentRecognition.abort(); } catch {}
      currentRecognition = null;
    }

    currentRecognition = new SpeechRecognition();
    currentRecognition.lang = "en-US";
    currentRecognition.interimResults = false;
    currentRecognition.maxAlternatives = 1;
    currentRecognition.continuous = true;

    if (context) {
      pendingContext = context;
    }

    isListening = true;
    micBtn.classList.add("listening");
    showToast(prompt, false);

    currentRecognition.onresult = async (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript.trim();
      const ctx = pendingContext;
      let done = false;
      if (ctx) {
        pendingContext = null;
        done = await handleTextWithContext(text, actions, micBtn, ctx);
      } else {
        done = await handleText(text, actions, micBtn);
      }
      if (done) stopListening();
    };

    currentRecognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      showToast(event.error === "not-allowed" ? "Microphone access denied" : "Try again", false);
    };

    currentRecognition.onend = () => {
      isListening = false;
      micBtn.classList.remove("listening");
      currentRecognition = null;
    };

    currentRecognition.start();
  } catch {
    isListening = false;
    micBtn.classList.remove("listening");
  }
}

async function handleTextWithContext(
  text: string,
  actions: {
    addExpense: (description: string, amountCents: number) => Promise<void>;
    toggleTheme: () => void;
    deleteExpense: (index: number) => Promise<void>;
    editExpense: (index: number) => Promise<void>;
    getExpenses: () => Expense[];
  },
  micBtn: HTMLElement,
  context: { description: string }
): Promise<boolean> {
  const amountCents = parseAmount(text);
  if (amountCents === null || amountCents <= 0) {
    showToast("Could not detect amount, try again", false);
    pendingContext = context;
    return false;
  }
  try {
    await actions.addExpense(context.description, amountCents);
    return true;
  } catch {
    showToast("Failed to add expense", false);
    return true;
  }
}

async function handleText(
  text: string,
  actions: {
    addExpense: (description: string, amountCents: number) => Promise<void>;
    toggleTheme: () => void;
    deleteExpense: (index: number) => Promise<void>;
    editExpense: (index: number) => Promise<void>;
    getExpenses: () => Expense[];
  },
  micBtn: HTMLElement
): Promise<boolean> {
  const lower = text.toLowerCase();

  if (/\b(dark|light)\s*mode\b|\btoggle\s*theme\b/i.test(lower)) {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const target = lower.includes("dark") ? "dark" : "light";
    if (lower.includes("toggle")) {
      actions.toggleTheme();
      showToast(`Now on ${currentTheme === "dark" ? "Light" : "Dark"} mode`, false);
    } else if (currentTheme === target) {
      showToast(`Already on ${target === "dark" ? "Dark" : "Light"} mode`, false);
    } else {
      actions.toggleTheme();
      showToast(`Now on ${target === "dark" ? "Dark" : "Light"} mode`, false);
    }
    return true;
  }

  if (/^delete\b/.test(lower)) {
    const expenses = actions.getExpenses();
    if (expenses.length === 0) { showToast("No expenses to delete", false); return true; }
    let idx = extractIndex(lower, expenses.length);
    if (idx === null) {
      const query = lower.replace(/^delete\s*/, "").trim();
      const found = expenses.findIndex((e: any) => e.description.toLowerCase().includes(query));
      if (found !== -1) idx = found;
    }
    if (idx === null || idx < 0 || idx >= expenses.length) {
      showToast("Expense not found", false);
      return true;
    }
    actions.deleteExpense(idx);
    return true;
  }

  if (/^edit\b/.test(lower)) {
    const expenses = actions.getExpenses();
    if (expenses.length === 0) { showToast("No expenses to edit", false); return true; }
    const rest = lower.replace(/^edit\s*/, "").trim();
    const m = rest.match(/^(\w+)\s*/);
    let idx: number | null = null;
    if (m) {
      idx = wordToNumber(m[1]);
      if (idx !== null) {
        if (idx < 1 || idx > expenses.length) { showToast("Expense number not found", false); return true; }
        idx = idx - 1;
      }
    }
    if (idx === null) {
      const found = expenses.findIndex((e: any) => e.description.toLowerCase().includes(rest));
      if (found !== -1) idx = found;
    }
    if (idx === null || idx < 0 || idx >= expenses.length) {
      showToast("Expense not found", false);
      return true;
    }
    actions.editExpense(idx);
    return true;
  }

  if (/^(add|new|create)\b/i.test(lower) || /(rupees?|rs)\b/i.test(lower)) {
    const amountCents = parseAmount(lower);
    const amountStr = amountCents ? (amountCents / 100).toString() : "";
    const description = amountCents ? extractDescription(lower, amountStr) : text.replace(/^(add|new|create)\s*/i, "").trim();

    if (amountCents && amountCents > 0 && description) {
      try {
        await actions.addExpense(description, amountCents);
      } catch {
        showToast("Failed to add expense", false);
      }
      return true;
    }

    if (description && (!amountCents || amountCents <= 0)) {
      pendingContext = { description };
      showToast("And the amount?", false);
      return false;
    }

    if (!description) {
      showToast("Say description and amount", false);
      return true;
    }
  }

  showToast("Command not recognized", false);
  return true;
}

function extractIndex(text: string, max: number): number | null {
  const rest = text.replace(/^delete\s*/, "").trim();
  const match = rest.match(/^(\w+)\s*/);
  if (!match) return null;
  const lower = match[1].toLowerCase();
  if (lower === "last") return max - 1;
  if (lower === "first") return 0;
  const num = wordToNumber(match[1]);
  if (num === null || num < 1 || num > max) return null;
  return num - 1;
}

function wordToNumber(word: string): number | null {
  const digit = parseInt(word);
  if (!isNaN(digit)) return digit;
  return numberWords[word.toLowerCase()] ?? null;
}
