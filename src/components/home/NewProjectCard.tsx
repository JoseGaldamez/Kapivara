import { Plus } from "lucide-react"

interface NewProjectCardProps {
    onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
    return (
        <div className="w-80 min-w-80 h-64 min-h-64 bg-[#0E61B1]/5 rounded-3xl p-4 cursor-pointer hover:bg-[#0E61B1]/10 transition-colors border border-[#0E61B1]/10">
            <div onClick={onClick} className="flex flex-col items-center justify-center h-full">
                <Plus className="w-12 h-12 text-[#0E61B1]" />
                <p className="text-gray-500">New project</p>
            </div>
        </div>
    )
}
