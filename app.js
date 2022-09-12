const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4:uuidv4 } = require('uuid');
const bodyParser =require('body-parser');
const mongoose=require('mongoose');
const mongoDBURI = 'mongodb+srv://Ezz:1234@cluster0.ghrh0.mongodb.net/socialNetwork?retryWrites=true&w=majority';
const { graphqlHTTP 	} = require('express-graphql');
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const isAuth = require('./middleware/is-auth');
const app = express();
const cors = require('cors');
const fileStorage = multer.diskStorage({
	destination: (req , file , cb) => {
		cb(null,'images'); //null is the erroes
	},
	filename: (req,file,cb) => {
		cb(null,uuidv4())//new Date().toISOString() + '-' + file.originalname);
	}
});

const fileFilter = (req,file,cb) => {
	if(
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	)  {
		cb(null,true)
	} else {
		cb(null , false)
	}
};


app.use(bodyParser.json()); //application/json type
app.use(multer({ storage:fileStorage , fileFilter: fileFilter }).single('image'));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/graphqL' , graphqlHTTP ({
	schema: graphqlSchema,
	rootValue:graphqlResolver,
	graphiql:true
}))

app.use((error,req ,res ,next) => {
	console.log(error);
	const status = error.statusCode || 500; //if status code is undefined it will be assigned as 500
	const message = error.message;
	const data = error.data;
	res.status(status).json({message:message , data:data});
});
mongoose.connect(mongoDBURI).then(result => {
	app.listen(8080);
}).catch(err =>console.log(err));
