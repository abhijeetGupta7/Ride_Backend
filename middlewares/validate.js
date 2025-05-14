const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "fail",
            errors: errors.array(),
        });
    }
    next();
};
