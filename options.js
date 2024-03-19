module.exports = {
    authOptions : {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Авторизоваться', callback_data: '/auth' }]
            ]
        })
    },

    adminOptions : {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Выгрузить данные о всех заявках', callback_data: '/allReq' }, { text: 'Новые заявки', callback_data: '/newReq' }],
                [{ text: 'Стереть все заявки', callback_data: '/clearAllReq' }]
            ]
        })
    }
}