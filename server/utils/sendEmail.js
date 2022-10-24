import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, content) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            service: process.env.MAIL_SERVICE,
            secureConnection: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: subject,
            html: content,
        });

        console.log("email sent successfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

export default sendEmail;
