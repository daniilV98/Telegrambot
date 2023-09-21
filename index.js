const TelegramApi = require('node-telegram-bot-api')
const sequelize = require('./db')
const UserModel = require('./models')
const token = ''
const bot = new TelegramApi(token, {polling: true})

const start = async ()  => {

    try {
        await sequelize.authenticate()
        await sequelize.sync() //синхронизация моделей с таблицами в БД
    } catch (e) {
        console.log('Connection to DB failed', e)
    }

    await bot.setMyCommands([
        {command: '/start', description: 'Welcome message'},
        {command: '/info', description: 'Get user info'},
    ])

    bot.on('message', async msg => { // слушатель события на обработку полученных сообщений
        const text = msg.text;
        const chatId = msg.chat.id;
        const firstName = msg.chat.first_name;
        const lastName = msg.chat.last_name;
        const userName = msg.chat.username;

        try {
            if (text === '/start') {
                if (!await UserModel.findOne({chatId})) {
                    await UserModel.create({chatId: chatId, firstName: firstName, lastName: lastName, userName: userName})
                    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/7.webp')
                    return bot.sendMessage(chatId, `${firstName}, welcome to RangoBot`);
                } else {
                    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/6.webp')
                    return bot.sendMessage(chatId, `Hello, ${firstName}`);
                }
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId,
                    `${msg.from.first_name} ${msg.from.last_name}, you registered here at: ${user.createdAt}`);
            }
            return bot.sendMessage(chatId, "I don't understand you, let's try again!")
        } catch (e) {
            return bot.sendMessage(chatId, 'Error, something went wrong!')
        }
    })
}

start()