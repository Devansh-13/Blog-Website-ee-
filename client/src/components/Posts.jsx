import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import Loader from '../components/Loader'

import PostItem from '../components/PostItem'

const Posts = () => {
    const [posts ,setPosts]= useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
      const fetchPosts = async () =>{
        setIsLoading(true);
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`)
          setPosts(response?.data)
        }
        catch (err) {
          console.log(err)
        }

        setIsLoading(false)
      }

      fetchPosts();
    },[])

    if(isLoading){
      return <Loader/>
    }

  return (
    <>
    <section className='posts'>
        { posts.length > 0 ? <div className='container posts__container'>
        {
            posts.map(({ _id,thumbnail,category,title,description,creator,createdAt}) =>    
            <PostItem key={_id} postID={_id}  thumbnail={thumbnail} category={category} 
            title={title} description={description} authorID={creator} createdAt={createdAt} /> )
        }
        </div> : <h2 className='center'> No posts founds </h2> }
        
    </section>
    <style>{"html{position:relative}"}</style>
    </>
  )
}

export default Posts