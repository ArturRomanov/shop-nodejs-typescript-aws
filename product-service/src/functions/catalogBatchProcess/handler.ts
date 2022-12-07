import { middyfy } from '@libs/lambda';
import { SNS, DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const sns = new SNS();
const dynamoDB = new DynamoDB.DocumentClient();

const catalogBatchProcess = async (event) => {
    console.log(event);
    const products = [];
 
    try {
      event.Records.forEach(product => {
        products.push(JSON.parse(product.body))
      })
 
      await products.forEach(async (product) => {
        const paramsProducts = {
          TableName: 'products',
          Item: {
            id: uuidv4(),
            title: product.title,
            description: product.description,
            price: product.price,
          },
        }
 
        const paramsStocks = {
          TableName: 'stocks',
          Item: {
            product_id: uuidv4(),
            count: product.count,
          },
        }
 
        await dynamoDB.put(paramsProducts).promise()
        await dynamoDB.put(paramsStocks).promise()
      })
 
      await sns.publish({
        Subject: 'The products have been created',
        Message: JSON.stringify(products),
        TopicArn: process.env.SNS_ARN,
      }).promise()
 
    } catch (error) {
      console.error(error)
    }
 
    return JSON.stringify(products)
  };
  
  export const main = middyfy(catalogBatchProcess);
