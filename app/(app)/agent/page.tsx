'use client';

import AiChat from "@/components/ai-chat";
import { ModeSwitcher } from "@/components/mode-switcher";

export default function AIAgentPage() {
  return (
    <>
      <header className="flex justify-end p-4">
        <ModeSwitcher />
      </header>
      <AiChat />
    </>
  );
}