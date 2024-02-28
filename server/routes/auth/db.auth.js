import { db } from '../../config/db.config.js';
import { ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

// Create users
const createUsers = async (user) => {
    try {
        const params = {
            TableName: 'users',
            Item: {
                id: { S: user.id },
                email: { S: user.email },
                password: { S: user.password },
                createdAt: { S: user.createdAt }
            }
        }

        await db.send(new PutItemCommand(params));
        console.log('Create user successfully');
        return { success: true, data: user };

    } catch (error) {
        console.error('Create user failed:', error);
        return { success: false, data: null };
    }
};

export {
    createUsers,
}