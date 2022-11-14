import {
  APIGatewayAuthorizerHandler,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';

function decodeAuthorizationToken(token: string) {
   const decodedCredentials = Buffer.from(token, 'base64').toString('utf-8');

   const [ username, password ] = decodedCredentials.split('=');

   return { username, password };
}

function generatePolicy(username: string, methodArn: string, effect: string) {
   return {
     principalId: username,
     policyDocument: {
       Version: '2012-10-17',
       Statement: [
         {
           Action: 'execute-api:Invoke',
           Effect: effect,
           Resource: methodArn
         }
       ]
     }
   };
}

const basicAuthorizer: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  console.log(event);

   try {
     const { authorizationToken, methodArn, type } = event;

     if (type !== 'TOKEN') {
       throw new Error('The type for the authorization has to be token');
     }

     const [ schema, encodedCredentials ] = authorizationToken.split(' ');

     if (schema !== 'Basic') {
       console.log('Token has incorrect schema');

       return generatePolicy('none', methodArn, 'Deny')
     }

     const { username, password } = decodeAuthorizationToken(encodedCredentials);

     return username && password && process.env[username] === password ? generatePolicy(username, methodArn, 'Allow') : generatePolicy(username, methodArn, 'Deny');

   } catch (error) {
     console.log(error.message);

     throw error;
   }
};

export const main = basicAuthorizer;