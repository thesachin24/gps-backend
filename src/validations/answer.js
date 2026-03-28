/**
 * @file This file define the validation used in answer routes.
 */
import Joi from 'joi';

export const answer = {
  createAnswer: {
    params: {
      question_id: Joi.number().required()
    },
    body: {
      answer: Joi.string().trim().required()
    }
  },
  updateAnswer: {
    params: {
      id: Joi.number().required()
    },
    body: {
      answer: Joi.string().trim().required()
    }
  },
  idOnly: {
    params: {
      id: Joi.number().required()
    }
  },
  getAnswerList: {
    params: {
      question_id: Joi.number().required()
    },
    query: {
      search: Joi.string().optional().allow('', null),
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      sortByName: Joi.string().optional()
    }
  },
};
