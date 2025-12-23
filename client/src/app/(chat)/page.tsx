"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import BorderAnimatedContainer from "@/components/ui/BorderAnimatedContainer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import ProfileHeader from "@/components/chat/ProfileHeader";
import ActiveTabSwitch from "@/components/chat/ActiveTabSwitch";
import ChatsList from "@/components/chat/ChatsList";
import ContactList from "@/components/chat/ContactList";
import ChatContainer from "@/components/chat/ChatContainer";
import NoConversationPlaceholder from "@/components/chat/placeholders/NoConversationPlaceholder";

export default function ChatPage() {
  const { activeTab, selectedUser, hydrate } = useChatStore();

  // Hydrate localStorage settings on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <ErrorBoundary>
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </ErrorBoundary>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          <ErrorBoundary>
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </ErrorBoundary>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
