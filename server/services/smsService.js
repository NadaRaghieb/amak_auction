// const axios = require("axios");

// const sendSMS = async (phone, message) => {
//   try {
//     const response = await axios.post(
//       process.env.UNIFONIC_URL,
//       {
//         AppSid: process.env.UNIFONIC_APP_SID,
//         SenderID: process.env.UNIFONIC_SENDER_ID,
//         Recipient: phone,
//         Body: message,
//         responseType: "JSON",
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("SMS sent:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("SMS error:", error.response?.data || error.message);
//   }
// };

// module.exports = sendSMS;