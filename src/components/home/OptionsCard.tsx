import { ProjectMetadata } from "@/models/projectMetadata"
import { Download, Trash2 } from "lucide-react";

interface OptionsCardProps {
    project: ProjectMetadata
    setIsOpen: (isOpen: boolean) => void;
}

export const OptionsCard = ({ project, setIsOpen }: OptionsCardProps) => {
    const showAlert = (message: string) => {
        alert(message)
    }

    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                }}
            />
            <div className="absolute right-0 top-12 w-40 bg-white rounded-xl shadow-xl border border-[#0E61B1]/10 z-20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        showAlert("Exportar proyecto " + project.name);
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#0E61B1]/5 hover:text-[#0E61B1] transition-colors text-left cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
                <div className="h-px bg-gray-100 mx-2" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        showAlert("Eliminar proyecto " + project.name);
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </>
    )
}
