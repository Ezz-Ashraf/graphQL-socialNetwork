const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');

// get posts using promises
/*exports.getPosts = (req,res,next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	let totalItems;
	Post.find().countDocuments().then(count => {
		totalItems = count;
	return 	Post.find().populate({path: "creator", model: User}).skip((currentPage - 1) * perPage).limit(perPage); //skip elements according to the page number
		}).then(posts => {
				res.status(200).json({
					message:'Fetched successfully',
					posts:posts ,
					totalItems :totalItems
				}) }).catch((err) => {
		if(!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	});

	// res.status(200).json({
	// 	posts : [{
	// 		_id:'1',
	// 		imageURL:'images/book.jpg',
	// 	title : 'My first post',
	// 	content : 'This is my first post using rest api',
	// 	creator:{ name:'ezz ashraf'
	// },
	// createdAt :new Date()
	// }]
	// });
}; */

// get posts using async-await
exports.getPosts = async (req,res,next) => {

	const currentPage = req.query.page || 1;
	const perPage = 2;
		try {
	const totalItems = await Post.find().countDocuments()
const posts =	await Post.find().populate({path: "creator", model: User}).skip((currentPage - 1) * perPage).limit(perPage); //skip elements according to the page number
				res.status(200).json({
					message:'Fetched successfully',
					posts:posts ,
					totalItems :totalItems
				}) }
				catch(err) {
		if(!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	};
}


exports.createPost = (req,res,next) => {
	const errors = validationResult(req);

	if(!errors.isEmpty())
	{
		// return res.status(422) //422 means validation failed
		// .json({ messages : 'validation failed ,The data is incorrect',errors: errors.array()});
		const error = new Error('validation failed ,The data is incorrect');
		error.statusCode = 422;
		throw error;
	}
	if(!req.file) {
		const error = new Error('No image provided');
		error.statusCode = 422;
		throw error;
	}
	const imageURL= req.file.path.replace("\\","/");
	const title = req.body.title;
	const content = req.body.content;
	let creator;
	const post = new Post({
		title:title,
			content:content,
			creator:req.userId,
		imageURL:imageURL
	}); 		//creating a post in database
	post.save().then(result => {
		return User.findById(req.userId);
		}).then( user => {
		creator = user;
		user.posts.push(post);
		return user.save();
	}).then( result => {
		res.status(201).json({
			message : 'post created successfully! :D"',
			// post : {_id : new Date().toISOString(),
			// 	createdAt :new Date()
			// }
			//	post : { ...post._doc ,creator:{_id : req.userId , name:user.name} },
			post :post,
			creator :{_id:creator._id , name: creator.name}
		});}).catch((err) => {
			//console.log(err)
			if(!err.statusCode) {
				err.statusCode=500;
			}
			next(err);
		});


};

exports.getPost = (req,res,next) => {
const postId = req.params.postId;
Post.findById(postId).populate({path: "creator", model: User}).then( post => {
	if(!post) {
		const error= new Error('post could not be found');
		error.statusCode = 404;
		throw error;
	}
	res.status(200).json({
		message:'Success',
		post : post
	});
}).catch( err => {
	if(!err.statusCode) {
		err.statusCode = 500;
	}
	next(err);
});

};

exports.editPost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = 	req.file.path.replace("\\","/");
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
			if(post.creator.toString() !== req.userId)
			{
				const error = new Error('Edit not allowed');
				error.statusCode = 403;
				throw error;
			}
      if (imageUrl !== post.imageURL) {
        clearImage(post.imageURL);
      }
      post.title = title;
      post.imageURL = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

	Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
			//check the logged in user
			if(post.creator.toString() !== req.userId)
			{
				const error = new Error('Delete not allowed');
				error.statusCode = 403;
				throw error;
			}
			clearImage(post.imageURL);
			return Post.findByIdAndRemove(postId);
		}).then(result => {
		return User.findById(req.userId);
		}).then(user => {
			user.posts.pull(postId);
			return user.save();
		}).then(result => {
						res.status(200).json({ message: 'Deleted post!'});
		}).catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.getUserStatus = (req, res, next) => {
 User.findById(req.userId).then( user => {
	 if(!user) {
		 error = new Error('User not found');
		 error.statusCode = 404;
		 throw error;
	 }
	 res.status(200).json({
		 status:user.status
	 });
 }).catch(err => {
	 if (!err.statusCode) {
		 err.statusCode = 500;
	 }
	 next(err);
 });

};

exports.updateUserStatus = (req, res, next) => {
	const newStatus= req.body.status;
	User.findById(req.userId).then(user => {
		if(!user) {
			error = new Error('User not found');
			error.statusCode = 404;
			throw error;
		}
		user.status =newStatus;
	return	user.save();
	}).then(result => {
		res.status(200).json({
			message:'user created succesfully',
			status:newStatus
		});
	}).catch(err => {
		if (!err.statusCode) {
			err.statusCode = 500;
	}
	next(err);
});
};
