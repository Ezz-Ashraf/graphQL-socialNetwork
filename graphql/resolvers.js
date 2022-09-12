const User = require('../models/user')
const bcrypt = require('bcryptjs');
module.exports = {
// createUser(  args , req ) {
// const email = args.userInput.email
// }

createUser: async function(  {userInput} , req ) {
    const email = userInput.email

    const existingUser = await User.findOne({email:email})
    if(existingUser)
    {
        const error = new Error("User already Exists")
        throw error
    }
    else {
        
        const hashedPassword = await bcrypt.hash(userInput.password,12)
    const user = new User({
        email:email,
        password:hashedPassword,
        name:userInput.name
    })
    const createdUser = await user.save()
    return {...createdUser._doc , _id : createdUser._id.toString()}
}
}


}