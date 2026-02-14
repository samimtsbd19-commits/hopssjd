// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-script',
    children: [
      {
        label: dictionary['navigation'].analytics,
        icon: 'tabler-circle',
        href: '/dashboards/analytics'
      }
    ]
  },
  {
    label: 'MikroTik',
    icon: 'tabler-router',
    children: [
      {
        label: 'Routers',
        icon: 'tabler-circle',
        href: '/mikrotik/routers'
      }
    ]
  },
  {
    label: 'Hotspot',
    icon: 'tabler-wifi',
    children: [
      {
        label: 'Active Users',
        icon: 'tabler-circle',
        href: '/hotspot/active'
      },
      {
        label: 'Users',
        icon: 'tabler-circle',
        href: '/hotspot/users'
      },
      {
        label: 'Profiles',
        icon: 'tabler-circle',
        href: '/hotspot/profiles'
      },
      {
        label: 'Hosts',
        icon: 'tabler-circle',
        href: '/hotspot/hosts'
      },
      {
        label: 'Log',
        icon: 'tabler-circle',
        href: '/hotspot/log'
      }
    ]
  },
  {
    label: 'Vouchers',
    icon: 'tabler-ticket',
    children: [
      {
        label: 'Generate',
        icon: 'tabler-circle',
        href: '/vouchers/generate'
      },
      {
        label: 'Templates',
        icon: 'tabler-circle',
        href: '/vouchers/templates'
      }
    ]
  },
  {
    label: 'Administration',
    isSection: true,
    children: [
      {
        label: 'User Management',
        icon: 'tabler-users',
        href: '/user-management'
      },
      {
        label: 'Packages',
        icon: 'tabler-package',
        href: '/packages'
      },
      {
        label: 'Sales Portal',
        icon: 'tabler-cash',
        href: '/sales'
      },
      {
        label: 'Reports',
        icon: 'tabler-report-analytics',
        href: '/reports'
      },
      {
        label: 'Settings',
        icon: 'tabler-settings',
        href: '/settings'
      }
    ]
  }
]

export default verticalMenuData
