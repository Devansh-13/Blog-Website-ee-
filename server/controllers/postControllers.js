const Post = require('../models/postModel')
const User = require('../models/userModel')
const fs = require('fs')
const path = require('path')
const {v4:uuid} = require('uuid')
const HttpError = require('../models/errorModel')




//======================Create a Post
// POST: api/posts
//PROTECTED
const createPost = async (req, res, next) => {
    try{
        let {title, category, description} = req.body;
        if(!title || !category || !description || !req.files){
            return next(new HttpError("Please fill all the fields and choose thumbnail",422))
        }
        const {thumbnail} = req.files
        //check the file size
        if(thumbnail.size > 2000000){
            return next(new HttpError('Thumbnail too big, Should be less than 2mb'),422)
        }

        let fileName =thumbnail.name;;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFilename), async(err)=>{
            if(err){
                return next(new HttpError(err))
            }
            else{
                const newPost = await Post.create({title, category, description, thumbnail : newFilename, 
                creator: req.user.id})
                if(!newPost){
                    return next(new HttpError("Failed to create post",422))
                }
                
                //find user and increase post count by 1
                const currentUser = await User.findById(req.user.id);
                currentUser.posts++; // Increment post count 
                await currentUser.save();

                res.status(201).json(newPost)
            }
        })
    }
    catch(error){
        return next(new Error(error))
    }
}





//======================Get all Post
// GET: api/posts
//UNPROTECTED
const getPosts = async (req, res, next) => {
    try{
        const posts = await Post.find().sort({updatedAt: -1})
        res.status(200).json(posts)
    }
    catch(error){
        return next(new Error(error))
    }
}





//======================Get Single Post
// GET: api/posts/:id
//UNPROTECTED
const getPost = async (req, res, next) => {
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post not found",404))
        }
        res.status(200).json(post)
    }
    catch(error){
        return next(new Error(error))
    }
}





//======================Get Posts By Category
// GET: api/posts/categories/:category
//PROTECTED
const getCatPosts = async (req, res, next) => {
    try{
        const {category}= req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1})
        res.status(200).json(catPosts)
    }
    catch(error){
        return next(new Error(error))
    }
}





//======================Get Author Post
// GET: api/posts/users/:id
//UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new Error(error));
    }
};






//======================Edit Post
// Patch: api/posts/:id
//PROTECTED
const  editPost= async (req, res, next) => {
    try{
        let fileName;
        let newFilename;
        let updatedPost;
        const postId = req.params.id;
        let {title, category, description} = req.body;

        //ReactQuill has a para opening and closing tag with a break tag in between so there are 11 characters in there already.
        if(!title || !category || description.length < 12 ){
            return next(new HttpError("Please fill all the fields",400))
        }
        //get old post from database
        const oldPost = await Post.findByIdAndUpdate(postId);
        if(req.user.id == oldPost.creator){
            if(!req.files){
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description}
                    , {new: true})
            }
            else{
           
                //delete old thumbnail from uploads
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err)=>{
                    if(err){
                        return next(new HttpError(err))
                    }
                })
                //upload new thumbnail
                const {thumbnail} = req.files;
                //check file size
                if(thumbnail.size > 2000000){
                    return next(new HttpError('Thumbnail too big, Should be less than 2mb'),422)
                }
                fileName =thumbnail.name;
                let splittedFilename = fileName.split('.')
                newFilename = splittedFilename[0] + uuid() + splittedFilename[splittedFilename.length - 1];
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async(err)=>{
                    if(err){
                        return next(new HttpError(err))
                    }
                })
    
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, description, thumbnail: newFilename},
                {new: true})
            }
        }
        
        if(!updatedPost){
            return next(new HttpError("Failed to update post",400))
        }

        res.status(200).json(updatedPost)
    }
    catch(error){
        return next(new Error(error))
    }
}






//======================Delete Post
// DELETE: api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post not found", 404));
        }
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }
        const fileName = post?.thumbnail;
        if (!fileName) {
            return next(new HttpError("Thumbnail not found for the post", 404));
        }

        if(req.user.id == post.creator){
            // Delete thumbnail from upload folder
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err));
                }
                else {
                    await Post.findByIdAndDelete(postId);
                    // Find user and reduce post count by 1 
                    const currentUser = await User.findById(req.user.id);
                    currentUser.posts--; // Increment post count
                    await currentUser.save();
                    res.json(`Post ${postId} deleted successfully`);
                }
            });
        }
        else{
            return next(new HttpError("Post cound'nt be deleted", 403));
        }
    }
    catch (error) {
        return next(new Error(error));
    }
};



module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost};

