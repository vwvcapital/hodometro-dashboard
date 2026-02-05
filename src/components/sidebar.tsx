"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Gauge,
  Settings,
  AlertTriangle,
  History,
  Wrench,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuItems = [
  {
    title: "MENU PRINCIPAL",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Frota",
        href: "/frota",
        icon: Truck,
        badge: null,
      },
      {
        name: "Hodômetros",
        href: "/hodometros",
        icon: Gauge,
      },
      {
        name: "Revisões",
        href: "/revisoes",
        icon: Wrench,
      },
      {
        name: "Alertas",
        href: "/alertas",
        icon: AlertTriangle,
      },
      {
        name: "Histórico",
        href: "/historico",
        icon: History,
      },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      {
        name: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  vehicleCount?: number;
}

export function Sidebar({ vehicleCount }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">Frota Manager</h1>
          <p className="text-xs text-gray-500">Gestão de Hodômetros</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.name === "Frota" && vehicleCount && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {vehicleCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </Link>
        <div className="mt-4 px-3 text-xs text-gray-400">
          <p>Sistema de Gestão de Frota</p>
          <p>© 2026 Frota Manager</p>
        </div>
      </div>
    </div>
  );
}
