const { OpenAI } = require('openai');

let openai = null;

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI configuration error:', error.message);
}

module.exports = openai;
