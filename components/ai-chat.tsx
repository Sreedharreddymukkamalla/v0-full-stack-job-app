"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { GlobeIcon, Paperclip } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";

const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  }
];

const AIChat = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const { messages, sendMessage, status, stop, regenerate, error } = useChat();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage(
        { text: input, files },
        {
          body: {
            model: model,
            webSearch: webSearch,
          },
        }
      );
      setInput("");
      setFiles(undefined);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative h-[calc(100vh-6rem)] border rounded-lg overflow-hidden">
      <div className="flex flex-col h-full">
        <Conversation className="flex-1 overflow-auto">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" && (
                  <Sources>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "source-url":
                          return (
                            <>
                              <SourcesTrigger
                                count={
                                  message.parts.filter(
                                    (part) => part.type === "source-url"
                                  ).length
                                }
                              />
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            </>
                          );
                      }
                    })}
                  </Sources>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        case "reasoning":
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === "streaming"}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        case "file":
                          // file parts: render images or file links
                          if (part.mediaType?.startsWith("image/")) {
                            return (
                              <img
                                key={`${message.id}-${i}`}
                                src={part.url}
                                alt={part.filename ?? "image"}
                                className="max-w-full rounded"
                              />
                            );
                          }
                          return (
                            <a
                              key={`${message.id}-${i}`}
                              href={part.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 underline"
                            >
                              {part.filename ?? part.url}
                            </a>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
                {message.role === "assistant" && (
                  <div className="mt-2">
                    <button
                      onClick={() => regenerate && regenerate()}
                      disabled={!(status === "ready" || status === "error")}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error && (
          <div className="mb-2 p-2 bg-red-50 border rounded text-sm text-red-700">
            <div className="font-medium">An error occurred.</div>
            <div className="truncate">{error instanceof Error ? error.message : String(error)}</div>
            <div className="mt-2">
              <button
                onClick={() => regenerate && regenerate()}
                className="px-3 py-1 rounded bg-gray-100 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            disabled={status !== "ready"}
          />
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) setFiles(e.target.files);
            }}
          />

          {/* Selected files preview */}
          {files && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {Array.from(files).map((f, idx) => (
                <div key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {f.name}
                </div>
              ))}
            </div>
          )}

          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>

              <PromptInputButton
                variant={files ? "default" : "ghost"}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files"
              >
                <Paperclip size={16} />
              </PromptInputButton>
            </PromptInputTools>
            {status === "submitted" || status === "streaming" ? (
              <PromptInputButton
                variant="destructive"
                onClick={() => stop && stop()}
              >
                Stop
              </PromptInputButton>
            ) : (
              <PromptInputSubmit disabled={!input && !files} status={status} />
            )}
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default AIChat;
