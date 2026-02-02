import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categorizeTask } from "@/utils/taskUtils";

interface TaskInputProps {
  onSubmit: (text: string) => void;
  onOpenSettings: () => void;
}

const TaskInput = ({ onSubmit, onOpenSettings }: TaskInputProps) => {
  const [value, setValue] = useState("");
  const [borderFlash, setBorderFlash] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update label based on current text - like an intelligent being thinking
    if (value.trim()) {
      const category = categorizeTask(value);
      setCurrentLabel(category.label);
    } else {
      setCurrentLabel("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Subtle border flash on each keystroke
    setBorderFlash(true);

    // Clear existing timeout
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }

    // Quick fade out after keystroke
    flashTimeoutRef.current = setTimeout(() => {
      setBorderFlash(false);
    }, 100);
  };

  const handleSubmit = () => {
    const trimmed = value.trim().toLowerCase();

    // Check for settings command
    if (trimmed === "/settings" || trimmed === "/s") {
      setValue("");
      onOpenSettings();
      return;
    }

    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
      setCurrentLabel("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      className="fixed left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2"
      style={{ bottom: "calc(2rem + env(safe-area-inset-bottom))" }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2,
        }}
      >
        <div
          className={`relative rounded-full flex items-center h-12 px-2
                      bg-zinc-900/90 backdrop-blur-xl
                      border transition-all duration-75
                      ${borderFlash
              ? "border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
              : "border-white/10"
            }`}
        >
          {/* Intelligent task type label - positioned absolutely with fixed height container */}
          <div className="absolute left-3 h-full flex items-center pointer-events-none z-10">
            <AnimatePresence mode="wait">
              {currentLabel && (
                <motion.span
                  key={currentLabel}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider 
                             bg-white/10 text-white/70 rounded-full whitespace-nowrap"
                >
                  {currentLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent h-full text-white placeholder:text-white/40 
                       outline-none text-sm"
            style={{ paddingLeft: currentLabel ? "80px" : "16px", paddingRight: "8px" }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center 
                       disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskInput;
