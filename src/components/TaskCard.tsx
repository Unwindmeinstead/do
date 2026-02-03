import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X, Calendar, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  notes: string;
  dueAt?: string;
  temporal?: { date?: string; time?: string };
  onExpand: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  xTranslate?: number;
  darkCards?: boolean;
}

const TaskCard = ({
  id,
  text,
  index,
  total,
  color,
  priority,
  type,
  label,
  notes,
  dueAt,
  temporal,
  onExpand,
  onDelete,
  xTranslate = 0,
  darkCards = true,
}: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUndocked, setIsUndocked] = useState(false);
  const hasMovedRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  // Stacking index: 0 is the top card, 1 is the distinct card behind, etc.
  // Since the list is sorted by priority (Urgent first), index 0 should be the front.
  const stackingIndex = index;

  // Stacking constants - Tuned for "Apple-like" presision
  const CARD_OFFSET = 12; // Vertical pixels exposed per card
  const SCALE_FACTOR = 0.04; // Scale difference per card

  // Target values depend on whether the card is in the stack or "undocked"
  const targetY = isUndocked ? 0 : -stackingIndex * CARD_OFFSET;
  const targetScale = isUndocked ? 1 : 1 - stackingIndex * SCALE_FACTOR;

  // Cards only tilt when in the stack (index > 0) and not undocked
  const targetRotate = (isUndocked || stackingIndex === 0)
    ? 0
    : (stackingIndex % 2 === 0 ? 1 : -1) * (3 / stackingIndex);

  // Limit the visual stack depth to avoid clutter if there are many items
  const isVisible = stackingIndex < 4;
  const opacity = isDragging ? 1 : isVisible ? 1 - stackingIndex * 0.15 : 0;

  // Z-index handling
  const zIndex = isDragging ? 100 : isUndocked ? 50 : total - stackingIndex;

  // Date formatting
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  const handleDragStart = () => {
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 2 || Math.abs(info.offset.y) > 2) {
      hasMovedRef.current = true;
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    // If the card was moved significantly, mark it as undocked
    if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
      setIsUndocked(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
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
    // specific animation for delete could happen here
    onDelete(id);
  };

  return (
    <motion.div
      drag
      dragElastic={0.6} // Rubber band feel
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        width: "clamp(300px, 90vw, 340px)",
        height: "clamp(180px, 55vw, 200px)",
        x,
        y,
        rotate: isDragging ? rotate : targetRotate,
        zIndex,
        position: 'absolute',
        top: '45%', // Slightly above center to account for stack height
        left: '50%',
        marginLeft: "calc(clamp(300px, 90vw, 340px) / -2)", // Dynamically center
        marginTop: "calc(clamp(180px, 55vw, 200px) / -2)", // Dynamically center
        touchAction: 'none',
        transformOrigin: "center bottom", // Rotate/scale from bottom center feels more grounded
        transform: "translate3d(0,0,0)", // Force GPU layer
      }}
      initial={{
        scale: 0.95,
        opacity: 0,
        y: targetY + 100, // Slide up from below
        rotateX: -15 // Subtle 3D tilt
      }}
      animate={{
        scale: isDragging ? 1.05 : targetScale,
        opacity: opacity,
        y: (isDragging || isUndocked) ? undefined : targetY, // Stop controlling position if dragged/undocked
        x: (isDragging || isUndocked) ? undefined : 0,
        rotateX: 0,
        filter: isDragging ? 'brightness(1.05)' : 'brightness(1)',
      }}
      exit={{
        scale: 0.9,
        opacity: 0,
        y: targetY + 20,
        transition: { duration: 0.2 }
      }}
      layout
      layoutId={id}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 1,
        layout: {
          type: "spring",
          stiffness: 350,
          damping: 25,
          mass: 1
        }
      }}
      whileHover={!isDragging && stackingIndex === 0 ? {
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      } : undefined}
      className="cursor-grab active:cursor-grabbing will-change-transform"
      onClick={handleClick}
    >
      <div
        className={`
          relative w-full h-full rounded-[30px] p-6 overflow-hidden
          border-2
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
          flex flex-col justify-between
          backdrop-blur-2xl
        `}
        style={{
          background: darkCards ? "rgba(10, 10, 10, 0.85)" : "rgba(255, 255, 255, 0.05)",
          borderColor: darkCards ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* Header content */}
        <div className="flex items-start justify-between z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: color.bg,
                boxShadow: `0 0 10px ${color.bg}88`
              }}
            />
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">{label}</span>
            {notes && notes.trim().length > 0 && (
              <div
                className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                title="Has notes"
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="w-8 h-8 -mr-2 -mt-2 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </motion.button>
        </div>

        {/* Main Text and Notes */}
        <div className="z-10 flex-1 flex flex-col justify-center">
          <h3 className="text-white text-xl font-medium leading-snug tracking-tight line-clamp-2">
            {text.charAt(0).toUpperCase() + text.slice(1)}
          </h3>
          {notes && notes.trim() && (
            <p className="text-white/50 text-xs mt-1.5 line-clamp-2 font-normal leading-relaxed">
              {notes}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between z-10 mt-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-white/50 font-medium font-mono flex items-center gap-1.5">
              {temporal ? (
                <>
                  <Clock className="w-3 h-3 opacity-70" />
                  <span>
                    {temporal.date && temporal.date}
                    {temporal.date && temporal.time && " • "}
                    {temporal.time && temporal.time}
                  </span>
                </>
              ) : (
                <>
                  <span>{formattedDate}</span>
                </>
              )}
            </div>

            {type === "reminder" && !temporal && !dueAt && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors border border-white/5"
                title="Select date"
                onClick={(e) => {
                  e.stopPropagation();
                  // Simple alert as mockup for now
                  alert("Calendar selector coming soon!");
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          <div className="text-[10px] text-white/30 font-medium font-mono">
            {index + 1}/{total}
          </div>
        </div>
      </div>
    </motion.div >
  );
};

export default TaskCard;
