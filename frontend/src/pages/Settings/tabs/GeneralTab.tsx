import { Shield, Clock, RotateCw, Globe, Activity } from "lucide-react";
import { SettingCard } from "../components/SettingCard";
import { SettingRow } from "../components/SettingRow";
import { SettingToggle } from "../components/SettingToggle";
import { Select } from "@/components/common/Select";
import { useSettingsStore } from "@/stores/settings.store";
import { settingsController } from "@/controllers/settings.controller";
import { toast } from "react-toastify";

export const GeneralTab = () => {
    const settings = useSettingsStore((state) => state.settings);

    const languageOptions = [
        { label: "English", value: "en" },
        { label: "Español", value: "es" },
    ];

    const handleTimeoutPreset = (ms: number) => {
        settingsController.updateSetting("request_timeout", ms);
        toast.success(`Timeout set to ${ms / 1000}s`);
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    General Preferences
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Network connectivity, redirection, security, and global behavior.
                </p>
            </div>

            {/* Network & HTTP Execution */}
            <SettingCard
                title="Network & Security"
                description="Configure HTTP client timeouts, redirect handling, and SSL certificate verification."
            >
                <SettingRow
                    icon={<Shield size={16} />}
                    label="SSL Certificate Verification"
                    description="Verify SSL/TLS certificates when executing HTTPS requests. Turn off when testing with self-signed local certificates."
                >
                    <SettingToggle
                        checked={settings.ssl_verification}
                        onChange={(checked) => {
                            settingsController.updateSetting("ssl_verification", checked);
                            toast.success(checked ? "SSL verification enabled" : "SSL verification disabled");
                        }}
                        label="SSL Certificate Verification"
                    />
                </SettingRow>

                <SettingRow
                    icon={<Clock size={16} />}
                    label="Request Timeout"
                    description="Maximum time to wait for a server response before timing out."
                >
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-[#ded7ce] bg-white px-2 dark:border-white/10 dark:bg-[#121316]">
                            <input
                                type="number"
                                min="1000"
                                max="120000"
                                step="1000"
                                value={settings.request_timeout}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val > 0) {
                                        settingsController.updateSetting("request_timeout", val);
                                    }
                                }}
                                className="h-8 w-20 text-xs font-semibold text-[#2c211c] focus:outline-none dark:text-[#f8eee5]"
                            />
                            <span className="text-[11px] font-medium text-[#7e695d] dark:text-[#9e9791]">
                                ms
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[10000, 30000, 60000].map((ms) => (
                                <button
                                    key={ms}
                                    type="button"
                                    onClick={() => handleTimeoutPreset(ms)}
                                    className={`h-8 rounded-md px-2 text-[11px] font-medium transition-colors cursor-pointer ${
                                        settings.request_timeout === ms
                                            ? "bg-[#245f92] text-white"
                                            : "border border-[#ded7ce] bg-white text-[#5f554e] hover:bg-[#f6f2ec] dark:border-white/10 dark:bg-[#121316] dark:text-[#c9c4c0] dark:hover:bg-white/5"
                                    }`}
                                >
                                    {ms / 1000}s
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingRow>

                <SettingRow
                    icon={<RotateCw size={16} />}
                    label="Follow HTTP Redirects"
                    description="Automatically follow 3xx HTTP redirects (301, 302, 307, 308)."
                >
                    <SettingToggle
                        checked={settings.follow_redirects}
                        onChange={(checked) => {
                            settingsController.updateSetting("follow_redirects", checked);
                            toast.success(checked ? "Follow redirects enabled" : "Follow redirects disabled");
                        }}
                        label="Follow HTTP Redirects"
                    />
                </SettingRow>
            </SettingCard>

            {/* Application Behavior */}
            <SettingCard
                title="Application Behavior"
                description="Interface language and diagnostic preferences."
            >
                <SettingRow
                    icon={<Globe size={16} />}
                    label="Interface Language"
                    description="Select display language for application labels and menus."
                >
                    <Select
                        value={settings.language}
                        onChange={(val) => {
                            settingsController.updateSetting("language", val as any);
                            toast.info(`Language set to ${val === "es" ? "Español" : "English"}`);
                        }}
                        options={languageOptions}
                        className="w-36"
                    />
                </SettingRow>

                <SettingRow
                    icon={<Activity size={16} />}
                    label="Anonymous Telemetry"
                    description="Transmit non-sensitive crash reports and feature usage. Request bodies and tokens are never included."
                >
                    <SettingToggle
                        checked={settings.telemetry}
                        onChange={(checked) => {
                            settingsController.updateSetting("telemetry", checked);
                            toast.success(checked ? "Telemetry opted in" : "Telemetry disabled");
                        }}
                        label="Anonymous Telemetry"
                    />
                </SettingRow>
            </SettingCard>
        </div>
    );
};
