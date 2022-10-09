import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../data';
import { Product } from '../models';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const id = event.pathParameters.productId;
    let product: Product;
    for(let i = 0; i < products.length; i++) {
        if(products[i].id === id) {
            product = products[i];
        }
    }

    if(product === undefined) {
        throw 'Product was not found';
    }

    return {
        statusCode: 200,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
        products: product
        }),
    };
  }
  catch(e) {
    return {
        statusCode: 500,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        },
        body: e,
    }
  }
};

export const main = middyfy(getProductsById);
