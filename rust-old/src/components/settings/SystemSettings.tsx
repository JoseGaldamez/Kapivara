import { Activity, AlertTriangle } from "lucide-react";
import { settingsController } from "@/controllers/settings.controller";

interface SystemSettingsProps {
    telemetry: boolean;
}

export const SystemSettings = ({ telemetry }: SystemSettingsProps) => {
    return (
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Activity size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System</h2>
            </div>
            <div className="p-6">
                {/* Telemetry */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Telemetry</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Allow anonymous usage data collection (We respect your privacy)</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={telemetry}
                            onChange={(e) => settingsController.updateSetting('telemetry', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </section>
    );
};
