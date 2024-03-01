import { db } from '../../config/db.config.js'
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
                like: { SS: ["1"] }, // กำหนด default เป็น array ว่าง หากไม่มีค่ากำหนด
                dislike: { SS: ["1"] },
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
                '#grade': 'grade',
                '#rating': 'rating',
                '#time_stamp': 'time_stamp',
            },
            ExpressionAttributeValues: {
                ':detail': { S: review.detail },
                ':grade': { S: review.grade },
                ':rating': { S: review.rating },
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

const updateAddLike = async (data) => {
    try {
        const currentReviewParams = {
            TableName: 'reviews',
            Key: {
                review_id: { S: data.review_id },
            },
        };
        const currentReviewResult = await db.send(new GetItemCommand(currentReviewParams));
        const currentReview = currentReviewResult.Item;

        // ตรวจสอบว่า like มีค่า userId ที่ต้องการจะเพิ่มหรือไม่
        if (currentReview.like?.SS?.includes(data.user_id)) {
            // ลบ userId ออกจาก like โดยใช้ UpdateExpression และ ExpressionAttributeValues ของ DynamoDB
            const updateParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'DELETE #like :user_id',
                ExpressionAttributeNames: {
                    '#like': 'like',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const result = await db.send(new UpdateItemCommand(updateParams));
            console.log('Update successful:', result);
            return { success: true, data: result.Attributes };

        } else if (currentReview.dislike?.SS?.includes(data.user_id)) {
            // ลบ userId ออกจาก dislike
            const deleteDislikeParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'DELETE #dislike :user_id',
                ExpressionAttributeNames: {
                    '#dislike': 'dislike',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const deleteResult = await db.send(new UpdateItemCommand(deleteDislikeParams));
            console.log('Delete from dislike successful:', deleteResult);
        
            // เพิ่ม userId ลงใน like
            const addLikeParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'ADD #like :user_id',
                ExpressionAttributeNames: {
                    '#like': 'like',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const addResult = await db.send(new UpdateItemCommand(addLikeParams));
            console.log('Add to like successful:', addResult);
        
            return { success: true, data: addResult.Attributes };

        }else{ // ถ้าไม่มีค่า userId นั้นอยู่ให้เพิ่มลงไปป
            const params = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
    
                UpdateExpression: 'ADD #like :user_id',
                ExpressionAttributeNames: {
                    '#like': 'like',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] }, // ใช้ SS แทน S เนื่องจากเป็น String Set
                },
                ReturnValues: 'UPDATED_NEW',
            };
    
            const result = await db.send(new UpdateItemCommand(params));
            console.log('Update successful:', result);
    
            return { success: true, data: result.Attributes };
        }

    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, data: null };
    }
};

const updateAddDisLike = async (data) => {
    try {
        const currentReviewParams = {
            TableName: 'reviews',
            Key: {
                review_id: { S: data.review_id },
            },
        };
        const currentReviewResult = await db.send(new GetItemCommand(currentReviewParams));
        const currentReview = currentReviewResult.Item;

        // ตรวจสอบว่า dislike มีค่า userId ที่ต้องการจะเพิ่มหรือไม่
        if (currentReview.dislike?.SS?.includes(data.user_id)) {
            // ลบ userId ออกจาก dislike โดยใช้ UpdateExpression และ ExpressionAttributeValues ของ DynamoDB
            const updateParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'DELETE #dislike :user_id',
                ExpressionAttributeNames: {
                    '#dislike': 'dislike',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const result = await db.send(new UpdateItemCommand(updateParams));
            console.log('Update successful:', result);
            return { success: true, data: result.Attributes };

        } else if (currentReview.like?.SS?.includes(data.user_id)){
            // ลบ userId ออกจาก like โดยใช้ UpdateExpression และ ExpressionAttributeValues ของ DynamoDB
            const deletelikeParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'DELETE #like :user_id',
                ExpressionAttributeNames: {
                    '#like': 'like',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const deleteResult = await db.send(new UpdateItemCommand(deletelikeParams));
            console.log('Delete from like successful:', deleteResult);
        
            // เพิ่ม userId ลงใน like
            const addDisLikeParams = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
                UpdateExpression: 'ADD #dislike :user_id',
                ExpressionAttributeNames: {
                    '#dislike': 'dislike',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] },
                },
                ReturnValues: 'UPDATED_NEW',
            };
            const addResult = await db.send(new UpdateItemCommand(addDisLikeParams));
            console.log('Add to dislike successful:', addResult);
        
            return { success: true, data: addResult.Attributes };

        }else { // ถ้าไม่มีค่า userId นั้นอยู่ให้เพิ่มลงไปป
            const params = {
                TableName: 'reviews',
                Key: {
                    review_id: { S: data.review_id },
                },
    
                UpdateExpression: 'ADD #dislike :user_id',
                ExpressionAttributeNames: {
                    '#dislike': 'dislike',
                },
                ExpressionAttributeValues: {
                    ':user_id': { SS: [data.user_id] }, // ใช้ SS แทน S เนื่องจากเป็น String Set
                },
                ReturnValues: 'UPDATED_NEW',
            };
    
            const result = await db.send(new UpdateItemCommand(params));
            console.log('Update successful:', result);
    
            return { success: true, data: result.Attributes };
        }

    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, data: null };
    }
};

export {
    readAllReviews,
    createReviews,
    deleteReviews,
    updateReviews,
    updateAddLike,
    updateAddDisLike,
}