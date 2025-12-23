"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";

export default function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  const isOnline = selectedUser ? onlineUsers.includes(selectedUser.id) : false;

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-6 flex-1">
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full overflow-hidden relative">
            <Image
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <X className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
