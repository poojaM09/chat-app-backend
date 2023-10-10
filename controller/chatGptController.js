const openai = require("./chatGptConfig");

const chatApi = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({
      message: "message is required",
    });
  }
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // prompt: `convert the following natural language description into a sql query Helloooo `,
      messages: [
        {
          role: "user",
          content: message, 
        },
      ],
      max_tokens: 200,
      temperature: 0,
    });

    return res.json({
      message: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.log("error", err);
  }
};

const imagGenrator = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({
      message: "message is required",
    });
  }
  const response = await openai.createImage({
    prompt: message,
    n: 1,
    size: "1024x1024",
  });
  image_url = response.data.data[0].url;
  return res.json({
    message: image_url,
  });
};
module.exports = { chatApi, imagGenrator };
