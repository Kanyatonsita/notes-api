const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');
const { nanoid } = require('nanoid'); //unika användar-id


const postNotes = async (event, context) => {
    
    if (event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'Invalid token'});

    const notes = JSON.parse(event.body);

    if (!notes.title || !notes.text){
        return sendResponse(400,{
            success: false, message: 'Please try again!, you need to provide a text and a title'
        });
    }

    if (Object.keys(notes).length > 2){
        return sendResponse(400, {
            success: false, message: 'Please try again!, only text and title are allowed'
        });
    }

    if (notes.title.length > 50){
        return sendResponse(400, {
            success: false, message: 'Please write a shorter Title, title cannot be longer than 50 chars, try again!'
        });
    }

    if (notes.text.length > 400){
        return sendResponse(400, {
            success: false, 
            message: 'Please write a shorter Text, text cannot be longer than 400 chars, try again!'
        });
    }

    const createdAt = new Date().toISOString();
    notes.id = nanoid();
    notes.createdAt = `${createdAt}`;
    notes.modifiedAt = createdAt
    notes.username = event.username

    try{
        await db.put({
            TableName: 'notes-db',
            Item: notes
        }).promise()

        return sendResponse(200, {success: true});
    } catch (error) {
        return sendResponse(500, {success: false});
    }
}

const handler = middy(postNotes)
     .use(validateToken)
     
module.exports = { handler };