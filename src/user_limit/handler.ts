// user-limit-handler.ts
import {  UserLimitEvent, EventType, UserLimit, UserLimitCreatedEvent, UserLimitProgressChangedEvent, UserLimitResetEvent } from './types.js';
import { UserLimitRepository } from './repository/in_memory.js';
import { KinesisStreamEvent } from 'aws-lambda';

export class UserLimitHandler {
  constructor(private repository: UserLimitRepository) {}

  async handleEvent(event: KinesisStreamEvent): Promise<void> {
    for (const record of event.Records) {
      try {
        const data = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
        const userLimitEvent: UserLimitEvent = JSON.parse(data);
        
        switch (userLimitEvent.type) {
          case EventType.USER_LIMIT_CREATED:
            await this.handleUserLimitCreated(userLimitEvent);
            break;
          case EventType.USER_LIMIT_PROGRESS_CHANGED:
            await this.handleUserLimitProgressChanged(userLimitEvent);
            break;
          case EventType.USER_LIMIT_RESET:
            await this.handleUserLimitReset(userLimitEvent);
            break;
          default:
            console.warn(`❓Unknown event type: ${(userLimitEvent as any).type}`);
        }
      } catch (error) {
        console.error('❌ Error processing record:', error);
      }
    }
  }

  private async handleUserLimitCreated(userLimit: UserLimitCreatedEvent): Promise<void> {
    const created = await this.repository.create(userLimit.payload);
    if (!created.isOk()) {
      console.warn(`⚠️ User limit not created: ${created.error}`);
      return;
    }
    console.log(`✅ Created new user limit: ${userLimit.payload.userLimitId}`);
  }

  private async handleUserLimitProgressChanged(userLimit: UserLimitProgressChangedEvent): Promise<void> {
    const updated = await this.repository.updateProgress(userLimit.payload);
    if (!updated.isOk()) {
      console.warn(`⚠️ User limit not updated: ${updated.error}`);
      return;
    }
    console.log(`✅ Updated progress for limit ${userLimit.payload.userLimitId}`);
  }

  private async handleUserLimitReset(userLimit: UserLimitResetEvent): Promise<void> {
    const reset = await this.repository.resetProgress(userLimit.payload);
    if (!reset.isOk()) {
      console.warn(`⚠️ User limit not reset: ${reset.error}`);
      return;
    }
    console.log(`✅ Reset progress for limit ${userLimit.payload.userLimitId}`);
  }
}