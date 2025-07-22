// user-limit-handler.ts
import {  UserLimitEvent, EventType, UserLimit } from './types.js';
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
            await this.handleUserLimitCreated(userLimitEvent.payload);
            break;
          case EventType.USER_LIMIT_PROGRESS_CHANGED:
            await this.handleUserLimitProgressChanged(userLimitEvent.payload);
            break;
          case EventType.USER_LIMIT_RESET:
            await this.handleUserLimitReset(userLimitEvent.payload);
            break;
          default:
            console.warn(`Unknown event type: ${(userLimitEvent as any).type}`);
        }
      } catch (error) {
        console.error('Error processing record:', error);
      }
    }
  }

  private async handleUserLimitCreated(userLimit: UserLimit): Promise<void> {
    const created = await this.repository.create(userLimit);
    if (!created) {
      throw new Error(`Failed creating UserLimit: ${userLimit.userLimitId}`);
    }
    console.log(`Created new user limit: ${userLimit.userLimitId}`);
  }

  private async handleUserLimitProgressChanged(data: UserLimit): Promise<void> {
    await this.repository.updateProgress(data);
    // if (!updatedLimit) {
    //   console.warn(`User limit not found: ${data.payload.userLimitId}`);
    //   return;
    // }
    console.log(`Updated progress for limit ${data.userLimitId}`);
  }

  private async handleUserLimitReset(data: UserLimit): Promise<void> {
    await this.repository.resetProgress(data);
    // if (!updatedLimit) {
    //   console.warn(`User limit not found: ${data.payload.userLimitId}`);
    //   return;
    // }
    console.log(`Reset progress for limit ${data.userLimitId}`);
  }
}