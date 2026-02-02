/**
 * Validates the received message payload (BOT, USER, or ESCALATION)
 */
export const validateMessagePayload = (req, res, next) => {
  const errors = [];
  
  // Required fields (timestamp, message_id, user_id, and text are optional)
  const requiredFields = ['flag', 'conversation_id'];
  
  for (const field of requiredFields) {
    if (!req.body[field] && req.body[field] !== '') {
      errors.push(`Field '${field}' is required`);
    }
  }
  
  // Validate flag
  if (req.body.flag && !['BOT', 'USER', 'ESCALATION'].includes(req.body.flag)) {
    errors.push("Field 'flag' must be either 'BOT', 'USER', or 'ESCALATION'");
  }
  
  // Validate timestamp format (ISO 8601)
  if (req.body.timestamp) {
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!timestampRegex.test(req.body.timestamp)) {
      errors.push("Field 'timestamp' must be in ISO 8601 format (e.g., '2025-12-30T15:51:14.444Z')");
    }
  }
  
  // Validate user_id is numeric string (optional field)
  if (req.body.user_id !== undefined && req.body.user_id !== null && req.body.user_id !== '' && !/^\d+$/.test(req.body.user_id)) {
    errors.push("Field 'user_id' must be a numeric string");
  }
  
  // Validate file types
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (file.fieldname.startsWith('audio_')) {
        if (file.mimetype !== 'audio/ogg' && file.mimetype !== 'audio/opus') {
          errors.push(`Audio file '${file.fieldname}' must be audio/ogg or audio/opus`);
        }
      } else if (file.fieldname.startsWith('image_')) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
          errors.push(`Image file '${file.fieldname}' must be image/png or image/jpeg`);
        }
      } else {
        errors.push(`Unknown file field: '${file.fieldname}'`);
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: errors.join('; ')
    });
  }
  
  next();
};

/**
 * Validates the send message payload (AGENT)
 */
export const validateSendPayload = (req, res, next) => {
  const errors = [];
  
  // Required fields (timestamp and message_id are optional, will be auto-generated)
  const requiredFields = ['flag', 'conversation_id', 'user_id', 'text'];
  
  for (const field of requiredFields) {
    if (!req.body[field] && req.body[field] !== '') {
      errors.push(`Field '${field}' is required`);
    }
  }
  
  // Validate flag must be AGENT
  if (req.body.flag && req.body.flag !== 'AGENT') {
    errors.push("Field 'flag' must be 'AGENT' for send endpoint");
  }
  
  // Validate timestamp format (ISO 8601)
  if (req.body.timestamp) {
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!timestampRegex.test(req.body.timestamp)) {
      errors.push("Field 'timestamp' must be in ISO 8601 format (e.g., '2025-12-30T15:51:14.444Z')");
    }
  }
  
  // Validate user_id is numeric string
  if (req.body.user_id && !/^\d+$/.test(req.body.user_id)) {
    errors.push("Field 'user_id' must be a numeric string");
  }
  
  // Validate file types
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (file.fieldname.startsWith('audio_')) {
        if (file.mimetype !== 'audio/ogg' && file.mimetype !== 'audio/opus') {
          errors.push(`Audio file '${file.fieldname}' must be audio/ogg or audio/opus`);
        }
      } else if (file.fieldname.startsWith('image_')) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
          errors.push(`Image file '${file.fieldname}' must be image/png or image/jpeg`);
        }
      } else {
        errors.push(`Unknown file field: '${file.fieldname}'`);
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: errors.join('; ')
    });
  }
  
  next();
};

