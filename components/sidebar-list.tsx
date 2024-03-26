import { getChats } from "@/app/supabase";
import { ClearHistory } from "@/components/clear-history";
import { SidebarItems } from "@/components/sidebar-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { cache, useEffect, useState } from "react";

interface SidebarListProps {
  userId?: string;
  children?: React.ReactNode;
}

export function SidebarList({ userId }: SidebarListProps) {
  const [chats, setChats] = useState<[] | null>(null);

  useEffect(() => {
    const fetchFunc = async () => {
      const data: any = await getChats(userId as any);
      setChats(data);
    };
    if (chats == null) fetchFunc();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-full">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-1 relative">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="pt-2">
            <p className="text-sm text-type-600 text-opacity-60 ml-7">
              No chat history
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between py-4 px-0 mt-auto">
        {/* <ThemeToggle /> */}
        {/* <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} /> */}
        <ClearHistory isEnabled={true} />
      </div>
    </div>
  );
}
