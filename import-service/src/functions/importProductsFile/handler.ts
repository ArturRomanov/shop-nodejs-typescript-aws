import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';
import schema from './schema';

const s3 = new S3();

const BUCKET = 'awsnodejsuploaded';
const FILE_TYPE= 'text/csv';


const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log(event);
    const { name: fileName } = event.queryStringParameters || {};
    if (!fileName || (!fileName.includes('.csv'))) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify('Type has to be csv')
      }
    }
    const params = {
      Bucket: BUCKET,
      Key: `uploaded/${fileName}`,
      ContentType: FILE_TYPE,
    }
    const url = await s3.getSignedUrlPromise('putObject', params);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(url)
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

export const main = middyfy(importProductsFile);
