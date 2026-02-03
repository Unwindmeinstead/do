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
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("appearance");

  // Toggle dark mode
  const toggleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] h-auto md:h-[500px] bg-background/95 border border-border rounded-[32px] overflow-hidden flex flex-row shadow-2xl"
          >
            {/* Sidebar / Navigation tabs - Left side always */}
            <div className="w-[68px] md:w-56 border-r border-border bg-muted/20 py-6 flex flex-col gap-2 shrink-0 items-center md:items-stretch">
              <div className="flex items-center gap-2 mb-6 px-0 md:px-6 justify-center md:justify-start">
                <SettingsIcon className="w-6 h-6 md:w-5 md:h-5 text-muted-foreground" />
                <span className="hidden md:block font-semibold text-foreground tracking-tight">System</span>
              </div>

              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as Section)}
                    className={`flex items-center justify-center md:justify-start gap-3 w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2.5 mx-auto md:mx-4 rounded-xl transition-all duration-200 text-sm font-medium
                              ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? "text-accent-foreground" : "text-muted-foreground"}`} />
                    <span className="hidden md:block">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6">
                <h2 className="text-xl font-semibold text-foreground capitalize">{activeSection}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
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
                        <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-foreground text-sm font-medium">Dark Mode</span>
                              <span className="text-muted-foreground text-xs">Switch between dark and light themes</span>
                            </div>
                            <div className="flex bg-muted p-1 rounded-lg border border-border">
                              <button
                                onClick={() => toggleDarkMode(true)}
                                className={`p-1.5 rounded-md transition-all ${isDarkMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                <Moon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleDarkMode(false)}
                                className={`p-1.5 rounded-md transition-all ${!isDarkMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                              >
                                <Sun className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="h-px bg-border" />

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-foreground text-sm font-medium">Black Glass Backdrop</span>
                              <span className="text-muted-foreground text-xs">Enable high-blur transparency on cards</span>
                            </div>
                            <Switch checked={settings.darkCards} onCheckedChange={(v) => onUpdateSettings('darkCards', v)} />
                          </div>
                        </div>
                      </>
                    )}

                    {activeSection === "behavior" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                          <div className="flex flex-col">
                            <span className="text-foreground text-sm font-medium">Smart Auto-Label</span>
                            <span className="text-muted-foreground text-xs">Predict task type as you type</span>
                          </div>
                          <Switch checked={settings.autoLabel} onCheckedChange={(v) => onUpdateSettings('autoLabel', v)} />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                          <div className="flex flex-col">
                            <span className="text-foreground text-sm font-medium">Notifications</span>
                            <span className="text-muted-foreground text-xs">Get reminded about your tasks</span>
                          </div>
                          <Switch checked={settings.notifications} onCheckedChange={(v) => onUpdateSettings('notifications', v)} />
                        </div>
                      </div>
                    )}

                    {activeSection === "data" && (
                      <div className="space-y-3">
                        <button
                          onClick={onExportData}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground text-sm">Export Data</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
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
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-accent/50 to-accent/10 flex items-center justify-center border border-border shadow-xl">
                          <div className="w-10 h-10 rounded-full border-4 border-foreground font-black text-foreground flex items-center justify-center text-2xl">D</div>
                        </div>
                        <div>
                          <h4 className="text-foreground font-semibold text-lg">Do. Version 2.0</h4>
                          <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
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
