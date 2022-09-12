const { buildSchema } = require('graphql')
//use backticks for multiLine string
module.exports = buildSchema(`

    type testData {
        text: String
        views: Int
    }
  
  
    type RootQuery {
        hello :testData
    }

    schema {
        query : RootQuery
    }


`)

