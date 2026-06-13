import { Globe, Shield, Clock, RotateCw } from "lucide-react";
import { settingsController } from "@/controllers/settings.controller";

interface NetworkSettingsProps {
    sslVerification: boolean;
    requestTimeout: number;
    followRedirects: boolean;
}

export const NetworkSettings = ({ sslVerification, requestTimeout, followRedirects }: NetworkSettingsProps) => {

    return (
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Globe size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Network</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* SSL Verification */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">SSL Certificate Verification</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Verify SSL certificates when making requests</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sslVerification}
                            onChange={(e) => settingsController.updateSetting('ssl_verification', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Request Timeout */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Request Timeout</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Global timeout for requests (ms)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={requestTimeout}
                            onChange={(e) => settingsController.updateSetting('request_timeout', parseInt(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2.5 outline-none"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">ms</span>
                    </div>
                </div>

                {/* Follow Redirects */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                        <RotateCw size={18} className="text-gray-400" />
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200 block">Follow Redirects</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Automatically follow HTTP 3xx redirects</span>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={followRedirects}
                            onChange={(e) => settingsController.updateSetting('follow_redirects', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </section>
    );
};
