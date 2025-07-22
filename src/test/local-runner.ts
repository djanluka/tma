import { UserLimitHandler } from '../user_limit/handler.js';
import { KinesisStreamEvent, Context, Callback } from 'aws-lambda';
import { InMemoryUserLimitRepository } from '../user_limit/repository/in_memory.js';

const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'testFunction',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:testFunction',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/testFunction',
  logStreamName: '2023/01/01/[$LATEST]testStream',
  getRemainingTimeInMillis: () => 5000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

const testEvent: KinesisStreamEvent = {
  Records: [
    {
      kinesis: {
          data: Buffer.from(JSON.stringify({
          aggregateId: "VijPYTEOgK7dxLs5fBjJ",
          context: {
            correlationId: "hVyFHScCNAmSyAPulhtsQ"
          },
          createdAt: 1647946090824,
          eventId: "Qqko31j8InLTSeA5smpC",
          payload: {
            activeFrom: 1647946090824,
            brandId: "000000000000000000000001",
            currencyCode: "SEK",
            nextResetTime: 1650624490824,
            period: "MONTH",
            status: "ACTIVE",
            type: "DEPOSIT",
            userId: "VijPYTEOgK7dxLs5fBjJ",
            userLimitId: "jIcDgFDxkhM2qRWFrwVn",
            value: "250000"
          },
          sequenceNumber: 5,
          source: "limitUser",
          type: "USER_LIMIT_CREATED"
        })).toString('base64'),
          partitionKey: '1',
          sequenceNumber: '1',
          approximateArrivalTimestamp: Date.now() / 1000,
          kinesisSchemaVersion: ''
      },
      eventSource: 'aws:kinesis',
      eventVersion: '1.0',
      eventID: '1',
      eventName: 'aws:kinesis:record',
      invokeIdentityArn: 'arn:aws:iam::123456789012:role/lambda-role',
      awsRegion: 'us-east-1',
      eventSourceARN: 'arn:aws:kinesis:us-east-1:123456789012:stream/user-limit-stream'
    }
  ]
};

const repository = new InMemoryUserLimitRepository();
const handler = new UserLimitHandler(repository);

(async () => {
  try {
    console.log('Starting test...');
    await handler.handleEvent(testEvent);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();