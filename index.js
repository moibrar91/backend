const validator = require("node-input-validator")
const ResponseMiddleware = require("../middlewares/ResponseMiddleware.js");
const helpers = require("../util/helpers.js");
const { models } = require("../models");
validator.extend("unique", async function({value, args}){
    console.log("ValidatorsIndex => unique", args);

    let result = null;

    if(args.length > 2) {
        result = await models[args[0]]
            .findOne({
                where : {
                    [args[1]]: value,
                    [args[2]]: { $not: args[3] }
                }
            })
    } else {
        result = await models[args[0]]
            .findOne({
                where : {
                    [args[1]]: value
                }
            })
    }
    return !result ? true : false;
})


/**
 * to check given id exists in given table
 * additional column checks can be passed in pairs
 * e.g exists:table_name,primary_id,col1,value1,col2,value2 and so on
 * col-value must be in pairs
 */
validator.extend("exists", async function({value, args}){
    console.log("ValidatorsIndex => exists");

    let result = await models[args[0]]
        .findOne({
            where: {
                [args[1]]: value
            }
        })

    return result ? true : false
})

validator.extend("allowedValues", ({value, args}) => {
    return args.indexOf(value) > -1 ? true : false
})

module.exports = {
    //common function to send validation response
    validate : (v, res, next, req = null) => {
        console.log("ValidatorsIndex => validate");

        if(v.check().then(function(matched){
            if(!matched){
                req.rCode = 0;
                let message = helpers().getErrorMessage(v.errors)

                ResponseMiddleware(req, res, next, message);
            }else{
                next()
            }
        }));
    },

    validations: {
        general: {
            requiredNumeric: "required|numeric",
            required: "required",
            nullable: "nullable",
            requiredInt: "required|integer",
            requiredString: "required|string|maxLength:255",
            nullableString: "nullable|string|maxLength:255",
            requiredText: "required|string|maxLength:5000",
            requiredTodayOrAfterDate: "required|dateAfterToday:today,.|date",
            requiredDate: "required|date",
            nullableDate: "nullable|date"
        },
        user:{
          id: "required|exists:users,id",
          existEmail: "required|string|exists:users,email",
          email: "required|string|unique:users,email",
          username: "required|string|unique:users,username"
        },
        student_ambassador:{
          email: "required|string|unique:student_ambassadors,email",
          mobile: "required|string|unique:student_ambassadors,mobile",
        },
        team_request:{
          email: "required|string|unique:team_requests,email",
          mobile: "required|string|unique:team_requests,mobile",
        },
        college_partnership:{
          email: "required|string|unique:college_partnerships,email",
          mobile: "required|string|unique:college_partnerships,mobile",
        },
        advertisement:{
          email: "required|string|unique:advertisements,email",
          mobile: "required|string|unique:advertisements,mobile",
        },
        investor_relation:{
          email: "required|string|unique:investor_relations,email",
          mobile: "required|string|unique:investor_relations,mobile",
        },
        early_join:{
          email: "required|string|unique:join_early_users,email"
        },
        question:{
          id: "required|string|exists:questions,id"
        },
        comment:{
          id: "required|string|exists:question_comments,id"
        },
        career:{
          id: "required|string|exists:careers,id"
        },
        speciality:{
          id: "required|string|exists:specializations,id"
        },
        skill:{
          id: "required|string|exists:skills,id"
        },
        user_request:{
          id: "required|string|exists:user_requests,id"
        },
        service:{
          id: "required|string|exists:services,id"
        },
        admin:{
          id: "required|exists:admins,id",
          existEmail: "required|string|exists:admins,email",
          email: "required|string|unique:admins,email",
        },
        certificate:{
          id: "required|string|exists:certificates,id"
        }

    }
}
