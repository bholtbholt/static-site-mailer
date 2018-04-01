# Static Site Mailer

A [Serverless](https://serverless.com/) service for submitting contact forms on static sites. It uses AWS Lambda in Node to send AWS Simple Email Service emails to verified addresses. **This repo can be forked to deploy your own service for use on your own static site.**

# Setup and Requirements

Setup requires an AWS account and a local Node + Yarn environment.

## Installing This Service

1. Run `yarn`
1. Set Up Your AWS Account
1. Set Up AWS SES

## Setting Up Your AWS Account

The Serverless Framework has recorded a [video walk-through](https://www.youtube.com/watch?v=KngM5bfpttA) for setting up AWS credentials, but I've listed the steps here as well.

1. Sign Up for an [AWS account](https://aws.amazon.com/s/dm/optimization/server-side-test/free-tier/free_np/) or log in if you already have one.
1. In the AWS search bar, search for "IAM".
1. On the IAM page, click on "Users" on the sidebar, then the "Add user" button.
1. On the Add user page, give the user a name -- something like "serverless" is appropriate. Check "Programmatic access" under Access type then click next.
1. On the permissions screen, click on the "Attach existing policies directly" tab, search for "AdministratorAccess" in the list, check it, and click next.
1. On the review screen you should see your user name, with "Programmatic access", and "AdministratorAccess", then create the user.
1. The confirmation screen shows the user "Access key ID" and "Secret access key", you'll need these to provide the Serverless Framework with access. In your CLI, type `yarn sls config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_ACCESS_KEY`, replacing YOUR_ACCESS_KEY_ID and YOUR_SECRET_ACCESS_KEY with the keys on the confirmation screen.

## Setting Up AWS Simple Email Service

1. Click Console Home in the top left corner.
1. On home page, in the AWS search bar, search for "Simple Email Service".
1. On the SES Home page, click on "Email Addresses" in the sidebar.
1. On the Email Addresses listing page, click the "Verify a New Email Address" button.
1. In the dialog window, type your email address then click "Verify This Email Address".
1. You'll receive an email in moments containing a link to verify the address. Click on the link to complete the process.

## Setting Up the Form

Static Site Mailer expects the form to submit stringified JSON and returns a JSON response. It's best used with AJAX calls.

### Form Paramters

The Static Site Mailer expects the following parameters to be present in your form:

| Name        | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| ses_address | The verified AWS SES email address to send the email from                             |
| send_to     | The verified AWS SES email address to send the email to                               |
| subject     | The sending email subject line                                                        |
| name        | The name field on the contact form                                                    |
| reply_to    | The email field on the contact form, also used in the reply to field in the email     |
| message     | The message text area on the contact form                                             |
| honeypot    | An optional honeypot filter. If the honeypot has any value, the form will be rejected |

The **form action** must be the full URL of the service and the **method** must be set to `POST`.

### Form Example

```html
<form action="{{ SERVICE URL }}" method="POST">
  <input type="hidden" name="ses_address" value="{{ VERIFIED SES SENDING FROM EMAIL }}" />
  <input type="hidden" name="send_to" value="{{ VERIFIED SES SENDING TO EMAIL }}" />
  <input type="hidden" name="subject" value="{{ EMAIL SUBJECT }}" />
  <input type="input" name="honeypot" value="" style="display: none" tabindex="-1" autocomplete="off">
  <label>
    Name
    <input type="text" name="name" required>
  </label>
  <label>
    Email
    <input type="email" name="reply_to" required>
  </label>
  <label>
    Message:
    <textarea name="message" required></textarea>
  </label>
  <button type="submit">Send Message</button>
</form>
```

### Form AJAX Example

To submit your form using AJAX, you can add the following code to your static site. This JavaScript syntax is compatible with the latest browsers.

```javascript
(() => {
  const form = document.querySelector('form');

  form.onsubmit = e => {
    e.preventDefault();
    // Escape if the honeypot has been filled
    if (!!form.children.namedItem('honeypot').value) return;

    // Prepare data to send
    const data = {};
    const formElements = Array.from(form);
    formElements.map(input => (data[input.name] = input.value));

    // Construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open(form.method, form.action, true);
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // Send the collected data as JSON
    xhr.send(JSON.stringify(data));

    // Callback function
    xhr.onloadend = response => {
      if (response.target.status === 200) {
        // The form submission was successful
      } else {
        // The form submission failed
        // Static Site Mailer returns a JSON object with error messages on
        // JSON.parse(response.target.response).message
        // console.error(JSON.parse(response.target.response).message);
      }
    };
  };
})();
```

## Setting Up CORS

If the service URL isn't your own domain, you'll need to set up CORS. For use with a single domain, it's easiest to set it up in the `sendEmail` `response` as a hard-coded value. In `handler.js`, it should be set up as your own domain.

```javascript
sendEmail(formData, function(err, data) {
  const response = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://www.your-domain.com',
    },
  ...
```

To accept all domains, simply change `'Access-Control-Allow-Origin'` to `*`, as in `'Access-Control-Allow-Origin': '*'` or [filter through white-listed domains](https://stackoverflow.com/questions/39628640/aws-api-gateway-cors-access-control-allow-origin-multiple-entries/41708323#41708323).

# Deploying

Run `yarn deploy` to deploy the entire service or `yarn deploy-submit-form` to deploy the SubmitForm handler itself.

# Yarn Scripts

| Command            | Action                                                    |
| ------------------ | --------------------------------------------------------- |
| deploy             | Deploys entire Static Site Mailer Architecture            |
| deploy-submit-form | Deploys the SubmitForm handler/function                   |
| invoke             | Invokes SubmitForm from production                        |
| invoke-local       | Invokes SubmitForm from local                             |
| logs               | Prints production logs                                    |
| serverless         | Shortcut for local Serverless CLI package                 |
| sls                | Shortcut for local Serverless CLI package                 |
| service-info       | Prints Static Site Mailer Serice Information              |
| test               | Runs all the tests                                        |
| test-honeypot      | Returns the response when a honeypot is present           |
| test-ses           | Returns the reponse when the ses_address param is missing |
| test-send-to       | Returns the response when the send_to param is missing    |

# Resources

* [AWS SES API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html)
* [AWS SES API: sendEmail](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property)
* [AWS SES IAM Policies](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/control-user-access.html)
* [AWS verify-email-identify CLI Docs](https://docs.aws.amazon.com/cli/latest/reference/ses/verify-email-identity.html)
* [Serverless Framework AWS CLI Docs](https://serverless.com/framework/docs/providers/aws/cli-reference/info/)
* [Adding a Pretty URL](https://serverless.com/blog/serverless-api-gateway-domain/)
* [Serverless Contact Forms with AWS Lambda](https://medium.com/calyx/serverless-contact-forms-with-aws-lambda-79959cd1a6cd)
