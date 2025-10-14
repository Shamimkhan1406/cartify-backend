// import the nessesary aws sdk modules for ses
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
// load environment variables from .env file
require('dotenv').config();
// initialize the ses client with the region and credentials from environment variables
const client = new SESClient({
    region: process.env.aws_region,
    credentials: {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
    }
});

// function to generate imple HTML content for the welcome email

const generateWelcomeEmailHtml =()=>{
    return `
    <html>
        <body>
            <h1>Welcome to ${process.env.app_name}!</h1>
        </body>
    </html>
    `
};

// function to send a welcome email to provided email address
const sendWelcomeEmail = async (email) => {
    // define the email parameters for the ses sendEmail command
    const params = {
        Source: process.env.email_from, // sender email address
        ReplyToAddresses: [process.env.email_to], // reply-to email address
        Destination: {
            ToAddresses: [email], // recipient email address
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8", // ensure the email body is encoded in UTF-8 character encoding
                    Data: generateWelcomeEmailHtml(), // generate the HTML content for the email body from the helper function
                },
            },
            Subject: {
                Charset: "UTF-8", // ensure the email subject is encoded in UTF-8 character encoding
                Data: `Welcome to ${process.env.app_name}!`, // subject line for the email
            }
        }
    };
    // create a new SendEmailCommand with the defined parameters
    const command = new SendEmailCommand(params);
    try {
        // send the email using the ses client and await response
        const data = await client.send(command);
        return data; // return the response data from the send operation
    } catch (e) {
        console.error("Error sending email: "); // log any errors that occur during the send operation
        throw e; // re-throw the error to be handled by the caller
    }
};
// export the sendWelcomeEmail function for use in other modules
module.exports = sendWelcomeEmail;