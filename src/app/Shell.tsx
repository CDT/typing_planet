import { Outlet, NavLink } from "react-router-dom";
import { Compass, User, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Shell() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="hidden lg:flex flex-col gap-2 w-[88px] border-r border-[var(--border)] py-6 items-center">
        <NavItem to="/map" icon={<Compass size={22} />} label={t("nav.galaxy")} />
        <NavItem to="/me" icon={<User size={22} />} label={t("nav.me")} />
        <NavItem to="/settings" icon={<SettingsIcon size={22} />} label={t("nav.settings")} />
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1120px] px-6 py-8 pb-28 lg:pb-8">
          <Outlet />
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--border)] z-30">
        <ul className="flex justify-around py-2">
          <li>
            <NavItem to="/map" icon={<Compass size={22} />} label={t("nav.galaxy")} />
          </li>
          <li>
            <NavItem to="/me" icon={<User size={22} />} label={t("nav.me")} />
          </li>
          <li>
            <NavItem to="/settings" icon={<SettingsIcon size={22} />} label={t("nav.settings")} />
          </li>
        </ul>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs ${
          isActive ? "text-accent" : "text-text-muted hover:text-text"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
