import {
  Settings,
  Palette,
  Bell,
  LayoutDashboard,
  Shield
} from "lucide-react"

const menu = [

  {
    id: "general",
    label: "Geral",
    icon: Settings
  },

  {
    id: "appearance",
    label: "Aparência",
    icon: Palette
  },

  {
    id: "notifications",
    label: "Notificações",
    icon: Bell
  },

  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },

  {
    id: "security",
    label: "Segurança",
    icon: Shield
  }

]

export default function SettingsSidebar({ active, setActive }: any) {

  return (

    <div className="space-y-2">

      {menu.map((item) => {

        const Icon = item.icon

        return (

          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left
            ${
              active === item.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >

            <Icon size={18} />

            {item.label}

          </button>

        )

      })}

    </div>

  )
}