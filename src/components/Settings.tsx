import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Bell, Trash2, Download, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  settings: {
    notifications: boolean;
    darkCards: boolean;
    autoLabel: boolean;
  };
  onUpdateSettings: (key: string, value: boolean) => void;
}

const Settings = ({ isOpen, onClose, onClearAll, settings, onUpdateSettings }: SettingsProps) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl 
                       max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Settings content */}
            <div className="px-6 py-4 space-y-6">
              {/* Appearance section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Appearance
                </h3>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-white/60" />
                    <span className="text-white">Dark card backgrounds</span>
                  </div>
                  <Switch checked={settings.darkCards} onCheckedChange={(v) => onUpdateSettings('darkCards', v)} />
                </div>
              </div>

              {/* Behavior section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Behavior
                </h3>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-white/60" />
                    <span className="text-white">Notifications</span>
                  </div>
                  <Switch checked={settings.notifications} onCheckedChange={(v) => onUpdateSettings('notifications', v)} />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-white/60" />
                    <div>
                      <span className="text-white block">Auto-label tasks</span>
                      <span className="text-white/40 text-sm">Automatically categorize based on keywords</span>
                    </div>
                  </div>
                  <Switch checked={settings.autoLabel} onCheckedChange={(v) => onUpdateSettings('autoLabel', v)} />
                </div>
              </div>

              {/* Data section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Data
                </h3>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 py-3 text-white/80 hover:text-white transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export tasks</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearAll}
                  className="w-full flex items-center gap-3 py-3 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear all tasks</span>
                </motion.button>
              </div>

              {/* About section */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-center text-white/30 text-sm">
                  CardStack v1.0
                </p>
                <p className="text-center text-white/20 text-xs mt-1">
                  Type "/settings" to access this menu
                </p>
              </div>
            </div>

            {/* Safe area padding */}
            <div style={{ height: "env(safe-area-inset-bottom)" }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings;
