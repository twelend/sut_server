require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
const useRoutes = require('./routes/requests.routes')

const app = express()
const PORT = process.env.PORT;


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ limit: "25mb" }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.use('/', useRoutes)

function sendEmail({ 
    phone,
    email,
    name,
    parentName,
    date,
    time }) {
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })

        const calculateAge = (birthDate) => {
            let currentDate = new Date();
            let birth = new Date(birthDate);
            return (currentDate - birth) / (1000 * 60 * 60 * 24 * 365);
        }

        const mailConfig = {
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            subject: `Новая Заявка от ${parentName} на ${name}!`,
            html:
                `
                <h1>${parentName} Оставила заявку на ${name}!</h1>
                <table border="4px" width="80%" align="center">
                    <tr>
                        <th bgcolor="yellow" width="25%">ФИО Родителя</th>
                        <td style="font: 13px Georgia, serif;">${parentName}</td>
                    </tr>

                    <tr>
                        <th bgcolor="yellow">ФИО Ребенка</th>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <th bgcolor="yellow">Дата рождения ребенка</th>
                        <td>${date} (Полных лет: ${calculateAge(date)})</td>
                    </tr>
                    <tr>
                        <th bgcolor="yellow">Номер телефона</th>
                        <td>${phone}</td>
                    </tr>

                    <tr>
                        <th bgcolor="yellow">Почта</th>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <th bgcolor="yellow">Направление</th>
                        <td>-</td>
                    </tr>
                    <tr>
                        <th bgcolor="yellow">Половина Дня</th>
                        <td>${time}</td>
                    </tr>
                    
                </table>
                `,
        }

        transporter.sendMail(mailConfig, err => {
            if (err) {
                return resolve({ message: `Произошла ошибка при отправке сообщения` })
            }
            return reject({ message: `Сообщение успешно доставленно` })
        });
    });
}

app.get('/sendForm', async (req, res) => {
    try {
      const response = await sendEmail(req.query);
      res.send(response.message);
    } catch (err) {
      res.status(400).send(err.message); 
    }
  });

app.listen(PORT, () => {
    console.log('Started on Port', PORT)
})