'use client'
import { ShieldQuestion } from "lucide-react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLink,
  FileTextIcon,
  LockKeyhole,
} from 'lucide-react';
import React from "react";
import Link from "next/link";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarMenuSub,
  SidebarMenuItem,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Header } from "./header";

type Link = {
  icon: React.ReactNode,
  lable: string;
  to: string;
  notification?: boolean;
}

type CustomTooltipLinkProps = {
  to: string;
  label: string;
  Icon?: React.ElementType;
  extraClasses?: string;
  notification?: boolean;
  locked?: boolean;
  newWindow?: boolean;
  isActive?: (pathname: string) => boolean;
  isSubItem: boolean;
}

const CustomTooltipLink = ({
  to,
  label,
  Icon,
  extraClasses,
  notification,
  locked,
  newWindow,
  isActive,
  isSubItem,
}: CustomTooltipLinkProps) => {
    const location = usePathname();

    const isLinkActive = location.startsWith(to) || isActive?.(location);

    return (
      <Link 
        href={to} 
        target={newWindow ? "_blank" : undefined} 
        rel={newWindow ? "noopener noreferrer" : undefined}
      >
        <div className={`relative flex items-center gap-1 justify-between hover:bg-accent hover:text-primary rounded-lg transition-colors ${extraClasses || ''} ${isLinkActive ? '!bg-primary/10 !text-primary hover:text-[#3f3f46]' : ''} ${isSubItem ? 'text-[#3f3f46]' : ''}`}>
          <div className={`w-full flex items-center justify-between gap-2 p-2 ${!Icon ? 'p-2' : ''}`}>
            <div className="flex items-center gap-2">
              {Icon && <Icon className={`size-4`}/>}
              <span className={'text-sm'}>{label}</span>
            </div>
            {locked && <LockKeyhole className="size-3"  color="grey" />}
          </div>
          {notification && !locked && (
            <span className="bg-destructive mr-1 size-2 rounded-full"></span>
          )}
        </div>
      </Link>
    );
};

export type SidebarLink = {
  to: string;
  label: string;
  icon?: React.ElementType;
  type: 'link';
  notification?: boolean;
  locked?: boolean;
  hasPermission?: boolean;
  showInEmbed?: boolean;
  isSubItem: boolean;
  isActive: (pathname: string) => boolean;
};

export type SidebarGroup = {
  name?: string;
  putEmptySpaceTop?: boolean;
  label: string;
  icon: React.ElementType;
  items: SidebarLink[];
  type: 'group';
  defaultOpen: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  isActive?: (pathname: string) => boolean;
}

export type SidebarItem = SidebarLink | SidebarGroup;

type SidebarProps = {
  children: React.ReactNode;
  items: SidebarItem[];
  isHomeDashboard?: boolean;
  hideSideNav?: boolean;
  hideHeader?: boolean;
  removeGutters?: boolean;
}

