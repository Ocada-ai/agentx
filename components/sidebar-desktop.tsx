"use client";
import { Sidebar } from "@/components/sidebar";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChatHistory } from "@/components/chat-history";
import {
  IconPlus,
  IconData,
  IconModel,
  IconPromptHistory,
  IconTools,
} from "@/components/ui/icons";
import { auth } from "@/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { redirect } from "next/navigation";

export function SidebarDesktop() {
  const wallet = useWallet();
  const handleUrl = () => {
    redirect("/");
  };

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full bg-[#171717] duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[220px] min-h-screen px-5 pt-4 h-full flex-col dark:bg-[#171717]">
      <div className="flex h-full flex-col">
        <Image alt="ocada" src="/OCADA.svg" width={92} height={92} />
        <div className="mt-5 mb-3 ">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full justify-start bg-[#171717] px-4 shadow-none transition-colors hover:bg-zinc-200/40 border-none mb-2 rounded-full ring-[3px] ring-[#1a1a1a] text-type-600 text-opacity-50"
            )}
            onClick={handleUrl}
          >
            <IconPlus className="-translate-x-2" />
            New Chat
          </Link>
        </div>
        <menu className="flex flex-col">
          {/* <h2>Features Coming soon...</h2> */}
          <div className="flex flex-col gap-5 mb-3 pointer-events-none">
            {/* <Link
              href="/"
              className="text-base text-type-600 text-opacity-50 font-medium flex gap-2 items-center"
            >
              <IconData className="stroke-type-600 opacity-50" />
              Data
            </Link> */}
            <Link
              href="/"
              className="text-sm text-type-600 text-opacity-50 font-medium flex gap-2 items-center pointer-events-none cursor-not-allowed"
            >
              <IconModel className="stroke-type-600 opacity-20" />
              <span className="opacity-50 pointer-events-none">
                Agents{" "}
                <span className="text-xs font-normal">(coming soon...)</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm text-type-600 text-opacity-50 font-medium flex gap-2 items-center pointer-events-none cursor-not-allowed"
            >
              <IconModel className="stroke-type-600 opacity-20" />
              <span className="opacity-50 pointer-events-none">
                Model{" "}
                <span className="text-xs font-normal">(coming soon...)</span>
              </span>
            </Link>
            <p className="text-sm text-type-600 text-opacity-50 font-medium flex gap-2 items-center">
              <IconPromptHistory className="stroke-type-600 opacity-50" />
              History
            </p>
          </div>
        </menu>

        {wallet && wallet.publicKey && (
          <ChatHistory userId={wallet.publicKey?.toString()} />
        )}
      </div>
    </Sidebar>
  );
}
