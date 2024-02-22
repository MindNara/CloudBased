import { db } from '../../db.config.js';
import { ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

// Read all posts
const readAllPosts = async () => {
    try {
        const { Items = [] } = await db.send(new ScanCommand({
            TableName: 'posts'
        }));
        return { success: true, data: Items };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};

// Create posts
const createPosts = async (post) => {
    try {
        const params = {
            TableName: 'posts',
            Item: {
                id: { S: post.id },
                title: { S: post.title },
                detail: { S: post.detail },
                images: { SS: post.image },
                timestamp: { S: post.timestamp },
            },
        };

        await db.send(new PutItemCommand(params));
        console.log('Create post successfully');
        return { success: true, data: post };
    } catch (error) {
        console.error('Create post failed:', error);
        return { success: false, data: null };
    }
};

// Update posts
const updatePosts = async (post) => {
    try {
        const params = {
            TableName: 'posts',
            Key: {
                id: { S: post.id },
            },
            UpdateExpression: 'SET #title = :title, #detail = :detail, #timestamp = :timestamp',
            ExpressionAttributeNames: {
                '#title': 'title',
                '#detail': 'detail',
                '#timestamp': 'timestamp',
            },
            ExpressionAttributeValues: {
                ':title': { S: post.title },
                ':detail': { S: post.detail },
                ':timestamp': { S: post.timestamp },
            },
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await db.send(new UpdateItemCommand(params));
        console.log('Update successful:', result);

        return { success: true, data: result.Attributes };

    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, data: null };
    }
};

// Delete posts
const deletePosts = async (postId) => {
    try {
        const params = {
            TableName: 'posts',
            Key: {
                id: { S: postId },
            },
        };

        await db.send(new DeleteItemCommand(params));
        console.log('Delete Post ID ' + postId + ' successful');

        return { success: true, message: 'Delete Post ID ' + postId + ' successful' };

    } catch (error) {
        console.error('Deleted failed:', error);
        return { success: false, data: null };
    }
};

export {
    readAllPosts,
    createPosts,
    updatePosts,
    deletePosts
}