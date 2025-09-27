"use client";

// import { SearchIcon } from "@/assets/icons"; // COMMENTED OUT: Global search is hidden
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-6 2xl:px-8">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {/* Logo and Title - Mobile */}
      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      {/* Logo and Title - Desktop */}
      <div className="flex items-center gap-3">
        <Link href={"/"} className="flex items-center gap-3">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt="Fleet Admin"
            className="hidden lg:block"
          />
          <h1 className="text-xl font-bold text-dark dark:text-white">
            Fleet Admin
          </h1>
        </Link>
      </div>

      {/* Right Side - Theme, Notifications, User */}
      <div className="flex flex-1 items-center justify-end gap-3 min-[375px]:gap-4">
        {/* Global Search - COMMENTED OUT: No API or demonstration in design */}
        {/* <div className="relative w-full max-w-[400px]">
          <input
            type="search"
            placeholder="🔍 Search..."
            className="flex w-full items-center gap-3.5 rounded-lg border bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:bg-white dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:focus-visible:border-primary dark:focus-visible:bg-gray-dark"
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        </div> */}

        {/* Theme Toggle */}
        <ThemeToggleSwitch />

        {/* Notifications */}
        <Notification />

        {/* User Menu */}
        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
