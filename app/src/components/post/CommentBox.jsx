import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { format, parseISO } from 'date-fns';
import DropdownComment from './DropdownComment';
import axios from 'axios';
import { baseURL } from "../../../baseURL";

const CommentBox = ({ postId, dataComment }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const postComment = async () => {
    if (comment.trim() === '') {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(`${baseURL}comment`, {
        message: comment,
        userId: user.userId,
        postId: postId
      });

      if (response.data.success) {
        setComment('');
        setCommentError('');
      }
    } catch (error) {
      console.error('Error during signup:', error.response.data);
    }
  };

  return (
    <>
      <div className="mt-5 relative">
        {dataComment && (
          dataComment.map((comment, index) => (
            <div key={index} className="flex items-start mb-4">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#151C38] flex items-center justify-center text-white font-bold"></div>
              <div className="ml-3 p-2 bg-[#E3F3FF] relative" style={{ width: '100%', maxWidth: 'calc(100% - 40px)', borderRadius: '10px' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {user.role === 'admin' && user.userId === comment.user_id.S ? (
                      <p>Admin</p>
                    ) : (
                      <p>User@{comment.user_id.S}</p>
                    )}
                    <p className="text-[#A4A4A4] text-[10px] font-[350] ml-2 mt-[2px]">{format(parseISO(comment.time_stamp.S), 'dd/MM/yyyy')}, {format(parseISO(comment.time_stamp.S), 'HH:mm')} น.</p>
                  </div>
                  <div className="relative">
                    {user.role === "admin" | user.userId === comment.user_id.S ? (
                      <DropdownComment commentId={comment.id.S} postId={comment.post_id.S} />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <p className="text-black text-sm font-light">{comment.message.S}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div name="post" className="relative mx-2">
        <input
          className={`w-full h-[40px] rounded-[10px] border-0 py-5 pl-7 pr-20 text-[16px] text-gray-900 ring-1 ring-inset ${commentError ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:ring-1.5 focus:ring-inset focus:ring-[#0D0B5F] text-sm font-light `}
          placeholder="Your Message ..."
          value={comment}
          onChange={(e) => { setComment(e.target.value); setCommentError(''); }}
        ></input>
        <button
          className={`py-[6px] px-[12px] flex-shrink-0 bg-gradient-to-br from-[#0D0B5F] to-[#029BE0] hover:from-[#029BE0] hover:to-[#0D0B5F] rounded-[10px] absolute top-1/2 right-[-6px] transform -translate-x-1/2 -translate-y-1/2 text-[16px] ${comment.trim() === '' ? 'cursor-not-allowed bg-gray-400' : 'cursor-pointer text-white'}`}
          onClick={comment.trim() === '' ? null : postComment}
          disabled={comment.trim() === ''}
        >
          <Icon icon="wpf:sent" color="#fff" className="py-0.1" />
        </button>
      </div>
    </>
  );
};

export default CommentBox;
