import React from 'react'
import PostDetailCard from '../components/post/PostDetailCard'
import PopularSubjectsCard from '../components/popularSubjects/PopularSubjectsCard'
import AddNewPost from '../components/createPost/AddNewPost'
import Layout from './Layout'

function Dashboard() {

  const user = JSON.parse(localStorage.getItem('user'));
  // console.log(user);

  return (
    <div className='w-full h-full'>
      <header className='text-[40px] max-2xl:text-[34px] font-semibold bg-gradient-to-br from-[#0D0B5F] from-[12.5%] to-[#029BE0] to-[100%] inline-block text-transparent bg-clip-text'>
        Public relations
      </header>
      <div className='w-full h-auto flex mt-5'>
        <div className='w-[70%] mr-10'>
          {user.role === 'admin' && (
            < AddNewPost userId={user.userId} />
          )}
          <PostDetailCard />
        </div>
        <div className='w-[30%] border-l-[1px] border-[#00000052] pl-10'>
          <h1 className='text-[26px] max-2xl:text-[20px] font-medium'>Popular subjects</h1>
          <PopularSubjectsCard />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
