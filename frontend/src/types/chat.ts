export interface Chat {
    id: number;
    name: string;
    is_group: boolean;
    creator_id: number;
    created_at: string;
    updated_at?: string;
    last_message?: string;
} 