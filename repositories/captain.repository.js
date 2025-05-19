const { Captain } = require("../models");
const CrudRepository = require("./crud.respository");

class CaptainRepostory extends CrudRepository {
    constructor() {
        super(Captain);
    }
    
    async getUserByEmail(emailId) {
        const captain=Captain.findOne({email: emailId}).select("+password");
        return captain;
    }
}


module.exports=CaptainRepostory;