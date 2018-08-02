import EventEmitter from "events"
import { Client as DiscordClient } from "discord.js"
import { assertInstanceOf } from "@scalize/tools"

const {set: WMSet, get: WMGet} = WeakMap.prototype;
const botRepo = new WeakMap();
const userStatesRepo = new WeakMap();

const getBot = (...args) => {
    return WMGet.call(botRepo, ...args);
};

const setBot = (...args) => {
    return WMSet.call(botRepo, ...args);
};

const getUserStates = (...args) => {
    return WMGet.call(userStatesRepo, ...args);
};

const setUserStates = (...args) => {
    return WMSet.call(userStatesRepo, ...args);
};



class MessageToolbox extends EventEmitter{
    constructor(bot){
        super();
        assertInstanceOf(bot, DiscordClient, "The 'bot' used to instantiate a 'MessageHub' must be a 'Discord.Client'");
        // this.bot = bot;
        // this.userStates = new Map();
        setBot(this, bot);
        setUserStates(this, new Map());
        this.initEvents();
    }

    static from(...args){ return new this(...args); }

    setUserState(user, state){
        return getUserStates(this).set(user, state);
    }

    getUserState(user){
        return getUserStates(this).get(user);
    }

    authorIsBot({ author }){
        return getBot(this).user === author;
    }

    channelIsDm({ channel: { type } }){
        return type === "dm";
    }

    botIsInDndMode(){
        return getBot(this).user.presence.status === "dnd";
    }

    botIsCalled({ mentions: { members, roles }, guild }){
        const bot = getBot(this);
        return members.exists('user', bot.user)
        || roles.some(role => guild.members.find('id', bot.user.id).roles.array().includes(role))
    }

    initEvents(){
        getBot(this).on("message", message => {
            if(this.channelIsDm(message) || this.botIsInDndMode() || this.authorIsBot(message))
                return;

            if(this.botIsCalled(message)){
                this.setUserState(message.author, "called");
                this.emit("called", message.author);
            }

            this.emit("message", message);
        });
    }
}

export {
    MessageToolbox,
}