import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ronald.santamaria@davinci.edu.ar",
    pass: "ancj cryn jpwe zkkd",
  },
  from: "ronald.santamaria@davinci.edu.ar",
});

export const sendEmail = async (to: string, code: string): Promise<void> => {
  try {
    const mailOptions = {
      from: "RonaldSantamaria - pizarroronald06@gmail.com",
      to,
      subject: "Código de verificación para tu cuenta",
      text: `Llego tu código de prueba
      El código es: ${code}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico enviado");
  } catch (error) {
    console.error("Error al enviar el correo: ", error);
  }
};
