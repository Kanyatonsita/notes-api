const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');

const updateNotes = async(event, context) => {

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});

    const requestBody = JSON.parse(event.body)
    const {id, title, text} = requestBody

    const {Items} = await db.scan({
        TableName: ' notes-db'
    }).promise()

    const updateNote = Items.find((note) => note.id === id)

    const createdAt = new Date().toISOString;
    const modifiedAt = `${createdAt}` 

    try {
        await db.update({
            TableName: 'notes-db',
            Key : { id: updateNote.id },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: 'set #noteText = :text, #noteTitle = :title, modifiedAt = :modifiedAt',
            ExpressionAttributeValues: {
                ':text' : text,
                ':title' : title,
                ':modifiedAt' : modifiedAt
            },
            ExpressionAttributeNames: {
                '#noteText' : 'text',
                '#noteTitle' : 'title'

            }
        }).promise();

        return sendResponse(200, { success: true, message : 'note updatet successfully' });
    } catch (error) {
        return sendResponse(500, { success: false, message : 'could not update note'});
    }

}

const handler = middy(updateNotes)
     .use(validateToken)
     

module.exports = { handler };