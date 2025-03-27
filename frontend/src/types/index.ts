export interface User {
    id: number;
    email: string;
    username: string;
    status: UserStatus;
    isActive: boolean;
    createdAt: string;
}

export enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    AWAY = "away",
    BUSY = "busy"
}

export interface Chat {
    id: number;
    name: string;
    isGroup: boolean;
    createdAt: string;
    participants: ChatParticipant[];
}

export interface ChatParticipant {
    id: number;
    userId: number;
    chatId: number;
    joinedAt: string;
    user: User;
}

export interface Message {
    id: number;
    chatId: number;
    content: string;
    sender: User;
    createdAt: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface PrivateKey {
    id: number;
    userId: number;
    key: string;
    createdAt: string;
} 