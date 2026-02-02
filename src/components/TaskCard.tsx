import { motion, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useState, useRef } from "react";
import { Priority, TaskType, PRIORITY_COLORS } from "@/utils/taskUtils";

interface TaskCardProps {
  id: string;
  text: string;
  index: number;
  total: number;
  color: { bg: string; border: string; name: string };
  priority: Priority;
  type: TaskType;
  label: string;
  onExpand: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({
  id,
  text,
  index,
  total,
  color,
  priority,
  label,
  onExpand,
  onDelete,
}: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);

  // Stacked cards behind each other with subtle rotation like the reference
  const reverseIndex = total - 1 - index;

  // Subtle rotation alternating left/right for depth
  const rotationDirection = reverseIndex % 2 === 0 ? 1 : -1;
  const rotation = reverseIndex * 3 * rotationDirection;

  // Slight offset for each card behind
  const xOffset = reverseIndex * 8 * rotationDirection;
  const yOffset = reverseIndex * 4;

  // Scale slightly smaller for cards behind
  const scale = 1 - reverseIndex * 0.02;

  // Z-index - front card on top, but dragging card always on very top
  const zIndex = isDragging ? 1000 : total - reverseIndex;

  const handleDragStart = () => {
    hasMovedRef.current = false;
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If moved more than 5px, consider it a drag
    if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
      hasMovedRef.current = true;
      if (!isDragging) {
        setIsDragging(true);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only expand if we didn't drag
    if (!hasMovedRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      onExpand(id, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    hasMovedRef.current = false;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragTransition={{ power: 0, timeConstant: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{
        scale: 0.8,
        y: 100,
        rotate: 0,
        opacity: 0
      }}
      animate={{
        scale: isDragging ? 1.02 : scale,
        rotate: isDragging ? 0 : rotation,
        opacity: isDragging ? 1 : 1 - reverseIndex * 0.15
      }}
      exit={{
        scale: 0.5,
        opacity: 0,
        y: -100,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 0.3,
      }}
      whileHover={!isDragging ? {
        y: yOffset - 12,
        scale: scale + 0.02,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 35
        }
      } : undefined}
      onClick={handleClick}
      style={{
        zIndex,
        x: isDragging ? undefined : xOffset,
        y: isDragging ? undefined : yOffset,
      }}
      className={`absolute rounded-3xl p-6 w-80 min-h-44 cursor-grab active:cursor-grabbing
                  bg-gradient-to-br ${color.bg} ${color.border} border
                  shadow-[0_25px_80px_-20px_rgba(0,0,0,0.8)] ${isDragging ? 'shadow-[0_40px_100px_-15px_rgba(0,0,0,0.95)]' : ''}`}
    >
      {/* X button to delete */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDelete}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/20 
                   flex items-center justify-center hover:bg-black/40 transition-colors"
      >
        <X className="w-3 h-3 text-white/70" />
      </motion.button>

      {/* Priority dot and label */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority]}`} />
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      </div>

      <p className="text-white text-base leading-relaxed font-medium pr-6">
        {text}
      </p>
      <div className="absolute bottom-4 right-5 text-xs text-white/30">
        #{index + 1}
      </div>
    </motion.div>
  );
};

export default TaskCard;
