import { UserLimitHandler } from '../user_limit/handler.js';
import { KinesisStreamEvent, Context, Callback } from 'aws-lambda';
import { InMemoryUserLimitRepository } from '../user_limit/repository/in_memory.js';
import { join } from 'path';
import fs from 'fs';

function processEventsToKinesis(): KinesisStreamEvent {
    // Get the events data
    const projectRoot = process.cwd();
    const eventsPath = join(projectRoot, 'events.json');
    const eventsData = fs.readFileSync(eventsPath, 'utf-8');
    const events = JSON.parse(eventsData);

    if (!Array.isArray(events)) {
        throw new Error('Expected events.json to contain an array of events');
    }
    
    // Create Kinesis Records
    const records = events.map((event, index) => ({
        kinesis: {
            data: Buffer.from(JSON.stringify(event)).toString('base64'),
            partitionKey: '1',
            sequenceNumber: index.toString(),
            approximateArrivalTimestamp: Date.now() / 1000,
            kinesisSchemaVersion: '1.0'
        },
        eventSource: 'aws:kinesis',
        eventVersion: '1.0',
        eventID: '{ShardID}',
        eventName: 'aws:kinesis:record',
        invokeIdentityArn: 'arn:aws:iam::{AccountID}:role/{RoleName}',
        awsRegion: 'us-east-1',
        eventSourceARN: 'arn:aws:kinesis:us-east-1:{AccountID}:stream/{StreamName}'
    }));
    
    return {
        Records: records
    };
}

// Example usage
const kinesisEvent = processEventsToKinesis();

const repository = new InMemoryUserLimitRepository();
const handler = new UserLimitHandler(repository);

(async () => {
  try {
    console.log('Starting test...');
    await handler.handleEvent(kinesisEvent);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();