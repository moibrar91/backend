const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const addQuestionValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        title:validations.general.required
      });

        validate(v, res, next, req);
    }

    
    const questionIdPostValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        questionId:validations.question.id
      });

        validate(v, res, next, req);
    }

    const questionIdGetValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
        questionId:validations.question.id
      });

        validate(v, res, next, req);
    }

    const addCommentValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        questionId:validations.question.id,
        message:validations.general.required
      });

        validate(v, res, next, req);
    }

    const commentIdPostValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        commentId:validations.comment.id
      });

        validate(v, res, next, req);
    }

    const removeCommentValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        commentId:validations.comment.id,
        questionId:validations.question.id,
      });

        validate(v, res, next, req);
    }

    
    const likeQuestionValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        questionId:validations.question.id,
        isLiked:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    return {
        addQuestionValidator,
        questionIdPostValidator,
        questionIdGetValidator,
        addCommentValidator,
        commentIdPostValidator,
        removeCommentValidator,
        likeQuestionValidator
    }
}
