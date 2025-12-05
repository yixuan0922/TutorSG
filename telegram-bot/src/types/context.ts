import { Context } from 'telegraf';
import type { Tutor } from '../../../shared/schema.js';

export interface SessionData {
  tutor?: Tutor;
  linkingEmail?: string;
  awaitingInput?: {
    type: 'email' | 'subject' | 'level' | 'location' | 'rate' | 'application_message';
    data?: any;
  };
  selectedPreferences?: {
    subjects?: string[];
    levels?: string[];
    locations?: string[];
  };
  pendingApplication?: {
    jobId: string;
    skipMessage?: boolean;
  };
}

export interface BotContext extends Context {
  session: SessionData;
  tutor?: Tutor;
}
