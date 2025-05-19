const { User } = require("../models");
const CrudRepository = require("./crud.respository");

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }
    
    async getUserByEmail(emailId) {
        const user=User.findOne({email: emailId}).select("+password");
        return user;
    }
}


module.exports=UserRepository;