import * as nodemailer from 'nodemailer';

export async function sendEmail(email: string, pdf: Buffer | string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'c960182@gmail.com',
        pass: 'moauavqhjylqhnwh',
      },
    });

    const mailOptions = {
      from: 'DoNotReply" <noreply@example.com>',
      to: email,
      subject: 'Formulário de Avaliação Sintomática de lipedema',
      text: 'Aqui está o resultado do seu formulário!',
      attachments: [
        {
          filename: 'formulario.pdf',
          content: pdf,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}
