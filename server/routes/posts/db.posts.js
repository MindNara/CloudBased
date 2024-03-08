import { db } from '../../config/db.config.js';
import { ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

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

// Get post by ID
const getPostById = async (postId) => {
    try {
        const params = {
            TableName: 'posts',
            Key: {
                id: { S: postId }
            }
        };

        const command = new GetItemCommand(params);
        const result = await db.send(command);
        return { success: true, data: result.Item };

    } catch (error) {

    }
}

// Create posts
const createPosts = async (post) => {
    try {
        const params = {
            TableName: 'posts',
            Item: {
                id: { S: post.id },
                title: { S: post.title },
                detail: { S: post.detail },
                images: {
                    L: post.image.map(image => ({
                        M: {
                            url: { S: image.url },
                            name: { S: image.name }
                        }
                    }))
                },
                timestamp: { S: post.timestamp },
                like: { SS: [""] },
                comment: { N: post.comment.toString() },
                user_id: { S: post.userId },
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
            UpdateExpression: 'SET #title = :title, #detail = :detail, #images = :images',
            ExpressionAttributeNames: {
                '#title': 'title',
                '#detail': 'detail',
                '#images': 'images',
            },
            ExpressionAttributeValues: {
                ':title': { S: post.title },
                ':detail': { S: post.detail },
                ':images': { L: post.image.map(img => ({ M: { url: { S: img.url }, name: { S: img.name } } })) },
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

// Update like
const updateAddLike = async (data) => {
    try {
        const params = {
            TableName: 'posts',
            Key: {
                id: { S: data.post_id },
            },
        };
        const result = await db.send(new GetItemCommand(params));
        const currentPost = result.Item;
        // console.log(currentPost.like.SS);

        if (currentPost.like?.SS?.includes(data.user_id)) {

            // ลบ userId
            const dislikeParams = {
                TableName: 'posts',
                Key: {
                    id: { S: data.post_id },
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
            const result = await db.send(new UpdateItemCommand(dislikeParams));
            console.log('Delete from dislike successful:', result);

            return { success: true, data: "dislike" };

        } else {

            // เพิ่ม userId
            const likeParams = {
                TableName: 'posts',
                Key: {
                    id: { S: data.post_id },
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
            const result = await db.send(new UpdateItemCommand(likeParams));
            console.log('Add to like successful:', result);

            return { success: true, data: "like" };

        }



        // ตรวจสอบว่า like มีค่า userId ที่ต้องการจะเพิ่มหรือไม่
        // if (currentPost.like?.SS?.includes(data.user_id)) {
        //     // ลบ userId ออกจาก like โดยใช้ UpdateExpression และ ExpressionAttributeValues ของ DynamoDB
        //     const updateParams = {
        //         TableName: 'posts',
        //         Key: {
        //             id: { S: data.post_id },
        //         },
        //         UpdateExpression: 'DELETE #like :user_id',
        //         ExpressionAttributeNames: {
        //             '#like': 'like',
        //         },
        //         ExpressionAttributeValues: {
        //             ':user_id': { SS: [data.user_id] },
        //         },
        //         ReturnValues: 'UPDATED_NEW',
        //     };
        //     const result = await db.send(new UpdateItemCommand(updateParams));
        //     console.log('Update successful:', result);
        //     return { success: true, data: result.Attributes };

        // } else if (currentPost.dislike?.SS?.includes(data.user_id)) {
        //     // ลบ userId ออกจาก dislike
        //     const deleteDislikeParams = {
        //         TableName: 'posts',
        //         Key: {
        //             id: { S: data.post_id },
        //         },
        //         UpdateExpression: 'DELETE #dislike :user_id',
        //         ExpressionAttributeNames: {
        //             '#dislike': 'dislike',
        //         },
        //         ExpressionAttributeValues: {
        //             ':user_id': { SS: [data.user_id] },
        //         },
        //         ReturnValues: 'UPDATED_NEW',
        //     };
        //     const deleteResult = await db.send(new UpdateItemCommand(deleteDislikeParams));
        //     console.log('Delete from dislike successful:', deleteResult);

        //     // เพิ่ม userId ลงใน like
        //     const addLikeParams = {
        //         TableName: 'posts',
        //         Key: {
        //             id: { S: data.post_id },
        //         },
        //         UpdateExpression: 'ADD #like :user_id',
        //         ExpressionAttributeNames: {
        //             '#like': 'like',
        //         },
        //         ExpressionAttributeValues: {
        //             ':user_id': { SS: [data.user_id] },
        //         },
        //         ReturnValues: 'UPDATED_NEW',
        //     };
        //     const addResult = await db.send(new UpdateItemCommand(addLikeParams));
        //     console.log('Add to like successful:', addResult);

        //     return { success: true, data: addResult.Attributes };

        // } else { // ถ้าไม่มีค่า userId นั้นอยู่ให้เพิ่มลงไปป
        //     const params = {
        //         TableName: 'reviews',
        //         Key: {
        //             review_id: { S: data.review_id },
        //         },

        //         UpdateExpression: 'ADD #like :user_id',
        //         ExpressionAttributeNames: {
        //             '#like': 'like',
        //         },
        //         ExpressionAttributeValues: {
        //             ':user_id': { SS: [data.user_id] },
        //         },
        //         ReturnValues: 'UPDATED_NEW',
        //     };

        //     const result = await db.send(new UpdateItemCommand(params));
        //     console.log('Update successful:', result);

        //     return { success: true, data: result.Attributes };
        // }

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
    deletePosts,
    getPostById,
    updateAddLike
}