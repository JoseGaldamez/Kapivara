import { ExternalLink, Heart, Code2 } from "lucide-react";
import { SettingCard } from "../components/SettingCard";
import { INFORMATION } from "@/utils/information.constant";
import githubIcon from "@/assets/github.png";
import BrandMark from "@/assets/images/logo.png";

export const AboutTab = () => {
    const techStack = [
        "Wails v2",
        "Go 1.23",
        "SQLite 3",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "Zustand",
        "Lucide",
    ];

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[#2c211c] dark:text-[#f8eee5]">
                    About Kapivara
                </h2>
                <p className="text-xs text-[#7e695d] dark:text-[#9e9791] mt-0.5">
                    Software information, technology architecture, and project credits.
                </p>
            </div>

            {/* Hero App Card */}
            <div className="rounded-2xl border border-[#ded7ce] bg-gradient-to-br from-[#fffdf9] via-[#fbf6ef] to-[#f4eadf] p-6 dark:border-white/10 dark:from-[#18191e] dark:via-[#15161a] dark:to-[#101115] shadow-sm">
                <div className="flex items-center gap-5">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#ded4ca] bg-[#f2ece6] dark:border-white/8 dark:bg-white/5 shadow-xs">
                        <img src={BrandMark} alt="Kapivara" className="h-12 w-12 object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold tracking-tight text-[#2c211c] dark:text-[#f8eee5]">
                                {INFORMATION.name}
                            </h3>
                            <span className="rounded-full bg-[#245f92]/10 px-2 py-0.5 text-[11px] font-semibold text-[#245f92] dark:bg-[#388bfd]/20 dark:text-[#79b8ff]">
                                v{INFORMATION.version}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7e695d] dark:text-[#9e9791] leading-relaxed">
                            The Local-First REST API Workbench for developers who value privacy, speed, and clean craftsmanship.
                        </p>
                    </div>
                </div>
            </div>

            {/* Architecture & Stack */}
            <SettingCard
                title="Technology Stack"
                description="Engineered with modern, fast desktop and web technologies."
            >
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {techStack.map((tech) => (
                        <span
                            key={tech}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#ded7ce] bg-[#fbf8f3] px-2.5 py-1 font-mono text-[11px] font-medium text-[#2c211c] dark:border-white/10 dark:bg-[#121316] dark:text-[#ede8e3]"
                        >
                            <Code2 size={11} className="text-[#8f5b36] dark:text-[#e4dad3]" />
                            {tech}
                        </span>
                    ))}
                </div>
            </SettingCard>

            {/* Creator & Links */}
            <SettingCard
                title="Author & Open Source"
                description="Community links, author portfolio, and licensing."
            >
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2 text-xs text-[#2c211c] dark:text-[#f8eee5]">
                            <Heart size={14} className="text-red-500 fill-red-500" />
                            <span>Created by <strong>José Galdámez</strong></span>
                        </div>
                        <a
                            href="https://josegaldamez.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#245f92] hover:underline dark:text-[#79b8ff]"
                        >
                            josegaldamez.dev <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#ded7ce]/60 dark:border-white/5 pt-3">
                        <div className="flex items-center gap-2 text-xs text-[#2c211c] dark:text-[#f8eee5]">
                            <img src={githubIcon} alt="GitHub" className="h-4 w-4" />
                            <span>Source Code & Issues</span>
                        </div>
                        <a
                            href="https://github.com/josegaldamez/kapivara"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#245f92] hover:underline dark:text-[#79b8ff]"
                        >
                            github.com/josegaldamez/kapivara <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className="border-t border-[#ded7ce]/60 dark:border-white/5 pt-3 text-[11px] text-[#7e695d] dark:text-[#9e9791]">
                        Released under the <strong>MIT License</strong>. Copyright © {INFORMATION.year} José Galdámez.
                    </div>
                </div>
            </SettingCard>
        </div>
    );
};
