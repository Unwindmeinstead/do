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
  createdAt: number;
  dueAt?: string;
  temporal?: { date?: string; time?: string };
}

interface CardStackProps {
  tasks: Task[];
  onExpand: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  isGrouping?: boolean;
  darkCards?: boolean;
}

const CardStack = ({ tasks, onExpand, onDelete, isGrouping, darkCards }: CardStackProps) => {
  const sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);

  if (isGrouping) {
    const groups = sortedTasks.reduce((acc, task) => {
      const label = task.label;
      if (!acc[label]) acc[label] = [];
      acc[label].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const labels = Object.keys(groups);

    return (
      <div className="relative flex items-center justify-center w-full h-full gap-8">
        <AnimatePresence mode="popLayout">
          {labels.map((label, groupIndex) => {
            const groupTasks = groups[label];
            // Calculate a horizontal offset for each group
            const xOffset = (groupIndex - (labels.length - 1) / 2) * 380;

            return groupTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                id={task.id}
                text={task.text}
                index={index}
                total={groupTasks.length}
                color={task.color}
                priority={task.priority}
                type={task.type}
                label={task.label}
                notes={task.notes}
                dueAt={task.dueAt}
                temporal={task.temporal}
                onExpand={onExpand}
                onDelete={onDelete}
                xTranslate={xOffset}
                darkCards={darkCards}
              />
            ));
          })}
        </AnimatePresence>
      </div>
    );
  }

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
            notes={task.notes}
            dueAt={task.dueAt}
            temporal={task.temporal}
            onExpand={onExpand}
            onDelete={onDelete}
            darkCards={darkCards}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CardStack;
