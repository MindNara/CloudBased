import { db } from '../../config/db.config.js';
import { ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

// Read all comments
const readAllComments = async () => {
    try {
        const { Items = [] } = await db.send(new ScanCommand({
            TableName: 'comments'
        }));
        return { success: true, data: Items };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};

// Create Comment
const createComments = async (comment) => {

    try {
        const params = {
            TableName: 'comments',
            Item: {
                id: { S: comment.id },
                post_id: { S: comment.postId },
                message: { S: comment.message },
                time_stamp: { S: comment.timestamp },
                user_id: { S: comment.userId },
            },
        };

        await db.send(new PutItemCommand(params));
        console.log('Create comment successfully');
        return { success: true, data: comment };
    } catch (error) {
        console.error('Create comment failed: ', error);
        return { success: false, data: null };
    }

};

// Update comment
const updateComments = async (comment) => {
    try {
        const params = {
            TableName: 'comments',
            Key: {
                id: { S: comment.id },
            },
            UpdateExpression: 'SET #message = :message, #time_stamp = :time_stamp',
            ExpressionAttributeNames: {
                '#message': 'message',
                '#time_stamp': 'time_stamp',
            },
            ExpressionAttributeValues: {
                ':message': { S: comment.message },
                ':time_stamp': { S: comment.timestamp },
            },
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await db.send(new UpdateItemCommand(params));
        console.log('Update successful: ', result);

        return { success: true, data: result.Attributes };

    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, data: null };
    }
};

// Delete Comment
const deleteComments = async (commentId) => {
    try {
        const params = {
            TableName: 'comments',
            Key: {
                id: { S: commentId },
            },
        };

        await db.send(new DeleteItemCommand(params));
        console.log('Delete Comment ID ' + commentId + ' successful');

        return { success: true, message: 'Delete Comment ID ' + commentId + ' successful' };

    } catch (error) {
        console.error('Deleted failed:', error);
        return { success: false, data: null };
    }
};

export {
    readAllComments,
    createComments,
    updateComments,
    deleteComments
}