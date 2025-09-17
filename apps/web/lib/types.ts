import { UIMessage as BaseUIMessage, FileUIPart } from 'ai';

export interface ChatMetadata {
    model: string | undefined;
    toggleWebSearch: boolean;
}

export interface UIMessage extends BaseUIMessage {
    attachments?: FileUIPart[];
}
