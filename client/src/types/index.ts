export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePic: string | null;
}

export interface Message {
  id: string;
  text: string | null;
  image: string | null;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt?: string;
  isOptimistic?: boolean;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
