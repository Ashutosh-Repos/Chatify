"use client";

import { create } from "zustand";
import toast from "react-hot-toast";
import type { User, Message } from "@/types";
import { useAuthStore } from "./useAuthStore";

interface ChatState {
  allContacts: User[];
  chats: User[];
  messages: Message[];
  activeTab: "chats" | "contacts";
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggleSound: () => void;
  setActiveTab: (tab: "chats" | "contacts") => void;
  setSelectedUser: (user: User | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (data: { text?: string; image?: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: false,
  hydrated: false,

  // Hydrate from localStorage - call this in useEffect
  hydrate: () => {
    if (get().hydrated) return;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isSoundEnabled");
      set({
        isSoundEnabled: saved ? JSON.parse(saved) : false,
        hydrated: true,
      });
    }
  },

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("isSoundEnabled", JSON.stringify(newValue));
    }
    set({ isSoundEnabled: newValue });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (user) => set({ selectedUser: user }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await fetch("/api/messages/contacts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      set({ allContacts: data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch contacts";
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await fetch("/api/messages/chats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      set({ chats: data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch chats";
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await fetch(`/api/messages/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      set({ messages: data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch messages";
      toast.error(msg);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      text: messageData.text || null,
      image: messageData.image || null,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await fetch(`/api/messages/send/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");

      const newMessage = await res.json();
      set({
        messages: get().messages.map((m) =>
          m.id === tempId ? newMessage : m
        ),
      });
    } catch (error) {
      set({ messages: messages });
      const msg = error instanceof Error ? error.message : "Failed to send message";
      toast.error(msg);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove any existing listener to prevent duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage: Message) => {
      // Get fresh selectedUser inside callback to avoid stale closure
      const { selectedUser, messages } = get();
      
      // Only add message if it's from the currently selected user
      if (selectedUser && newMessage.senderId === selectedUser.id) {
        set({ messages: [...messages, newMessage] });

        const { isSoundEnabled } = get();
        if (isSoundEnabled && typeof window !== "undefined") {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
