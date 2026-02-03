import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Bell, Trash2, Download, Info, Settings as SettingsIcon, Sun, Moon, Shield, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onExportData: () => void;
  settings: {
    notifications: boolean;
    darkCards: boolean;
    autoLabel: boolean;
  };
  onUpdateSettings: (key: string, value: boolean) => void;
}

type Section = "appearance" | "behavior" | "data" | "about";

const Settings = ({ isOpen, onClose, onClearAll, onExportData, settings, onUpdateSettings }: SettingsProps) => {
  const [activeSection, setActiveSection] = useState<Section>("appearance");

  const sidebarItems = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "behavior", label: "Behavior", icon: Sparkles },
    { id: "data", label: "Data & Privacy", icon: Shield },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-start md:items-center justify-start md:justify-center p-4 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[90vh] md:h-[500px] bg-zinc-900/90 border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Sidebar / Navigation tabs */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible shrink-0">
              <div className="hidden md:flex items-center gap-2 mb-8 px-2">
                <SettingsIcon className="w-5 h-5 text-white/40" />
                <span className="font-semibold text-white tracking-tight">System</span>
              </div>

              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as Section)}
                    className={`flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap
                              ${isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/40"}`} />
                    <span className="md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6">
                <h2 className="text-xl font-semibold text-white capitalize">{activeSection}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-8 pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {activeSection === "appearance" && (
                      <>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-medium">Dark Mode</span>
                              <span className="text-white/40 text-xs">Switch between dark and light themes</span>
                            </div>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                              <button className="p-1.5 rounded-md bg-white/10 text-white"><Moon className="w-4 h-4" /></button>
                              <button className="p-1.5 rounded-md text-white/40 hover:text-white/60"><Sun className="w-4 h-4" /></button>
                            </div>
                          </div>

                          <div className="h-px bg-white/5" />

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-medium">Black Glass Backdrop</span>
                              <span className="text-white/40 text-xs">Enable high-blur transparency on cards</span>
                            </div>
                            <Switch checked={settings.darkCards} onCheckedChange={(v) => onUpdateSettings('darkCards', v)} />
                          </div>
                        </div>
                      </>
                    )}

                    {activeSection === "behavior" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">Smart Auto-Label</span>
                            <span className="text-white/40 text-xs">Predict task type as you type</span>
                          </div>
                          <Switch checked={settings.autoLabel} onCheckedChange={(v) => onUpdateSettings('autoLabel', v)} />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">Notifications</span>
                            <span className="text-white/40 text-xs">Get reminded about your tasks</span>
                          </div>
                          <Switch checked={settings.notifications} onCheckedChange={(v) => onUpdateSettings('notifications', v)} />
                        </div>
                      </div>
                    )}

                    {activeSection === "data" && (
                      <div className="space-y-3">
                        <button
                          onClick={onExportData}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-white/60" />
                            <span className="text-white text-sm">Export Data</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20" />
                        </button>

                        <button
                          onClick={onClearAll}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Clear All Tasks</span>
                          </div>
                          <span className="text-red-500/20 group-hover:text-red-500/40 text-[10px] uppercase font-bold tracking-widest">Danger</span>
                        </button>
                      </div>
                    )}

                    {activeSection === "about" && (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-white/20 to-white/5 flex items-center justify-center border border-white/10 shadow-xl">
                          <div className="w-10 h-10 rounded-full border-4 border-white font-black text-white flex items-center justify-center text-2xl">D</div>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg">Do. Version 2.0</h4>
                          <p className="text-white/40 text-xs max-w-xs leading-relaxed">
                            A minimal workspace for your thoughts and tasks. Built with focus and speed in mind.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Settings;
