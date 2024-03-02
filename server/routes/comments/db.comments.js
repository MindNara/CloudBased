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

// Get comment by ID
const getCommentByComId = async (commentId) => {
    try {
        const params = {
            TableName: 'comments',
            Key: {
                id: { S: commentId }
            }
        };

        const command = new GetItemCommand(params);
        const result = await db.send(command);
        return { success: true, data: result.Item };

    } catch (error) {

    }
}

// Get comment by Post ID
const getCommentById = async (postId) => {
    try {
        const params = {
            TableName: 'comments',
            FilterExpression: 'post_id = :post_id',
            ExpressionAttributeValues: {
                ':post_id': { S: postId }
            }
        };

        const command = new ScanCommand(params);
        const result = await db.send(command);

        if (result && result.Items) {
            return { success: true, data: result.Items };
        } else {
            return { success: false, data: null };
        }

    } catch (error) {

    }
}

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

        const updateParams = {
            TableName: 'posts',
            Key: { id: { S: comment.postId } },
            UpdateExpression: 'SET #comment = if_not_exists(#comment, :start) + :inc',
            ExpressionAttributeNames: {
                '#comment': 'comment',
            },
            ExpressionAttributeValues: {
                ':inc': { N: '1' },
                ':start': { N: '0' },
            },
        };

        await db.send(new UpdateItemCommand(updateParams));

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
const deleteComments = async (commentId, postId) => {
    try {
        const params = {
            TableName: 'comments',
            Key: {
                id: { S: commentId },
            },
        };

        await db.send(new DeleteItemCommand(params));

        const updateParams = {
            TableName: 'posts',
            Key: { id: { S: postId } },
            UpdateExpression: 'SET #comment = if_not_exists(#comment, :start) - :dec',
            ExpressionAttributeNames: {
                '#comment': 'comment',
            },
            ExpressionAttributeValues: {
                ':dec': { N: '1' },
                ':start': { N: '0' },
            },
        };

        await db.send(new UpdateItemCommand(updateParams));

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
    deleteComments,
    getCommentById,
    getCommentByComId
}