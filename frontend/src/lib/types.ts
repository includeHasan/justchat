// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
  role: 'user' | 'admin';
  restricted?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  mobileNo: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  mobileNo: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}