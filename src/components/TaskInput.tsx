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
      className="fixed left-0 right-0 z-50 flex justify-center px-4"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`relative w-full max-w-xl rounded-full flex items-center h-14 pl-6 pr-1.5
                      bg-[#1a1a1a]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                      border transition-[border,box-shadow] duration-75 overflow-hidden
                      ${borderFlash
              ? "border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              : "border-white/10"
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
                  <div className="h-7 flex items-center px-1 max-w-[80px] md:max-w-none">
                    <span className={`text-[10px] md:text-[11px] uppercase font-black tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap truncate
                                     ${TYPE_COLORS[currentType] || 'text-white/70'}`}
                    >
                      {currentLabel}
                    </span>
                  </div>

                  {currentTemporal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-7 flex items-center px-2 rounded-full bg-blue-500/10 border border-blue-500/20 max-w-[100px] md:max-w-none"
                    >
                      <span className="text-[9px] md:text-[10px] text-blue-400/80 font-bold uppercase tracking-wider whitespace-nowrap truncate">
                        {currentTemporal.date && currentTemporal.date}
                        {currentTemporal.date && currentTemporal.time && " • "}
                        {currentTemporal.time && currentTemporal.time}
                      </span>
                    </motion.div>
                  )}
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
            className="flex-1 min-w-0 bg-transparent h-full text-white placeholder:text-white/30 
                       outline-none text-[16px] leading-normal"
            style={{
              paddingLeft: (isListening || isThinking) ? "90px" : currentLabel ? (currentTemporal ? "150px" : "70px") : "4px",
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
