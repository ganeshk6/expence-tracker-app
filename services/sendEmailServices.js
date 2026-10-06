import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
    apiKey: process.env.SMPT_KEY,
});

export const sendForgotPasswordEmail = async (
    email,
    fullName,
    resetLink
) => {

    try {

        await client.transactionalEmails.sendTransacEmail({

            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: 'Expense Tracker'
            },

            to: [
                {
                    email: email,
                    name: fullName
                }
            ],

            subject: 'Reset Your Expense Tracker Password',

            htmlContent: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                ">

                    <h2 style="color: #2563eb;">
                        Password Reset Request
                    </h2>

                    <p>
                        Hello ${fullName},
                    </p>

                    <p>
                        We received a request to reset your
                        Expense Tracker account password.
                    </p>

                    <p>
                        Click the button below to reset your password:
                    </p>

                    <a
                        href="${resetLink}"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #2563eb;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Reset Password
                    </a>

                    <p style="margin-top: 20px;">
                        This link will expire soon.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p>
                        Thanks,<br>
                        Expense Tracker Team
                    </p>

                </div>
            `
        });

        return true;

    } catch (error) {

        console.error(
            'Brevo email error:',
            error.response?.body || error.message
        );

        throw error;
    }
};