import { SidebarDesktop } from "@/components/sidebar-desktop";
import RightSidebar from "@/components/right-sidebar";
import "@/app/globals.scss";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <SidebarDesktop />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:ml-[220px] peer-[[data-state=open]]:xl:ml-[220px]">
        <main className="xl:mr-[320px] bg-transparent pb-[120px] pt-4 md:pt-10">
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

export const runtime = "edge";
