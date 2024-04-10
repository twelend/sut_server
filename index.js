require("dotenv").config()
const exelJs = require('exceljs');
const tmp = require('tmp');
const moment = require('moment');
const TgApi = require('node-telegram-bot-api');
var fs = require('fs');
const db = require('./db')

const token = process.env.TG_TOKEN;

const bot = new TgApi(token, { polling: true })

const commands = [
    { command: '/start', description: 'Начать беседу' },
    { command: '/help', description: 'Что я могу делать...' },
];

bot.setMyCommands(commands)
    .then(() => {
        console.log('Команды бота установлены успешно');
    })
    .catch((error) => {
        console.error('Ошибка при установке команд бота:', error);
    });

const start = () => {

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
        const messageId = query.message.message_id;
        
        if (data === '/allreq') {
            await bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(chatId, `⌛Выгрузка началась...`);
            await getData(chatId);
        } else if (data === '/clearallreq') {
            await db.query(`ALTER SEQUENCE requests_id_seq RESTART WITH 1`);
            const requests = await db.query(`DELETE FROM requests`)
            return bot.sendMessage(chatId, 'Все заявки в базе данных очищены, количество заявок: ' + requests.rows.length)
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (text === '/start') {
            return bot.sendMessage(chatId, 'Привет, я SUT Bot. Напиши /help, чтобы узнать мои команды.')
        }
        if (text === '/help') {
            await bot.sendMessage(chatId, '/start - начать беседу\n/help - помощь', {
                reply_markup: {
                    inline_keyboard: [
                      [{ text: 'Выгрузить заявки', callback_data: '/allreq' }],
                      [{ text: 'Очистить все заявки', callback_data: '/clearallreq' }],
                    ]
                  }
            })
            return; 
        }
        if (text === '/allreq') {
            await bot.sendMessage(chatId, `⌛Выгрузка началась...`)
            return await getData(chatId)
        }
        if (text === '/clearallreq') {
            await db.query(`ALTER SEQUENCE requests_id_seq RESTART WITH 1`);
            const requests = await db.query(`DELETE FROM requests`)
            return bot.sendMessage(chatId, 'Все заявки в базе данных очищены, количество заявок: ' + requests.rows.length)
        }
        return bot.sendMessage(chatId, 'Я не понял тебя, напиши /help, чтобы узнать мои команды.')
    })

    
}

async function getData(chatId) {
    try {
        // Получение данных с базы
        const requests = await db.query(`SELECT * FROM requests`);
        console.log(requests.rows)
        // Создание эксель файла
        const workbook = new exelJs.Workbook();
        const sheet = workbook.addWorksheet('SUT');
        sheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'ФИО Родителя', key: 'parentname', width: 30 },
            { header: 'ФИО Ребенка', key: 'name', width: 30 },
            { header: 'Дата рождения', key: 'date', width: 20 },
            { header: 'Номер телефона', key: 'phone', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Половина дня', key: 'time', width: 20 },
        ];

        requests.rows.map((item) => {
            console.log(item)
            sheet.addRow({
                id: item.id,
                parentname: item.parentname,
                name: item.name,
                date: item.date,
                phone: item.phone,
                email: item.email,
                time: item.time
            });
        });
        // const currentDate = moment().format('YYYY-MM-DD');
        const filename = `SUT__${moment().format('YYYY-MM-DD')}.xlsx`;
        const tmpFile = tmp.fileSync({ postfix: '.xlsx' });
        const tmpFilePath = tmpFile.name;
        await workbook.xlsx.writeFile(tmpFilePath);

        bot.sendDocument(chatId, tmpFilePath, {
            filename: filename,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }).then(() => {
            bot.sendMessage(chatId, '⬆Все заявки в базе данных выгружены в файл⬆', {
                reply_markup: {
                    inline_keyboard: [
                      [{ text: 'Очистить все заявки', callback_data: '/clearallreq' }],
                    ]
                  }
            });
        });

    } catch (error) {
        bot.sendMessage(chatId, error);
    }
}

start()