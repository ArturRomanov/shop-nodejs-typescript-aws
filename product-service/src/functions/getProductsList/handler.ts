import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

import schema from './schema';

const dynamoDB = new DynamoDB.DocumentClient();

const scan = async (params) => {
  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items;
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

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log(event);
    const products = await scan({ TableName: 'products'});
    const stocks = await scan({TableName: 'stocks'});
    let result: any;
    if (Array.isArray(products) && Array.isArray(stocks)) {
      result = products.map(product => {
        const stockOfProduct = stocks.find(stock => product.id === stock.product_id);
        return { ...product, count: stockOfProduct ? stockOfProduct.count : 0 };
      })
    }
    else {
      
      throw 'Products or stocks is not array';
    }
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

export const main = middyfy(getProductsList);
