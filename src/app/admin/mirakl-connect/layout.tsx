'use client'
// Sub-layout for the Mirakl Connect admin section.
// Provides the 5 internal tabs: Dashboard / Products / Orders / Sync Logs / Settings

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, ScrollText, Settings } from 'lucide-react'

const TABS = [
  { href: '/admin/mirakl-connect',           label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/mirakl-connect/products',  label: 'Products',   icon: Package },
  { href: '/admin/mirakl-connect/orders',    label: 'Orders',     icon: ShoppingBag },
  { href: '/admin/mirakl-connect/sync-logs', label: 'Sync Logs',  icon: ScrollText },
  { href: '/admin/mirakl-connect/settings',  label: 'Settings',   icon: Settings },
]

export default function MiraklConnectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Mirakl Connect</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Sync orders and inventory between your store and Mirakl Connect.
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  )
}