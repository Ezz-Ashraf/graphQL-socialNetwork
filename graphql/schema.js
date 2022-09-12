const { buildSchema } = require('graphql')
//use backticks for multiLine string
module.exports = buildSchema(`


    type post {
        _id :ID!
        content:String!
        title:String!
        imageURL:String!
        createdAt:String!
        updatedAt:String!
    }

    type User {
        _id:ID!
        email:String!
        name:String!
        password:String
        status: String!
        posts:[post!]! 
    }

    input userInputData {
        email:String!
        name:String!
        password:String!
    } 


   type RootMutation {
    createUser(userInput : userInputData):User
   }

   type RootQuery {
    hello :String
}


    schema {
        query : RootQuery
        mutation : RootMutation
    }


`)

