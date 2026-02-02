import { AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import { Priority, TaskType } from "@/utils/taskUtils";

interface Task {
  id: string;
  text: string;
  notes: string;
  color: { bg: string; border: string; name: string };
  priority: Priority;
  type: TaskType;
  label: string;
}

interface CardStackProps {
  tasks: Task[];
  onExpand: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
}

const CardStack = ({ tasks, onExpand, onDelete }: CardStackProps) => {
  // Sort tasks by priority for stacking (urgent on top)
  const priorityOrder: Record<Priority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedTasks = [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            id={task.id}
            text={task.text}
            index={index}
            total={sortedTasks.length}
            color={task.color}
            priority={task.priority}
            type={task.type}
            label={task.label}
            onExpand={onExpand}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CardStack;
