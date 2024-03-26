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
        <article className="lg:grid grid-cols-16 gap-1 mx-auto">
          <main className="col-start-1 col-end-13 relative">{children}</main>
          <aside className="col-span-4 col-start-13 overflow-y-scroll">
            <RightSidebar />
          </aside>
        </article>
      </div>
    </div>
  );
}

export const runtime = "edge";
