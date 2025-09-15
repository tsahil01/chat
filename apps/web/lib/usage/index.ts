const FREE_LIMIT = 300;
const PRO_LIMIT = 1000;

interface UsageData {
    userId: string;
    currentUsage: number;
    limit: number;
    remaining: number;
    isProUser: boolean;
    month: string;
    resetDate: Date;
}

export { FREE_LIMIT, PRO_LIMIT, type UsageData };