export function SidebarComponent({
  children,
  items,
  isHomeDashboard = false,
  hideSideNav = false,
  hideHeader = false,
  removeGutters = false,
}: SidebarProps) {
  const pathname = usePathname();
  let key = 0;

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex min-h-screen w-full">
        {!hideSideNav && (
          <Sidebar className="w-[255px]">
            <SidebarContent>
              <SidebarHeader className="pt-4 pb-0">
                <div className="flex items-center justify-center">
                  <Link
                    href={'/flows'}
                    className="h-[48px] flex items-center justify-center"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Image
                            src='globe.svg'
                            alt='home'
                            width={40}
                            height={40}
                            className="border-2 border-primary p-2 rounded-lg fill-primary"
                          />
                      </TooltipTrigger>
                      <TooltipContent side="right">StudioFlow</TooltipContent>
                    </Tooltip>
                  </Link>
                  {/* {Header} */}
                  <div className="flex flex-col justify-start items-start">
                    <span className="truncate font-bold ml-2">StudioFlow</span>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent className="gap-0">
                <ScrollArea className="h-[calc(100vh-100px)]" key="sidebar-scroll-area">
                  {items.map((item, index) => 
                    item.type === 'group' ? (
                      <SidebarGroup key={`group-${item.name || index}`} className="py-2">
                        {item.putEmptySpaceTop && (
                          <Separator className="mb-8"/>
                        )}
                        {item.name && (
                          <SidebarGroupLabel>{item.name}</SidebarGroupLabel>
                        )}
                        <SidebarMenu className="py-0">
                          <Collapsible
                            defaultOpen={
                              item.defaultOpen || 
                              item.isActive?.(pathname)
                            }
                            className="group/collapsible"
                            onOpenChange={(open) => {
                              item.setOpen(open);
                            }}
                          >
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="py-0 gap-2 hover:bg-accent hover:text-primary rounded-lg transition-colors" asChild>
                                  <div>
                                    {item.icon && (
                                      <item.icon className='size-5'/>
                                    )}
                                    <span>{item.label}</span>
                                    <SidebarMenuAction>
                                      {item.open ? (
                                        <ChevronUpIcon/>
                                      ): (
                                        <ChevronDownIcon/>
                                      )}
                                    </SidebarMenuAction>
                                  </div>
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.items.map((link, index) => (
                                    <SidebarMenuSubItem key={`subitem-${link.label || index}`}>
                                      <SidebarMenuButton asChild>
                                        <CustomTooltipLink
                                          to={link.to}
                                          label={link.label}
                                          Icon={link.icon}
                                          key={`tooltip-${index}`}
                                          notification={link.notification}
                                          locked={link.locked}
                                          isActive={link.isActive}
                                          isSubItem={link.isSubItem}
                                        />
                                      </SidebarMenuButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        </SidebarMenu>
                      </SidebarGroup>
                    ) : (
                      <SidebarGroup key={`link-group-${item.label || index}`} className="py-1">
                        <SidebarMenu className="gap-0 p-0">
                          <SidebarMenuItem key={`menu-item-${item.label || index}`}>
                            <SidebarMenuButton asChild>
                              <CustomTooltipLink
                                to={item.to}
                                label={item.label}
                                Icon={item.icon}
                                key={`tooltip-link-${index}`}
                                notification={item.notification}
                                locked={item.locked}
                                isActive={item.isActive}
                                isSubItem={item.isSubItem}
                              />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroup>
                    ),
                  )}
                </ScrollArea>
              </SidebarContent>
              <SidebarFooter className="pb-4 gap-4">
                <SidebarMenu>
                  {true && (
                    <>  
                      <SidebarMenuItem className="hover:bg-accent hover:text-primary rounded-lg transition-colors">
                        <SidebarMenuButton asChild>
                          <Link
                            href={'/support'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldQuestion className="size-5"/>
                              <span>Community Support</span>
                            </div>
                            <ExternalLink className="size-5"/>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem className="hover:bg-accent hover:text-primary rounded-lg transition-colors">
                        <SidebarMenuButton asChild>
                        <Link
                            href="https://activepieces.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <FileTextIcon className="size-5" />
                              <span>Docs</span>
                            </div>
                            <ExternalLink className="size-5" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
                <Separator/>
                <SidebarMenu>
                  {/* TODO: ADD USER  */}
                </SidebarMenu>
              </SidebarFooter>
            </SidebarContent>
          </Sidebar>
        )}
        <div
          className={cn('flex-1 p-4 w-full', {
            'py-0': hideHeader,
            'px-0': removeGutters,
          })}
        >
          {!hideHeader ? (
            <div className="flex flex-col w-full">
              <div className={removeGutters ? 'px-4' : ''}>
                <Header/>
              </div>
              <div className={cn('flex w-full', {
                  'py-4': true,
                  'px-2': !removeGutters,
                  'pt-10': !hideHeader,
                })}>
                {children}
              </div>
            </div>
          ): (
            children
          )}
        </div>
      </div>
      {/* <ShowPoweredBy show={true} /> */}
    </div>
  )
}