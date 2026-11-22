"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "@/lib/admin-intl";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";

import { ADMIN_NAV, isAdminRouteActive } from "./admin-nav";
import { site } from "@/lib/site";
import { Heart } from "@/components/decor";

export type SidebarCounts = { liveChat: number; enquiries: number };

interface Props {
  counts?: SidebarCounts;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: { name: string; role: string; image?: string };
  /** Mobile drawer: fills its container instead of being fixed to the viewport. */
  drawer?: boolean;
}

export const SIDEBAR_EXPANDED = 256;
export const SIDEBAR_COLLAPSED = 72;

function initials(name?: string) {
  const parts = (name || "Admin").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const AdminSidebar = ({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  user,
  drawer = false,
  counts,
}: Props) => {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const number = new Intl.NumberFormat(locale);
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <aside
      dir={dir}
      className={`adm-sidebar flex flex-col transition-[width] duration-300 ${
        drawer
          ? "h-full w-full"
          : "h-screen md:fixed md:start-0 md:top-0 md:z-40"
      }`}
      style={{
        width: drawer ? undefined : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
      }}
    >
      {/* Brand */}
      <div
        className={`adm-brand relative flex h-16 shrink-0 items-center ${
          collapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
          title={t("shell.brandTitle")}
        >
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_0_3px_#ffffff26]">
            <Image
              src={site.images.logo}
              alt=""
              width={34}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </span>
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-lg font-bold leading-none text-foreground">
                Suraksha
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {t("shell.panel")}
              </span>
            </span>
          )}
        </Link>

        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={t("shell.collapseSidebar")}
            className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          >
            {dir === "rtl" ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label={t("shell.navLabel")}
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
      >
        {ADMIN_NAV.map((group) => (
          <div key={group.key}>
            {!collapsed ? (
              <p className="adm-group mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                {t(`nav.groups.${group.key}`)}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px bg-border" />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isAdminRouteActive(pathname, item.href);
                const Icon = item.icon;
                const count = item.key === "liveChat" ? counts?.liveChat : item.key === "enquiries" ? counts?.enquiries : undefined;
                const label = t(`nav.items.${item.key}.name`);
                const countLabel = count === undefined ? undefined : number.format(count);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? `${label}${countLabel === undefined ? "" : ` (${countLabel})`}` : undefined}
                      aria-label={countLabel === undefined ? undefined : `${label} (${countLabel})`}
                      aria-current={active ? "page" : undefined}
                      className={`adm-link relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                        collapsed ? "justify-center" : ""
                      } ${active ? "is-active" : ""}`}
                    >
                      <span className="adm-ic">
                        <Icon size={17} className="shrink-0" />
                      </span>
                      {!collapsed && <span className="min-w-0 flex-1 truncate">
                          {label}
                        </span>}
                      {countLabel !== undefined && (
                        <span
                          aria-hidden="true"
                          className={`adm-count ${collapsed ? "is-collapsed" : ""}`}
                        >
                          {collapsed && (count ?? 0) > 99 ? `${number.format(99)}+` : countLabel}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative shrink-0 border-t border-border p-3">
        {!collapsed && <Heart className="adm-side-heart" />}
        {collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={t("shell.expandSidebar")}
            className="mb-2 hidden w-full items-center justify-center rounded-lg py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          >
            {dir === "rtl" ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
          </button>
        )}
        <div
          className={`relative flex items-center gap-3 rounded-xl bg-muted p-2.5 ring-1 ring-border ${
            collapsed ? "flex-col" : ""
          }`}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="size-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {initials(user?.name)}
            </span>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name || t("shell.defaultUser")}
              </p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {t(`shell.role.${(user?.role || "admin").toLowerCase()}` as never)}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={t("shell.signOut")}
            title={t("shell.signOut")}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
