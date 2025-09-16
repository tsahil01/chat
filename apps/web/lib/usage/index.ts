export const FREE_LIMIT = 50;
export const PRO_LIMIT = 1000;

export interface UsageData {
    userId: string;
    currentUsage: number;
    limit: number;
    remaining: number;
    isProUser: boolean;
    month: string;
    resetDate: Date;
}