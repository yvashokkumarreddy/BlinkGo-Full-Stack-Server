import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// const resendApi= "re_HLLveEbt_HzJ9zrux2GjTvEJ3fm2Fn5tF"
const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({sendTo,subject,html})=>{
    try{
        const { data, error } = await resend.emails.send({
            from: 'BlinkGo <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
          });
          if (error) {
            return console.error({ error });
          }

          return data;
    }catch(e){
        console.log(e)
    }
}

export default sendEmail;