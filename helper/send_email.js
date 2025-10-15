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

const generateOtpEmailHtml =(otp)=>{
    return `
    <html>
        <body>
            <h1>Welcome to ${process.env.app_name}!</h1>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p> your otp is: </p>
            <h2 style="color:blue;">${otp}</h2>
            <p> this otp is valid for 10 minutes only. </p>
            <p>Feel free to explore our app and let us know if you have any questions.</p>
            <p>Best regards,<br/>The ${process.env.app_name} Team</p>
            <hr/>
            <p> if this wasn't you, please ignore this email. </p>
            <p>Thanks,<br/>The ${process.env.app_name} Team</p>

        </body>
    </html>
    `
};

// function to send a welcome email to provided email address
const sendOtpEmail = async (email,otp) => {
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
                    Data: generateOtpEmailHtml(otp), // generate the HTML content for the email body from the helper function
                },
            },
            Subject: {
                Charset: "UTF-8", // ensure the email subject is encoded in UTF-8 character encoding
                Data: `Cartify Email Verification `, // subject line for the email
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
module.exports = sendOtpEmail;