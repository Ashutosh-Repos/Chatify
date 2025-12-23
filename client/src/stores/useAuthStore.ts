"use client";

import { create } from "zustand";
import { signIn, signOut } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import type { User, LoginData, SignupData } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface AuthState {
  authUser: User | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { profilePic: string }) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/check", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        set({ authUser: data });
        get().connectSocket();
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data): Promise<boolean> => {
    set({ isSigningUp: true });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Signup failed");
      }

      // Use NextAuth signIn
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Login after signup failed");
      }

      // Fetch user data
      const userRes = await fetch("/api/auth/check", { credentials: "include" });
      if (userRes.ok) {
        const user = await userRes.json();
        set({ authUser: user });
        get().connectSocket();
      }

      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data): Promise<boolean> => {
    set({ isLoggingIn: true });
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid credentials");
      }

      // Fetch user data after successful login
      const userRes = await fetch("/api/auth/check", { credentials: "include" });
      if (userRes.ok) {
        const user = await userRes.json();
        set({ authUser: user });
        get().connectSocket();
        toast.success("Logged in successfully!");
        return true;
      } else {
        throw new Error("Failed to get user data");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false });
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Update failed");
      }

      const updatedUser = await res.json();
      set({ authUser: updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    // Listen for new messages at socket level
    newSocket.on("newMessage", (newMessage: { senderId: string; [key: string]: unknown }) => {
      // Import dynamically to avoid circular dependency
      const { useChatStore } = require("./useChatStore");
      const chatState = useChatStore.getState();
      const { selectedUser, messages } = chatState;
      
      // Only add to messages if from selected user
      if (selectedUser && newMessage.senderId === selectedUser.id) {
        useChatStore.setState({ messages: [...messages, newMessage] });
        
        // Play sound if enabled
        if (chatState.isSoundEnabled && typeof window !== "undefined") {
          const sound = new Audio("/sounds/notification.mp3");
          sound.play().catch(() => {});
        }
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));
