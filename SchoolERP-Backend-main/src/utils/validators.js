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
    discountType: Joi.string().optional().allow(null, ''),
    discountAmount: Joi.number().min(0).max(100).optional().allow(null),
    discountValue: Joi.number().min(0).optional().allow(null),
    amountAfterDiscount: Joi.number().min(0).optional().allow(null),
    remarks: Joi.string().optional().allow(null, ''),
    schoolId: Joi.number().optional()
  }).unknown(false);

  return schema.validate(data);
};

