'use strict';

const AWS = require('aws-sdk');
const SES = new AWS.SES();

module.exports.submitForm = (event, context, callback) => {
  const formData = JSON.parse(event.body);
  const emailParams = {
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
    ReplyToAddresses: [formData.reply_to],
    Source: formData.ses_address,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  SES.sendEmail(emailParams, function(err, data) {
    if (err) {
      console.log(err);
      callback(null, {
        statusCode: err.statusCode,
        headers: headers,
        body: JSON.stringify({
          message: err.message,
        }),
      });
    } else {
      callback(null, {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: data,
        }),
      });
    }
  });
};
