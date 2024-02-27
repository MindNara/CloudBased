import { db } from '../../db.config.js'
import { ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

// Read all review by subject_id
const readAllReviews = async (subjectId) => {
    try {
        const params = {
            TableName: 'reviews',
            FilterExpression: 'subject_id = :sid',
            ExpressionAttributeValues: {
                ':sid': { S: subjectId }
            }
        };
        const { Items } = await db.send(new ScanCommand(params));
        return { success: true, data: Items };

    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};

// Create Review
const createReviews = async (review) => {
    try {
        const params = {
            TableName: 'reviews',
            Item: {
                review_id: { S: review.id },
                subject_id: { S: review.subjectId },
                detail: { S: review.detail },
                grade: { S: review.grade },
                rating: { S: review.rating },
                // like: { SS: [] },
                // dislike: { SS: [] },
                time_stamp: { S: review.timestamp },
                user_id: { S: review.userId },
            },
        };

        await db.send(new PutItemCommand(params));
        console.log('Create review successfully');
        return { success: true, data: review };
    } catch (error) {
        console.error('Create review failed:', error);
        return { success: false, data: null };
    }
};

// Delete Review
const deleteReviews = async (reviewId) => {
    try {
        const params = {
            TableName: 'reviews',
            Key: {
                review_id: { S: reviewId },
            },
        };

        await db.send(new DeleteItemCommand(params));
        console.log('Delete Review ID ' + reviewId + ' successful');

        return { success: true, message: 'Delete Post ID ' + reviewId + ' successful' };

    } catch (error) {
        console.error('Deleted failed:', error);
        return { success: false, data: null };
    }
};

// Update posts
const updateReviews = async (review) => {
    try {
        const params = {
            TableName: 'reviews',
            Key: {
                review_id: { S: review.review_id },
            },
            UpdateExpression: 'SET #detail = :detail, #grade = :grade, #rating = :rating, #time_stamp = :time_stamp',
            ExpressionAttributeNames: {
                '#detail': 'detail',
                '#grade' : 'grade',
                '#rating' : 'rating',
                '#time_stamp': 'time_stamp',
            },
            ExpressionAttributeValues: {
                ':detail': { S: review.detail },
                ':grade' : {S : review.grade },
                ':rating': { S : review.rating },
                ':time_stamp': { S: review.timestamp },
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

export {
    readAllReviews,
    createReviews,
    deleteReviews,
    updateReviews
}