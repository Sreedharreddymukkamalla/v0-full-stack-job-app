"use client";

import React from "react";
import Image from "next/image";

import { useState } from "react";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Triangle,
  ClipboardList,
  Flag,
  PanelLeftClose,
  Zap,
  LogOut,
  FileEdit,
  AlertCircle,
  PanelRightClose,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const menuItems = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Users, label: "My Network", href: "/users" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: FileText, label: "Jobs Applied", href: "/jobs/applied" },
  { icon: MessageSquare, label: "Messaging", href: "/messages" },
  { icon: FileEdit, label: "Resume Builder", href: "/resume" },
  { icon: Triangle, label: "AIM", href: "/agent" },
  { icon: ClipboardList, label: "Application Details", href: "/applications" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, open } = useSidebar();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    type: "bug",
  });

  const isActive = (href: string) => {
    // Exact match for jobs to prevent highlighting when on jobs/applied
    if (href === "/jobs") {
      return pathname === "/jobs";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reportMessage =
      `${reportForm.title}\n\n${reportForm.description}`.trim();
    try {
      await apiFetch("/issues", {
        method: "POST",
        json: { message: reportMessage },
      });
      // themed toast feedback
      toast.success(
        "Thanks — your report has been submitted. We will review it shortly.",
      );
    } catch (err) {
      console.error("[v0] Failed to submit issue report", err);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsReportDialogOpen(false);
      setReportForm({ title: "", description: "", type: "bug" });
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar mt-[63px] h-[calc(100vh-63px)] transition-all duration-200"
    >
      <SidebarHeader className="h-12 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-2">
            {open && (
              <span className="text-md font-bold tracking-tight text-sidebar-foreground">AIMPLOY</span>
            )}
          </div>

          <div className={`${open ? 'ml-auto' : 'justify-center w-full flex'}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={toggleSidebar}>
              {open ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelRightClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                className="h-8 rounded-lg transition-colors hover:bg-sidebar-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                tooltip={!open ? item.label : undefined}
              >
                <Link
                  href={item.href}
                  className={`flex items-center ${open ? "gap-4 px-4" : "justify-center px-0"}`}
                >
                  <item.icon
                    className="flex-shrink-0"
                    strokeWidth={2}
                    style={{ width: 24, height: 24 }}
                  />
                  {open && <span className="font-normal">{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setIsReportDialogOpen(true)}
              className="h-8 rounded-lg transition-colors hover:bg-sidebar-accent"
              tooltip={!open ? "Report Issue" : undefined}
            >
              <div
                className={`flex items-center ${open ? "gap-4 px-4" : "justify-center px-0"}`}
              >
                <Flag className="flex-shrink-0" strokeWidth={2} style={{ width: 24, height: 24 }} />
                {open && <span className="font-normal">Report Issue</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Report an Issue
            </DialogTitle>
            <DialogDescription>
              Help us improve by reporting bugs or suggesting features. We'll
              review your feedback shortly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <select
                id="issue-type"
                value={reportForm.type}
                onChange={(e) =>
                  setReportForm({ ...reportForm, type: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-title">Title</Label>
              <Input
                id="issue-title"
                placeholder="Brief description of the issue"
                value={reportForm.title}
                onChange={(e) =>
                  setReportForm({ ...reportForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Please provide detailed information about the issue..."
                value={reportForm.description}
                onChange={(e) =>
                  setReportForm({ ...reportForm, description: e.target.value })
                }
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
