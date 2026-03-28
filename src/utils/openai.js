const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateImage = async prompt => {
  const imageParameters = {
    prompt: "A cute baby sea otter",
    n: 2,
    size: "512x512",
  }
  const response = await openai.createImage(imageParameters);
  console.log(response)
  let urlData = ""
  if(response.data){
    urlData = response.data.data[0].url;
  }

  console.log(";;;;",urlData);
  return urlData;
}



// export const generateContent = async prompt => {
//   try {
//     const completion = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt,
//     },{
//       timeout: 10000,
//       headers: {
//         "Example-Header": "example",
//       },
//     });
//     return completion.data.choices[0].text
//   } catch (error) {
//     if (error.response) {
//       console.log(error.response.status);
//       console.log(error.response.data);
//     } else {
//       console.log(error.message);
//     }
//   }
// }




export const generateContent = async prompt => {
  try {
    const res = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: "It was the best of times",
        max_tokens: 100,
        temperature: 0,
        stream: true,
    }, { responseType: 'stream' });
    
    res.data.on('data', data => {
        const lines = data.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
                return; // Stream finished
            }
            try {
                const parsed = JSON.parse(message);
                console.log(parsed.choices[0].text);
            } catch(error) {
                console.error('Could not JSON parse stream message', message, error);
            }
        }
    });
} catch (error) {
    if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
            const message = data.toString();
            try {
                const parsed = JSON.parse(message);
                console.error('An error occurred during OpenAI request: ', parsed);
            } catch(error) {
                console.error('An error occurred during OpenAI request: ', message);
            }
        });
    } else {
        console.error('An error occurred during OpenAI request', error);
    }
}
}