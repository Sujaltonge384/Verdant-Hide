// server/src/middleware/validate.js
module.exports = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  req.body = parsed.data;
  next();
};