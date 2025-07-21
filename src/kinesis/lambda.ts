// lambda.ts
import { KinesisStreamHandler } from 'aws-lambda';
import { InMemoryUserLimitRepository } from '../user_limit/repository/in_memory';
import { UserLimitHandler } from '../user_limit/handler';

const repository = new InMemoryUserLimitRepository();
const handler = new UserLimitHandler(repository);

export const processUserLimitEvents: KinesisStreamHandler = async (event) => {
  try {
    await handler.handleEvent(event);
    return;
  } catch (error) {
    console.error('Error processing events:', error);
    return;
  }
};