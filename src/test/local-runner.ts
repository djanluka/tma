import { processUserLimitEvents } from '../kinesis/lambda.js';
import { KinesisStreamEvent, Context, Callback } from 'aws-lambda';

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
              type: 'USER_LIMIT_CREATED',
              userId: 'user123',
              userLimitId: 'limit456',
              brandId: 'brand789',
              currencyCode: 'USD',
              limitType: 'DEPOSIT',
              limitValue: '1000',
              limitPeriod: 'CALENDAR_DAY',
              activeFrom: Date.now()
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

(async () => {
  try {
    console.log('Starting test...');
    await processUserLimitEvents(testEvent, mockContext, ()=>{});
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();