import Joi from 'joi';


export const validateFeeData = (data) => {
  const schema = Joi.object({
    admissionNumber: Joi.string().required(),
    studentName: Joi.string().required(),
    fatherName: Joi.string().required(),
    class: Joi.string().required(),
    section: Joi.string().required(),
    totalFees: Joi.number().min(0).required(),
    amountPaid: Joi.number().min(0).required(),
    feeAmount: Joi.number().min(0).required(),
    paymentDate: Joi.string().required(), 
    paymentMode: Joi.string().required(),
    receiptNumber: Joi.string().required(),
    status: Joi.string().valid('Paid', 'Pending', 'Partial').required(),
    feeCategory: Joi.string().optional().allow(null, ''),
    feeCategories: Joi.array().items(Joi.string()).optional(),
    schoolId: Joi.number().optional()
  });

  return schema.validate(data);
};

