import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CardStack from "@/components/CardStack";
import TaskInput from "@/components/TaskInput";
import ExpandedCard from "@/components/ExpandedCard";
import Settings from "@/components/Settings";
import {
  getRandomColor,
  categorizeTask,
  Priority,
  TaskType
} from "@/utils/taskUtils";

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

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTask, setExpandedTask] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: false,
    darkCards: true,
    autoLabel: true,
  });
  const [isGrouping, setIsGrouping] = useState(false);

  const handleUpdateSettings = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTask = (text: string) => {
    const trimmed = text.trim();

    // Command handling
    if (trimmed.toLowerCase() === "/group" || trimmed.toLowerCase() === "/g") {
      setIsGrouping(!isGrouping);
      return;
    }

    const category = categorizeTask(text);
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      notes: "",
      color: getRandomColor(),
      priority: category.priority,
      type: category.type,
      label: category.label,
      createdAt: Date.now(),
      temporal: (category.extractedDate || category.extractedTime)
        ? { date: category.extractedDate, time: category.extractedTime }
        : undefined
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleExpand = (id: string, position: { x: number; y: number }) => {
    setExpandedTask({ id, position });
  };

  const handleCloseExpanded = () => {
    setExpandedTask(null);
  };

  const handleUpdateTask = (id: string, text: string, notes: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text, notes } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setExpandedTask(null);
  };

  const handleClearAll = () => {
    setTasks([]);
    setSettingsOpen(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'do-workspace-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const currentExpandedTask = expandedTask
    ? tasks.find((t) => t.id === expandedTask.id)
    : null;

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center overflow-hidden fixed inset-0">
      {/* Card stack area */}
      <div className="flex-1 flex items-center justify-center w-full pt-10 pb-32">
        {tasks.length > 0 && (
          <CardStack
            tasks={tasks}
            onExpand={handleExpand}
            onDelete={handleDeleteTask}
            isGrouping={isGrouping}
            darkCards={settings.darkCards}
          />
        )}
      </div>

      {/* Input bar */}
      <TaskInput
        onSubmit={handleAddTask}
        onOpenSettings={() => setSettingsOpen(true)}
        autoLabel={settings.autoLabel}
      />

      {/* Expanded card overlay */}
      <AnimatePresence>
        {currentExpandedTask && expandedTask && (
          <ExpandedCard
            key={expandedTask.id}
            id={currentExpandedTask.id}
            text={currentExpandedTask.text}
            notes={currentExpandedTask.notes}
            color={currentExpandedTask.color}
            priority={currentExpandedTask.priority}
            type={currentExpandedTask.type}
            label={currentExpandedTask.label}
            position={expandedTask.position}
            onClose={handleCloseExpanded}
            onUpdate={handleUpdateTask}
          />
        )}
      </AnimatePresence>

      {/* Settings */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearAll={handleClearAll}
        onExportData={handleExportData}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

export default Index;
