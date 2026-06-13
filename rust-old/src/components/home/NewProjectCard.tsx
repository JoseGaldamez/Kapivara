import { Plus } from "lucide-react"

interface NewProjectCardProps {
    onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
    return (
        <div className="w-80 min-w-80 h-64 min-h-64 bg-[#0E61B1]/5 dark:bg-black/20 rounded-3xl p-4 cursor-pointer hover:bg-[#0E61B1]/10 dark:hover:bg-black/50 transition-colors border border-[#0E61B1]/10 dark:border-blue-900/20">
            <div onClick={onClick} className="flex flex-col items-center justify-center h-full">
                <Plus className="w-12 h-12 text-[#0E61B1] dark:text-blue-400" />
                <p className="text-gray-500 dark:text-gray-400">New project</p>
            </div>
        </div>
    )
}
