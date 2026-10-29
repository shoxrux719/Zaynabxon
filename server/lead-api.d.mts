import type { IncomingMessage, ServerResponse } from 'node:http';
export type LeadRequest = IncomingMessage & { body?: unknown };
export type LeadHandler = (req: LeadRequest, res: ServerResponse) => Promise<void>;
export declare function createLeadHandler(options?: {
  getConfig?: () => { token?: string; chatId?: string };
  fetchImpl?: (url: string, options: { method: 'POST'; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
  now?: () => number;
}): LeadHandler;
export declare const handleLead: LeadHandler;
