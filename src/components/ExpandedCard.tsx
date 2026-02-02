import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Priority, TaskType, PRIORITY_COLORS } from "@/utils/taskUtils";

interface ExpandedCardProps {
  id: string;
  text: string;
  notes: string;
  color: { bg: string; border: string; name: string };
  priority: Priority;
  type: TaskType;
  label: string;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (id: string, text: string, notes: string) => void;
}

const ExpandedCard = ({
  id,
  text,
  notes,
  color,
  priority,
  label,
  position,
  onClose,
  onUpdate,
}: ExpandedCardProps) => {
  const [editedText, setEditedText] = useState(text);
  const [editedNotes, setEditedNotes] = useState(notes);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll when expanded
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    onUpdate(id, editedText, editedNotes);
    onClose();
  };

  return (
    <motion.div
      ref={constraintsRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ 
          scale: 0.5, 
          opacity: 0,
        }}
        animate={{ 
          scale: 1, 
          opacity: 1,
        }}
        exit={{ 
          scale: 0.5, 
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        onClick={(e) => e.stopPropagation()}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[90%] max-w-md min-h-[300px] rounded-3xl p-6
                    bg-gradient-to-br ${color.bg} ${color.border} border
                    shadow-2xl cursor-grab active:cursor-grabbing`}
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 
                     flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </motion.button>

        {/* Priority and label */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_COLORS[priority]}`} />
          <span className="text-xs text-white/60 uppercase tracking-wider">{label}</span>
        </div>

        {/* Editable title */}
        <input
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full bg-transparent text-white text-lg font-medium 
                     outline-none placeholder:text-white/30 mb-4"
          placeholder="Task title..."
        />

        {/* Editable notes */}
        <textarea
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          placeholder="Add notes..."
          className="w-full h-40 bg-white/5 rounded-xl p-4 text-white/80 text-sm
                     outline-none placeholder:text-white/30 resize-none
                     border border-white/10 focus:border-white/20 transition-colors"
        />

        {/* Drag hint */}
        <p className="text-center text-white/30 text-xs mt-4">
          Drag to move • Tap outside to save
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ExpandedCard;
