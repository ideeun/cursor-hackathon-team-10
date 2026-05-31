import { Home, Trophy, Users, User } from "lucide-react";

export const NAV_TABS = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/challenges", label: "Челленджи", icon: Trophy },
  { href: "/gatherings", label: "Сборы", icon: Users },
  { href: "/profile", label: "Профиль", icon: User },
] as const;

export type NavHref = (typeof NAV_TABS)[number]["href"];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export const PAGE_TITLES: Record<NavHref | string, string> = {
  "/": "Ивенты в Кыргызстане",
  "/challenges": "Летние челленджи",
  "/gatherings": "Сборы и встречи",
  "/profile": "Профиль",
};

export function getPageTitle(pathname: string): string {
  const tab = NAV_TABS.find((t) => isNavActive(pathname, t.href));
  return tab ? PAGE_TITLES[tab.href] : "SummerFlow";
}
