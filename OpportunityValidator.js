const { Validator } = require('node-input-validator');
const { validate, validations } = require("./index")

module.exports = () => {
    const addOpportunityValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        title:validations.general.required
      });

        validate(v, res, next, req);
    }

    
    const opportunityIdPostValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        opportunityId:validations.opportunity.id
      });

        validate(v, res, next, req);
    }

    const opportunityIdGetValidator = async (req, res, next) => {

      const v = new Validator(req.query, {
        opportunityId:validations.opportunity.id
      });

        validate(v, res, next, req);
    }

    const addCommentOpportunityValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        opportunityId:validations.opportunity.id,
        message:validations.general.required
      });

        validate(v, res, next, req);
    }

    
    const likeOpportunityValidator = async (req, res, next) => {

      const v = new Validator(req.body, {
        opportunityId:validations.opportunity.id,
        isLiked:validations.general.required
      });

        validate(v, res, next, req);
    }
    
    return {
        addOpportunityValidator,
        opportunityIdPostValidator,
        opportunityIdGetValidator,
        addCommentOpportunityValidator,
        likeOpportunityValidator
    }
}
