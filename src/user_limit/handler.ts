// user-limit-handler.ts
import { UserLimit, LimitStatus, LimitType, LimitPeriod } from './types.js';
import { UserLimitRepository } from './repository/in_memory.js';
import { KinesisStreamEvent } from 'aws-lambda';

interface UserLimitCreatedEvent {
  type: 'USER_LIMIT_CREATED';
  userId: string;
  userLimitId: string;
  brandId: string;
  currencyCode: string;
  limitType: LimitType;
  limitValue: string;
  limitPeriod: LimitPeriod;
  activeFrom: number;
  activeUntil?: number;
  previousLimitValue?: string;
}

interface UserLimitProgressChangedEvent {
  type: 'USER_LIMIT_PROGRESS_CHANGED';
  userLimitId: string;
  progress: string;
}

interface UserLimitResetEvent {
  type: 'USER_LIMIT_RESET';
  userLimitId: string;
}

type UserLimitEvent = UserLimitCreatedEvent | UserLimitProgressChangedEvent | UserLimitResetEvent;

export class UserLimitHandler {
  constructor(private repository: UserLimitRepository) {}

  async handleEvent(event: KinesisStreamEvent): Promise<void> {
    for (const record of event.Records) {
      try {
        const data = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
        const userLimitEvent: UserLimitEvent = JSON.parse(data);
        
        switch (userLimitEvent.type) {
          case 'USER_LIMIT_CREATED':
            await this.handleUserLimitCreated(userLimitEvent);
            break;
          case 'USER_LIMIT_PROGRESS_CHANGED':
            await this.handleUserLimitProgressChanged(userLimitEvent);
            break;
          case 'USER_LIMIT_RESET':
            await this.handleUserLimitReset(userLimitEvent);
            break;
          default:
            console.warn(`Unknown event type: ${(userLimitEvent as any).type}`);
        }
      } catch (error) {
        console.error('Error processing record:', error);
        // In production, you might want to send failed events to a DLQ
      }
    }
  }

  private async handleUserLimitCreated(event: UserLimitCreatedEvent): Promise<void> {
    const newLimit: Omit<UserLimit, 'createdAt'> = {
      userId: event.userId,
      userLimitId: event.userLimitId,
      brandId: event.brandId,
      currencyCode: event.currencyCode,
      type: event.limitType,
      value: event.limitValue,
      period: event.limitPeriod,
      activeFrom: event.activeFrom,
      activeUntil: event.activeUntil,
      previousLimitValue: event.previousLimitValue,
      progress: '0',
      status: this.determineInitialStatus(event.activeFrom),
    };
    
    await this.repository.create(newLimit);
    console.log(`Created new user limit: ${event.userLimitId}`);
  }

  private determineInitialStatus(activeFrom: number): LimitStatus {
    const now = Date.now();
    if (activeFrom > now) return LimitStatus.FUTURE;
    return LimitStatus.ACTIVE;
  }

  private async handleUserLimitProgressChanged(event: UserLimitProgressChangedEvent): Promise<void> {
    const updatedLimit = await this.repository.updateProgress(event.userLimitId, event.progress);
    if (!updatedLimit) {
      console.warn(`User limit not found: ${event.userLimitId}`);
      return;
    }
    console.log(`Updated progress for limit ${event.userLimitId} to ${event.progress}`);
  }

  private async handleUserLimitReset(event: UserLimitResetEvent): Promise<void> {
    const updatedLimit = await this.repository.resetProgress(event.userLimitId);
    if (!updatedLimit) {
      console.warn(`User limit not found: ${event.userLimitId}`);
      return;
    }
    console.log(`Reset progress for limit ${event.userLimitId}`);
  }
}