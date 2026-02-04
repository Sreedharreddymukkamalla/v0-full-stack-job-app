'use client';

import { useMemo, useEffect } from "react";
// @ts-ignore - ChatKit types
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "@/lib/chatkitSession";
// @ts-ignore - ChatKit types
import type { ChatKitOptions } from "@openai/chatkit";
import { useSearchParams } from "next/navigation";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    [],
  );


  const options: ChatKitOptions = {
    api: { getClientSecret },
    theme: {
      colorScheme: "light",
      radius: "pill",
      density: "normal",
      color: {
        accent: {
          primary: "#8beedb",
          level: 1,
        },
      },
      typography: {
        baseSize: 16,
        fontFamily:
          '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontFamilyMono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
        fontSources: [
          {
            family: "OpenAI Sans",
            src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2",
            weight: 400,
            style: "normal",
            display: "swap",
          },
          // ...and 7 more font sources
        ],
      },
    },
    composer: {
      placeholder: "Ask AIM",
      attachments: {
        enabled: true,
        maxCount: 5,
        maxSize: 10485760,
      }
    },
    startScreen: {
      greeting: "Ask Aim",
      prompts: [],
    },
    // Optional fields not shown: locale, initialThread, threadItemActions, header, onClientTool, entities, widgets
  };
  const chatkit = useChatKit(options);

  const searchParams = useSearchParams();

  // Helper: convert HTML -> plain text for safe composer content
  const htmlToText = (html?: string | null) => {
    if (!html) return "";
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
    } catch {
      return html;
    }
  };

  const formatDate = (s?: string | null) => {
    if (!s) return "";
    try {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(s));
    } catch {
      return s;
    }
  };

  // Removed problematic focusComposer call that was causing runtime errors

  // Reload this page every 10 minutes to refresh ChatKit session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = setInterval(() => {
      window.location.reload();
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full rounded-xl bg-card border border-border shadow-sm">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
