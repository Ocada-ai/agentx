"use client";

import { IconOcada, IconUser } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-[#262626]">
        <IconUser className="text-type-600" />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1 text-type-600 text-opacity-80">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start md:-ml-12 mb-4",
        className
      )}
    >
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full">
        <IconOcada />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1 text-type-600 text-opacity-80">
        {children}
      </div>
    </div>
  );
}

export function BotCard({
  children,
  showAvatar = true,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start md:-ml-12 mb-4">
      <div
        className={cn(
          "flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground",
          !showAvatar && "invisible"
        )}
      >
        <IconOcada />
      </div>
      <div className="ml-4 flex-1 px-1">{children}</div>
    </div>
  );
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "mt-2 flex items-center justify-center gap-2 text-xs text-gray-500"
      }
    >
      <div className={"max-w-[600px] flex-initial px-2 py-2"}>{children}</div>
    </div>
  );
}
