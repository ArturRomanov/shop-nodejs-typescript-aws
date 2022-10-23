import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

import schema from './schema';

const dynamoDB = new DynamoDB.DocumentClient();

const put = async (params) => {
    try {
      await dynamoDB.put(params).promise();
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

const validateData = (data) => {
    if (typeof data.title !== 'string' || data.title.length > 100) {
        return 'Title has to be string';
    }
    if (typeof data.description !== 'string' || data.description.length > 500) {
        return 'Description has to be string';
    }
    if (typeof data.pricing !== 'number') {
        return 'Pricing has to be number';
    }
    if (typeof data.count !== 'number') {
        return 'Counts has to be number';
    }
}

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    try {
      console.log(event);
      const data = event.body;
      const validate = validateData(data);
      if (typeof validate === 'string') {
        return {
            statusCode: 400,
            headers: { 
              'Content-Type': 'text/plain'
            },
            body: JSON.stringify(validate)
          }
      }
      const id = uuidv4();
      await put({ TableName: 'products', Item: { id: id, title: data.title, description: data.description, price: data.price }});
      let count = 0;
      if (data.count && typeof data.count === 'number') {
        count = data.count;
      }
      await put({TableName: 'stocks', Item: { product_id: id, count: data.count }});
      const result = data;
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ products: result }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: { 
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(error)
      }
    }
  };
  
  export const main = middyfy(createProduct);
