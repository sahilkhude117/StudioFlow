'use client'

import { Settings, Table2, Workflow } from "lucide-react";
import {
  SidebarComponent,
  SidebarGroup,
  SidebarItem,
  SidebarLink,
} from './sidebar';
import { useState } from "react";

type DashboardContainerProps = {
  children: React.ReactNode;
  hideHeader?: boolean;
  removeGutters?: boolean;
}

export function DashboardContainer({
  children,
  removeGutters,
  hideHeader,
}: DashboardContainerProps) {
  const [automationOpen, setAutomationOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const items: SidebarItem[] = [
    {
      type: 'group',
      label: 'Automation',
      putEmptySpaceTop: true,
      icon: Workflow,
      isActive: (pathname: string) => {
        const paths = [
          '/flows',
          '/issues',
          '/runs',
          '/connections',
          '/released',
          '/tables'
        ];
        return paths.some((path) => pathname.includes(path));
      },
      defaultOpen: true,
      open: automationOpen,
      setOpen: setAutomationOpen,
      items: [
        {
          type: 'link',
          to: '/flows',
          label: 'Flows',
          showInEmbed: true,
          hasPermission: true,
          isSubItem: true,
        }, {
          type: 'link',
          to: '/issues',
          label: 'Issues',
          notification: true,
          showInEmbed: false,
          hasPermission: true,
          isSubItem: true,
        }, {
          type: 'link',
          to: '/runs',
          label: 'Runs',
          showInEmbed: true,
          hasPermission: true,
          isSubItem: true,
        },
        {
          type: 'link',
          to: '/releases',
          label: 'Releases',
          hasPermission: true,
          isSubItem: true,
        },
      ],
    } as unknown as SidebarGroup,
    {
      type: 'link',
      to: '/tables',
      label: 'Tables',
      icon: Table2,
      showInEmbed: true,
      hasPermission: true,
      isSubItem: false,
    } as unknown as SidebarLink,
    {
      type: 'group',
      label: 'Settings',
      defaultOpen: false,
      open: settingsOpen,
      setOpen: setSettingsOpen,
      icon: Settings,
      isActive: (pathname: string) => pathname.includes('/settings'),
      items: [
        {
          type: 'link',
          to: '/settings/general',
          label: 'General',
          isSubItem: true,
        } as SidebarLink,
        {
          type: 'link',
          to:'/settings/appearance',
          label: 'Appearance',
          isSubItem: true,
        } as SidebarLink,
        {
          type: 'link',
          to: '/settings/team',
          label: 'Team',
          hasPermission: true,
          isSubItem: true,
        } as SidebarLink,
        {
          type: 'link',
          to: '/settings/pieces',
          label: 'Pieces',
          isSubItem: true,
        } as SidebarLink,
        {
          type: 'link',
          to: '/settings/alerts',
          label: 'Alerts',
          hasPermission: true,
          isSubItem: true,
        } as SidebarLink,
        {
          type: 'link',
          to: '/settings/environments',
          label: 'Environments',
          hasPermission: true,
          isSubItem: true,
        } as SidebarLink,
      ],
    } as SidebarGroup
  ]

  return (
    <SidebarComponent
      removeGutters={removeGutters}
      isHomeDashboard={true}
      hideHeader={hideHeader}
      items={items}
      hideSideNav={false}
    >
      {children}
    </SidebarComponent>
  )
}