import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

import schema from './schema';

const dynamoDB = new DynamoDB.DocumentClient();

const query = async (params) => {
  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items[0] || null;
  } catch(error) {
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(error)
    }
  }
}

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log(event);
    const id = event.pathParameters.productId;
    const product: any = await query({ TableName: 'products',
                                      KeyConditionExpression: 'id = :id',
                                      ExpressionAttributeValues: { ':id': id}
                                    })
    if(!product) {
        throw 'Product was not found';
    }

    return {
        statusCode: 200,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({products: product}),
    };
  }
  catch(error) {
    return {
        statusCode: 500,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(error),
    }
  }
};

export const main = middyfy(getProductsById);
