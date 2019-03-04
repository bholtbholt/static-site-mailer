'use strict';

const AWS = require('aws-sdk');
const SES = new AWS.SES();

function validOrigin(testOrigin) {
  const VALID_ORIGINS = ['http://localhost:3000', 'https://www.jennypreswick.com', 'https://www.brianholt.ca'];
  return VALID_ORIGINS.filter(origin => origin === testOrigin)[0] || VALID_ORIGINS[0];
}

function sendEmail(formData, callback) {
  const emailParams = {
    Source: formData.ses_address,
    ReplyToAddresses: [formData.reply_to],
    Destination: {
      ToAddresses: [formData.send_to],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `${formData.message}\n\nName: ${formData.name}\nEmail: ${formData.reply_to}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: formData.subject,
      },
    },
  };

  SES.sendEmail(emailParams, callback);
}

module.exports.submitForm = (event, context, callback) => {
  const origin = event.headers.Origin || event.headers.origin;
  const formData = JSON.parse(event.body);

  // Return with no response if honeypot is present
  if (formData.honeypot) return;

  // Return with no response if the origin isn't white-listed
  if (!validOrigin(origin)) return;

  sendEmail(formData, function(err, data) {
    const response = {
      statusCode: err ? 500 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
      body: JSON.stringify({
        message: err ? err.message : data,
      }),
    };

    callback(null, response);
  });
};
