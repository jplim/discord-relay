const Discord = require('discord.js');

const listen = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const relay = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const config = require('./config.json');

listen.on('ready', () => {
    console.log(`Listener logged in as ${listen.user.tag}!`);
});

relay.on('ready', () => {
    console.log(`Relayer logged in as ${relay.user.tag}!`);
});

listen.on('messageCreate', msg => {
    if (msg.channel.id === config.channelId) {
        const author = msg.author;
        const embeds = msg.content !== '' ? [
            new Discord.MessageEmbed({
                title: '',
                description: msg.content,
                author: {
                    name: author.username,
                    iconURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.webp`
                }
            })
        ] : [];

        embeds.forEach(embed => embed.setTimestamp());

        let files = [];

        for (const [key, value] of msg.attachments) {
            files.push({
                attachment: value.attachment,
                name: value.name,
                description: value.description
            })
        }

        if (!embeds.length && !files.length)
            return;
        
        relay.channels
            .fetch(config.channelDupeId)
            .then(channel => {
                channel.send({
                    embeds: embeds,
                    files: files
                });
            });
    }
});

listen.login(config.listenToken);
relay.login(config.relayToken);
