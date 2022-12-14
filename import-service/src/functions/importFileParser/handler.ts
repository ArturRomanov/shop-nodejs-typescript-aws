import { middyfy } from '@libs/lambda';
import { S3,SQS } from 'aws-sdk';
import csv from 'csv-parser';

const s3 = new S3();
const sqs = new SQS();

const BUCKET = 'awsnodejsuploaded';

const importFileParser = async (event) => {
    try {
      console.log(event);
      const s3Key = event.Records[0].s3.object.key;
      const s3ReadStream = await s3.getObject({ Bucket: BUCKET, Key: s3Key }).createReadStream();
      const result = [];
      await new Promise<void>((resolve, reject) => {
        s3ReadStream.pipe(csv()).on('data', (data) => {
            result.push(data)
        }).on('error', (error) => reject(error)).on('end', () => resolve())
      })
      for (const item of result) {
        const params = {
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(item)
        }
 
        await sqs.sendMessage(params).promise()
      }
 
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(result)
      }
    }
    catch (error) {
      return {
        statusCode: 500,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(error)
      }
    }
  };
  
  export const main = middyfy(importFileParser);
