import { useState, KeyboardEvent, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Mic, Clock } from "lucide-react";
import { categorizeTask, Priority, PRIORITY_COLORS, TaskType, TYPE_COLORS } from "@/utils/taskUtils";

interface TaskInputProps {
  onSubmit: (text: string) => void;
  onOpenSettings: () => void;
  autoLabel?: boolean;
}

const TaskInput = ({ onSubmit, onOpenSettings, autoLabel = true }: TaskInputProps) => {
  const [value, setValue] = useState("");
  const [borderFlash, setBorderFlash] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [currentType, setCurrentType] = useState<TaskType>("general");
  const [currentPriority, setCurrentPriority] = useState<Priority>("medium");
  const [currentTemporal, setCurrentTemporal] = useState<{ date?: string, time?: string } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setValue(transcript);

        // Trigger smart detection immediately
        const category = categorizeTask(transcript);
        setCurrentLabel(category.label);
        setCurrentType(category.type);
        setCurrentPriority(category.priority);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const showCommands = value.startsWith("/");
  const commands = [
    { cmd: "/settings", desc: "Open System Settings" },
    { cmd: "/group", desc: "Toggle Smart Grouping" }
  ];

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    // Subtle border flash on each keystroke
    setBorderFlash(true);

    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = setTimeout(() => {
      setBorderFlash(false);
    }, 100);

    // "Thinking" logic: Clear label and set thinking state while typing
    if (val.trim() && autoLabel) {
      setIsThinking(true);
      setCurrentLabel("");
      setCurrentTemporal(null);

      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }

      // After 300ms of no typing, categorize the task
      thinkingTimeoutRef.current = setTimeout(() => {
        const category = categorizeTask(val);
        setCurrentLabel(category.label);
        setCurrentType(category.type);
        setCurrentPriority(category.priority);
        if (category.extractedDate || category.extractedTime) {
          setCurrentTemporal({ date: category.extractedDate, time: category.extractedTime });
        } else {
          setCurrentTemporal(null);
        }
        setIsThinking(false);
      }, 300);
    } else {
      setCurrentLabel("");
      setCurrentPriority("medium");
      setCurrentTemporal(null);
      setIsThinking(false);
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim().toLowerCase();

    if (trimmed === "/settings" || trimmed === "/s") {
      setValue("");
      onOpenSettings();
      return;
    }

    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
      setCurrentLabel("");
      setCurrentPriority("medium");
      setCurrentTemporal(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 flex justify-center px-4 w-full max-w-xl"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full relative"
      >
        {/* Command Suggestions */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 w-full mb-4 p-2 rounded-2xl 
                         bg-popover/80 backdrop-blur-xl border border-border shadow-2xl overflow-hidden"
            >
              {commands.map((c) => (
                <button
                  key={c.cmd}
                  onClick={() => {
                    if (c.cmd === "/settings") onOpenSettings();
                    else onSubmit(c.cmd);
                    setValue("");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-foreground font-mono font-medium text-sm">{c.cmd}</span>
                    <span className="text-muted-foreground text-xs">{c.desc}</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground/50 border border-white/10 px-1.5 py-0.5 rounded group-hover:border-white/30 transition-colors">
                    Enter
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`relative w-full rounded-full flex items-center h-14 pl-6 pr-1.5
                      bg-background/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                      border transition-[border,box-shadow] duration-75 overflow-hidden
                      ${borderFlash
              ? "border-primary/40 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              : "border-border"
            }`}
        >
          {/* Intelligent task type label or Thinking dots */}
          <div className="absolute left-3 h-full flex items-center pointer-events-none z-10">
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 h-7 px-4 rounded-full bg-blue-500/20 border border-blue-500/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <span className="text-[10px] uppercase font-bold text-blue-300 tracking-widest">Listening</span>
                </motion.div>
              ) : isThinking ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 px-4 h-7 rounded-full bg-white/5 border border-white/5"
                >
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-1 h-1 rounded-full bg-white/40"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1 h-1 rounded-full bg-white/40"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1 h-1 rounded-full bg-white/40"
                  />
                </motion.div>
              ) : currentLabel ? (
                <motion.div
                  key={currentLabel}
                  initial={{ opacity: 0, scale: 0.95, x: -5 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 2 }}
                  transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-7 flex items-center px-1 max-w-[70px] md:max-w-none">
                    <span className={`text-[10px] md:text-[11px] uppercase font-black tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap truncate
                                     ${TYPE_COLORS[currentType] || 'text-white/70'}`}
                    >
                      {currentLabel}
                    </span>
                  </div>

                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "What are you getting done today?"}
            className="flex-1 min-w-0 bg-transparent h-full text-foreground placeholder:text-muted-foreground/60
                       outline-none text-[16px] leading-normal placeholder:text-[13px] md:placeholder:text-[16px]"
            style={{
              paddingLeft: (isListening || isThinking) ? "80px" : currentLabel ? "85px" : "16px",
              paddingRight: "4px"
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => {
              pressTimeoutRef.current = setTimeout(startListening, 500);
            }}
            onMouseUp={() => {
              if (pressTimeoutRef.current) {
                clearTimeout(pressTimeoutRef.current);
                if (isListening) {
                  stopListening();
                } else {
                  handleSubmit();
                }
              }
            }}
            onTouchStart={(e) => {
              // Prevent default to avoid simulating mouse events if handled here
              // e.preventDefault(); 
              pressTimeoutRef.current = setTimeout(startListening, 500);
            }}
            onTouchEnd={(e) => {
              // e.preventDefault();
              if (pressTimeoutRef.current) {
                clearTimeout(pressTimeoutRef.current);
                if (isListening) {
                  stopListening();
                } else {
                  handleSubmit();
                }
              }
            }}
            onMouseLeave={() => {
              if (pressTimeoutRef.current) {
                clearTimeout(pressTimeoutRef.current);
                if (isListening) stopListening();
              }
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                       ${isListening ? "bg-red-500 scale-105" : "bg-white"}
                       disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 ml-1`}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <ArrowRight className="w-5 h-5 text-black" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskInput;
