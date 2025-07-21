// lambda.ts
import { Context, KinesisStreamEvent, KinesisStreamHandler } from 'aws-lambda';
import { InMemoryUserLimitRepository } from '../user_limit/repository/in_memory.js';
import { UserLimitHandler } from '../user_limit/handler.js';

const repository = new InMemoryUserLimitRepository();
const handler = new UserLimitHandler(repository);

export const processUserLimitEvents: KinesisStreamHandler = async (event: KinesisStreamEvent, context: Context) => {
  try {
    await handler.handleEvent(event);
  } catch (error) {
    console.error('Error processing events:', error);
    throw error;
  }
};