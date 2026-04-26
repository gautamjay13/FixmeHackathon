const openai = require('../config/openai');
const { sendResponse, ApiError } = require('../utils/apiResponse');

const SYSTEM_PROMPT = `
You are FixNow's expert AI assistant for home services in India.
Analyze home repair/maintenance problems and return ONLY valid JSON.
Consider Indian pricing (INR), climate, and common housing issues.
Never include markdown, explanation, or text outside JSON.

Return exactly this structure:
{
  "suggestedService": "plumber|electrician|carpenter|painter|cleaner|ac_repair|appliance_repair|pest_control",
  "confidence": 0.0-1.0,
  "urgency": "low|medium|high|emergency",
  "estimatedCost": { "min": number, "max": number, "currency": "INR" },
  "estimatedDuration": "string",
  "tips": ["string", "string"],
  "requiresProfessional": boolean,
  "warningIfDelayed": "string or null",
  "possibleCauses": ["string"]
}
`;

exports.analyzeProblem = async (req, res, next) => {
  try {
    const { problem, images } = req.body;
    if (!problem) throw new ApiError(400, 'Problem description is required', 'MISSING_DATA');

    let content = [{ type: 'text', text: problem }];

    if (images && images.length > 0) {
      images.forEach(img => {
        content.push({
          type: 'image_url',
          image_url: { url: img }
        });
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content }
      ],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    sendResponse(res, 200, 'Analysis complete', analysis);
  } catch (error) {
    next(error);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { messages, bookingContext } = req.body;
    
    const contextStr = bookingContext ? `Current booking context: ${JSON.stringify(bookingContext)}` : '';
    
    const systemMessage = {
      role: 'system',
      content: `You are a helpful customer support assistant for FixNow home services. 
      Be polite, concise, and helpful. 
      ${contextStr}`
    };

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [systemMessage, ...messages]
    });

    sendResponse(res, 200, 'Chat response', { reply: completion.choices[0].message.content });
  } catch (error) {
    next(error);
  }
};
