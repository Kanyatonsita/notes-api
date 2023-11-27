const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');

const updateNotes = async(event, context) => {

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});

    const requestBody = JSON.parse(event.body);

    

}

const handler = middy(updateNotes)
     .use(validateToken)
     

module.exports = { handler };