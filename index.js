const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')
const token = ''
const bot = new TelegramApi(token, {polling: true})
const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Guess the number from 0 to 9!');
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess', gameOptions);
}

const start = async ()  => {

    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true }) //синхронизация моделей с таблицами в БД (опция изменяет модель таблицы)
    } catch (e) {
        console.log('Connection to DB failed', e)
    }

    await bot.setMyCommands([
        {command: '/start', description: 'Welcome message'},
        {command: '/info', description: 'Get user info'},
        {command: '/game', description: 'Game guess the number'}
    ])

    bot.on('message', async msg => { // слушатель события на обработку полученных сообщений
        const text = msg.text;
        const chatId = String(msg.chat.id);
        const firstName = msg.chat.first_name;
        const lastName = msg.chat.last_name;
        const userName = msg.chat.username;

        try {
            if (text === '/start') {
                if (!await UserModel.findOne({where: {chatId}})) {
                    await UserModel.create({chatId: chatId, firstName: firstName, lastName: lastName, userName: userName})
                    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/7.webp')
                    return bot.sendMessage(chatId, `${firstName}, welcome to GuessRNumbot`);
                } else {
                    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/96/6.webp')
                    return bot.sendMessage(chatId, `Hello, ${firstName}`);
                }
            }
            if (text === '/info') {
                const user = await UserModel.findOne({where: {chatId}})
                return bot.sendMessage(chatId,
                    `${firstName}, you got right: ${user.right}, wrong: ${user.wrong}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, "I don't understand you, let's try again! Choose the commands on menu!");
        } catch (e) {
            return bot.sendMessage(chatId, 'Error, something went wrong!');
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = String(msg.message.chat.id)
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({where: {chatId}})
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Congratulations, you right: ${chats[chatId]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `Unfortunately, you wrong, the bot choose: ${chats[chatId]}`, againOptions);
        }
        await user.save();
    })
}

start()