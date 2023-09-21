const TelegramApi = require('node-telegram-bot-api')

const token = ''

const bot = new TelegramApi(token, {polling: true})

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Welcome message'},
        {command: '/info', description: 'Get user info'},
    ])

    bot.on('message', async msg => { // слушатель события на обработку полученных сообщений
        const text = msg.text;
        const  chatId = msg.chat.id;

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/7.webp')
            return bot.sendMessage(chatId, `Welcome to RangoBot`);
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}`);
        }
        return bot.sendMessage(chatId, "I don't understand you, let's try again!")
    })
}

start()