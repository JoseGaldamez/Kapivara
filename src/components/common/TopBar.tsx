import LogoKapivara from "@/assets/logo-kapivara.png"

export const TopBar = () => {
    return (
        <div className="w-full h-16 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={LogoKapivara} alt="Logo Kapivara" className="w-52" />
                    <div className="px-4">
                        <input type="text" placeholder="Search project" className="border border-gray-300 bg-white rounded-3xl px-4 py-2 w-96" />
                    </div>
                </div>
                <div className="flex items-center">
                    <button className="bg-[#0E61B1] text-white px-4 py-2 rounded-3xl cursor-pointer hover:bg-[#0E61B1]/80 transition-colors">Login</button>
                </div>
            </div>
        </div>
    )
}
