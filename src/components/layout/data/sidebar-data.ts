import {
  LayoutDashboard,
  LayoutGrid,
  ClipboardList,
  ClipboardCheck,
  Package,
  PawPrint,
  Tag,
  Users,
  Monitor,
  Bell,
  Palette,
  Settings,
  UserCog,
  Utensils,
  Wrench,
  Command,
} from 'lucide-react'
import { IconRestaurant } from '@/assets/custom/icon-restaurant'
import { type NavGroup, type SidebarData } from '../types'

const settingsNavGroup: NavGroup = {
  title: 'Other',
  items: [
    {
      title: 'Settings',
      icon: Settings,
      items: [
        {
          title: 'Profile',
          url: '/settings',
          icon: UserCog,
        },
        {
          title: 'Account',
          url: '/settings/account',
          icon: Wrench,
        },
        {
          title: 'Appearance',
          url: '/settings/appearance',
          icon: Palette,
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
          icon: Bell,
        },
        {
          title: 'Display',
          url: '/settings/display',
          icon: Monitor,
        },
      ],
    },
  ],
}

const baseSidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@restaurant.local',
    avatar: '',
  },
  teams: [
    {
      name: 'Restaurant Admin',
      logo: Command,
      plan: 'Orders & Content',
    },
  ],
}

// Full admin nav — Dashboard/Orders/Content/Users hit `/admin/*` endpoints
// that 403 for a merchant JWT, so a merchant account never sees this group.
const adminSidebarData: SidebarData = {
  ...baseSidebarData,
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: ClipboardList,
        },
        {
          title: 'Content',
          url: '/content',
          icon: PawPrint,
        },
        {
          title: 'Categories',
          url: '/categories',
          icon: Tag,
        },
        {
          title: 'Cuisines',
          url: '/cuisines',
          icon: Utensils,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Marketplace',
      items: [
        {
          title: 'Merchant Applications',
          url: '/merchant-applications',
          icon: ClipboardCheck,
        },
        {
          title: 'Restaurants',
          url: '/restaurants',
          icon: IconRestaurant,
        },
      ],
    },
    settingsNavGroup,
  ],
}

// Merchant nav — scoped to the merchant-facing pages (`/merchant/restaurant` → My
// Restaurant, `/merchant/catalog-items` filtered to services → My Catalog and to
// products → My Products, `/merchant/orders` → My Orders) plus the generic
// Settings group. No Dashboard: the existing Dashboard page is
// built entirely from admin-only stats (`/admin/reservations`, `/admin/services`,
// `/admin/users`), so there's nothing on it a merchant account could load —
// dropped rather than shown empty/erroring.
const merchantSidebarData: SidebarData = {
  ...baseSidebarData,
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'My Restaurant',
          url: '/my-restaurant',
          icon: IconRestaurant,
        },
        {
          title: 'My Catalog',
          url: '/my-catalog',
          icon: PawPrint,
        },
        {
          title: 'My Products',
          url: '/my-products',
          icon: Package,
        },
        {
          title: 'Floor Plan',
          url: '/my-floor-plan',
          icon: LayoutGrid,
        },
        {
          title: 'My Orders',
          url: '/my-orders',
          icon: ClipboardList,
        },
      ],
    },
    settingsNavGroup,
  ],
}

/** Backward-compatible default export — admin nav, same shape as before. */
export const sidebarData: SidebarData = adminSidebarData

export function getSidebarData(role?: string): SidebarData {
  return role === 'merchant' ? merchantSidebarData : adminSidebarData
}
