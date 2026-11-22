"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { coalescedRefresh, every, subscribeRealtime } from "@/lib/realtime/client";
import AdminSidebar, {
  SIDEBAR_COLLAPSED,
  SIDEBAR_EXPANDED,
  type SidebarCounts,
} from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/admin-intl";
import { Toaster } from "@/components/ui/sonner";

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  user?: {
    name: string;
    role: string;
    image?: string;
  };
}

const AdminLayout = ({ children, pageTitle, user }: AdminLayoutProps) => {
  const dir = useLocale() === "ar" ? "rtl" : "ltr";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [counts, setCounts] = useState<SidebarCounts>();
  const pathname = usePathname();
  const activeInbox = pathname === "/admin/chat" || pathname.startsWith("/admin/chat/")
    ? "liveChat"
    : pathname === "/admin/enquiries" || pathname.startsWith("/admin/enquiries/")
      ? "enquiries"
      : undefined;

  useEffect(() => {
    const controller = new AbortController();
    let markNeeded = true;
    const updates = coalescedRefresh(async () => {
      if (document.hidden || controller.signal.aborted) return;
      try {
        if (activeInbox && markNeeded) {
          markNeeded = false;
          const marked = await fetch("/api/admin/sidebar-counts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: activeInbox }),
            signal: controller.signal,
          });
          if (!marked.ok) { markNeeded = true; return; }
        }
        const response = await fetch("/api/admin/sidebar-counts", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (Number.isSafeInteger(data.liveChat) && data.liveChat >= 0 && Number.isSafeInteger(data.enquiries) && data.enquiries >= 0 && !controller.signal.aborted) {
          setCounts({ liveChat: data.liveChat, enquiries: data.enquiries });
        }
      } catch {
        // Keep the last successful totals during temporary network failures.
      }
    });
    function refreshCounts() {
      markNeeded = true;
      void updates.refresh();
    }
    const pollDue = every(30_000);
    const unsubscribe = subscribeRealtime("admin", event => {
      // Only inbox activity changes the badges (analytics/blog/presence events don't).
      if (event.scope === "poll") { if (pollDue()) refreshCounts(); return; }
      if (event.scope !== "sync" && event.scope !== "chat" && event.scope !== "enquiries" && event.scope !== "counts") return;
      if (event.scope === "sync" || (event.scope === "chat" && activeInbox === "liveChat") || (event.scope === "enquiries" && activeInbox === "enquiries")) {
        markNeeded = true;
      }
      void updates.refresh();
    });
    refreshCounts();
    window.addEventListener("focus", refreshCounts);
    document.addEventListener("visibilitychange", refreshCounts);
    return () => {
      controller.abort();
      updates.stop();
      unsubscribe();
      window.removeEventListener("focus", refreshCounts);
      document.removeEventListener("visibilitychange", refreshCounts);
    };
  }, [pathname, activeInbox]);

  // Sidebar is flush with the left edge; content starts right after it.
  const contentOffset = useMemo(
    () => (sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED),
    [sidebarCollapsed],
  );
  const visibleCounts = counts && activeInbox ? { ...counts, [activeInbox]: 0 } : counts;

  return (
    <div dir={dir} className="relative min-h-screen bg-background text-foreground">
      {/* Coloured heart decorations over the neutral content background. */}
      <div aria-hidden="true" className="adm-backdrop pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 md:flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar
            counts={visibleCounts}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
            user={user}
          />
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />

              <motion.div
                className="fixed start-0 top-0 z-50 h-full w-72 max-w-[85vw] md:hidden"
                initial={{ x: dir === "rtl" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: dir === "rtl" ? "100%" : "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              >
                <AdminSidebar
                  counts={visibleCounts}
                  drawer
                  onNavigate={() => setSidebarOpen(false)}
                  collapsed={false}
                  user={user}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div
          className="min-h-screen min-w-0 flex-1 transition-[padding] duration-300 md:ps-(--content-offset)"
          style={
            { "--content-offset": `${contentOffset}px` } as React.CSSProperties
          }
        >
          <AdminHeader
            toggleSidebar={() => setSidebarOpen(true)}
            title={pageTitle}
            user={user}
          />

          <main>{children}</main>
          <Toaster richColors closeButton position="top-right" />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
