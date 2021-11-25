const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require ('fs');


// Setting the prefix
let prefix = '>';

// When the bot is ready
client.on('ready', () => {
  console.log('I am ready!');
});

let modLogOn = false;  
let modLogChannel = null;
// SETTING MOD LOG CHANNEL
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}modlog`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return;
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Administrator** permission to use this command!');
            return message.channel.send(noPermsEmbed);
        }
        if (message.content.toLowerCase().startsWith(`${prefix}modlog disable`)) {
            modLogOn = false;
            const modLogDisableEmbed = new Discord.MessageEmbed()
                .setAuthor('Moderation Logs Disabled!');
            return message.reply(modLogDisableEmbed);
        } else if (message.content.toLowerCase().startsWith(`${prefix}modlog set`)) {
            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                const botPermsEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ I require the **Administrator** permission to bypass channel restrictions, so I can log moderation!');
                return message.channel.send(botPermsEmbed);
            }
            modLogChannel = args.slice(2).join(' ');
            if (!modLogChannel) {
                const noChannelEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ A valid channel was not specified!');
                return message.reply(noChannelEmbed);
            }
            modLogOn = true;
            const modLogChannelEmbed = new Discord.MessageEmbed()
                .setAuthor('Moderation Logs Enabled!')
                .setDescription(`Set the moderation logs channel to ${modLogChannel}!`);
            message.reply(modLogChannelEmbed);
            const modLogChannelID = modLogChannel.split('');
            const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
            const id = idArray.join('').toString();
            const modLogSetupEmbed = new Discord.MessageEmbed()
                .setAuthor('Channel Set')
                .setDescription('This channel will log all moderation events in the server!');
            message.guild.channels.cache.get(id).send(modLogSetupEmbed);
        }
    } 
});

let messageLogOn = false;  
let messageLogChannel = null;
// SETTING MESSAGE LOG CHANNEL
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}messagelog`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return;
        if (!message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Administrator** permission to use this command!');
            return message.channel.send(noPermsEmbed);
        }
        if (message.content.toLowerCase().startsWith(`${prefix}messagelog disable`)) {
            messageLogOn = false;
            const messageLogDisableEmbed = new Discord.MessageEmbed()
                .setAuthor('Moderation Logs Disabled!');
            return message.reply(messageLogDisableEmbed);
        } else if (message.content.toLowerCase().startsWith(`${prefix}messagelog set`)) {
            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                const botPermsEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ I require the **Administrator** permission to bypass channel restrictions, so I can log message events!');
                return message.channel.send(botPermsEmbed);
            }
            messageLogChannel = args.slice(2).join(' ');
            if (!messageLogChannel) {
                const noChannelEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ A valid channel was not specified!');
                return message.reply(noChannelEmbed);
            }
            messageLogOn = true;
            const messageLogChannelEmbed = new Discord.MessageEmbed()
                .setAuthor('Message Event Logs Enabled!')
                .setDescription(`Set the message event logs channel to ${messageLogChannel}!`)
            message.reply(messageLogChannelEmbed);
            const messageLogChannelID = messageLogChannel.split('');
            const idArray = messageLogChannelID.slice(2, (messageLogChannelID.length - 1));
            const id = idArray.join('').toString();
            const messageLogSetupEmbed = new Discord.MessageEmbed()
                .setAuthor('Channel Set')
                .setDescription('This channel will log all message events in the server!')
            message.guild.channels.cache.get(id).send(messageLogSetupEmbed);
        }
    } 
});

// KICK MEMBERS
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}kick`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return;
        const user = message.mentions.users.first(); // Boolean value

        if(!message.member.hasPermission('KICK_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Kick Members** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }
        
        if(!message.guild.me.hasPermission("KICK_MEMBERS") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
            const botPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I require the **Kick Members** permission to kick members!')
            return message.channel.send(botPermsEmbed);
        }

        if (user) {
            const member = message.guild.member(user);
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't kick a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let kickReason = args.slice(2).join(' ');
                (kickReason.trim().length === 0) ? kickReason = 'Unspecified' : 
                member
                    .kick({ days: 0, reason: kickReason })
                    .then(() => {
                        const kickEmbed = new Discord.MessageEmbed()
                            .setAuthor(`${user.username}#${user.discriminator} was kicked`, 'https://www10.lunapic.com/editor/working/160297987890420969?7216548368')
                            .setDescription(`Reason: ${kickReason}`)
                            .setColor('RED')
                            .setThumbnail(user.avatarURL)
                            .setTimestamp()
                            .setFooter(`Kicked by ${message.author.username}#${message.author.discriminator}`)
                        // We let the message author know we were able to kick the person (also dm the user after)
                        message.reply(kickEmbed);
                        if (modLogOn === false) return;
                        const modLogChannelID = modLogChannel.split('');
                        const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                        const id = idArray.join('').toString();
                        const kickLogEmbed = new Discord.MessageEmbed()
                            .setAuthor(`<KICK> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                            .addFields([
                                { name: 'Member', value: `<@${user.id}>`, inline: true },
                                { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                                { name: 'Channel', value: `${message.channel}`, inline: true },
                                { name: 'Reason', value: `${kickReason}`, inline: true }
                            ])
                            .setColor('RED')
                        message.guild.channels.cache.get(id).send(kickLogEmbed);
                    })
                    .catch(err => {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to kick the member. Please check that the permissions/roles are set up properly to allow me to do this.')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        // Log the error on console
                        return console.error(err);
                    });
            } else {
                // If user wasnt in server
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }
        // If no user was mentioned
        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You didnt mention a user to kick, or the user specified isn\'t in the server!')
            message.reply(noMemberEmbed);
        }
    } 
});

// BAN MEMBERS
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}ban`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return;
        const user = message.mentions.users.first();

        if(!message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        if(!message.guild.me.hasPermission("BAN_MEMBERS") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
            const botPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I require the **Ban Members** permission to ban members!')
            return message.channel.send(botPermsEmbed);
        }

        if (user) {
            const member = message.guild.member(user);
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't ban a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let banReason = args.slice(2).join(' ');
                (banReason.trim().length === 0) ? banReason = 'Unspecified' : 
                member
                    .ban({ days: 0, reason: banReason })
                    .then(() => {
                        const banEmbed = new Discord.MessageEmbed()
                            .setAuthor(`${user.username}#${user.discriminator} was banned`, 'https://www10.lunapic.com/editor/working/160297987890420969?7216548368')
                            .setDescription(`Reason: ${banReason}`)
                            .setColor('RED')
                            .setTimestamp()
                            .setFooter(`Banned by ${message.author.username}#${message.author.discriminator}`)
                        // We let the message author know we were able to kick the person (also dm the user after)
                        message.reply(banEmbed);
                        if (modLogOn === false) return;
                        const modLogChannelID = modLogChannel.split('');
                        const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                        const id = idArray.join('').toString();
                        const banLogEmbed = new Discord.MessageEmbed()
                            .setAuthor(`<BAN> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                            .addFields([
                                { name: 'Member', value: `<@${user.id}>`, inline: true },
                                { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                                { name: 'Channel', value: `${message.channel}`, inline: true },
                                { name: 'Reason', value: `${banReason}`, inline: true }
                            ])
                            .setColor('RED')
                        message.guild.channels.cache.get(id).send(banLogEmbed);
                    })
                    .catch(err => {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to ban the member. Please check that the permissions/roles are set up properly to allow me to do this.')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        // Log the error on console
                        return console.error(err);
                    });
            } else {
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }
        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You didnt mention a user to ban, or the user specified isn\'t in the server!')
            message.reply(noMemberEmbed);
        }
    } 
});

// UNBAN MEMBERS
client.on('message', async message => { 
    if (message.content.toLowerCase().startsWith(`${prefix}unban`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return; 

        if(!message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        if(!message.guild.me.hasPermission("BAN_MEMBERS") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
                    const botPermsEmbed = new Discord.MessageEmbed()
                        .setDescription('❌ I require the **Ban Members** permission to unban members!')
                    return message.channel.send(botPermsEmbed);
        } 

        let reason = args.slice(2).join(' ');
        let needsUnban = args.slice(1, 2).join(' ');
        if(!reason) reason = 'Unspecified';
        try {
            // When trying to unban a member that is not banned, an error will log on console
            message.guild.members.unban(needsUnban)
            const unbanEmbed = new Discord.MessageEmbed()
                .setAuthor('User#0000 was unbanned', 'https://www10.lunapic.com/editor/working/160297978620462243?5735993085')
                .setDescription(`Reason: ${reason}`)
                .setColor('GREEN')
                .setTimestamp()
                .setFooter(`Unbanned by ${message.author.username}#${message.author.discriminator}`)
            message.channel.send(unbanEmbed);
            if (modLogOn === false) return;
            const modLogChannelID = modLogChannel.split('');
            const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
            const id = idArray.join('').toString();
            const unbanLogEmbed = new Discord.MessageEmbed()
                .setAuthor(`<UNBAN> ${needsUnban}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                .addFields([
                    { name: 'Member', value: `<@${needsUnban}>`, inline: true },
                    { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                    { name: 'Channel', value: `${message.channel}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: true }
                ])
                .setColor('GREEN')
            message.guild.channels.cache.get(id).send(unbanLogEmbed);
        } catch(e) {
            console.log(e);
            const errorEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I was unable to unban the member. Please check that the permissions/roles are set up properly to allow me to do this.')
            return message.channel.send(errorEmbed);
        }
    }
});

// TEMPMUTE MEMBERS
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}tempmute`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return; 
        const user = message.mentions.users.first();

        if(!message.member.hasPermission('MANAGE_MESSAGES') 
        && !message.member.hasPermission('KICK_MEMBERS') 
        && !message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members**, **Kick Members**, or **Manage Messages** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        if(!message.guild.me.hasPermission("MANAGE_ROLES") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
            const botPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I require the **Manage Roles** permission to mute members!')
            return message.channel.send(botPermsEmbed);
        }

        if (user) {
            const member = message.guild.member(user);
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't mute a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let minutes = args.slice(2, 3);
                let muteReason = args.slice(3).join(' ');
                if (muteReason.trim().length === 0) muteReason = 'Unspecified';
                let mutedRole = message.guild.roles.cache.find(role => role.name == 'Muted');
                if (!mutedRole) {
                    mutedRole = message.guild.roles.create({
                        data: {
                            name: "Muted",
                            color: "#ff0000",
                        },
                        reason: 'No Muted role found, so created one.'
                    })
                    const createdRoleEmbed = new Discord.MessageEmbed()
                        .setDescription('No Muted role was setup, so I created one. Please re-run the command!')
                    return message.reply(createdRoleEmbed);
                }

                message.guild.channels.cache.each((channel) => { 
                    channel.createOverwrite(mutedRole, {
                        ADD_REACTIONS: false, 
                        SEND_MESSAGES: false,
                        CONNECT: false
                    });
                });

                member
                    .roles.add(mutedRole, muteReason)
                    .then(() => {
                        const muteEmbed = new Discord.MessageEmbed()
                                .setAuthor(`${user.tag} was muted for ${minutes} minutes`, 'https://www10.lunapic.com/editor/working/160297987890420969?7216548368')
                                .setDescription(`Reason: ${muteReason}`)
                                .setColor('ORANGE')
                                .setTimestamp()
                                .setFooter(`Muted by ${message.author.username}#${message.author.discriminator}`)
                            message.reply(muteEmbed);
                            if (modLogOn === false) return;
                            const modLogChannelID = modLogChannel.split('');
                            const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                            const id = idArray.join('').toString();
                            const tempmuteLogEmbed = new Discord.MessageEmbed()
                                .setAuthor(`<MUTE> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                                .addFields([
                                    { name: 'Member', value: `<@${user.id}>`, inline: true },
                                    { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                                    { name: 'Channel', value: `${message.channel}`, inline: true },
                                    { name: 'Reason', value: `${muteReason}`, inline: true },
                                    { name: 'Duration', value: `${minutes} minutes`, inline: false }
                                ])
                                .setColor('ORANGE')
                            message.guild.channels.cache.get(id).send(tempmuteLogEmbed);
                            message.reply('The muted role is ' + mutedRole);
                    })
                    .catch(err => {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to mute the member. Please check that the permissions/roles are set up properly to allow me to do this.')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        message.reply('The muted role is ' + mutedRole);
                        // Log the error on console
                        return console.error(err);
                    });
            
                setTimeout(() => { member.roles.remove(mutedRole, `Tempmute expired.`); }, minutes * 60000); 
            } else {
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }
        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You didnt mention a user to mute, or the user specified isn\'t in the server!')
            message.reply(noMemberEmbed);
        }
    }
});

// MUTE MEMBERS
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}mute`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return; 
        const user = message.mentions.users.first();

        if(!message.member.hasPermission('MANAGE_MESSAGES')
        && !message.member.hasPermission('KICK_MEMBERS')
        && !message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members**, **Kick Members**, or **Manage Messages** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        if(!message.guild.me.hasPermission("MANAGE_ROLES") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
            const botPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I require the **Manage Roles** permission to mute members!')
            return message.channel.send(botPermsEmbed);
        }

        if (user) {
            const member = message.guild.member(user);
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't mute a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let muteReason = args.slice(2).join(' ');
                if (muteReason.trim().length === 0) muteReason = 'Unspecified';
                let mutedRole = message.guild.roles.cache.find(role => role.name == 'Muted');
                if (!mutedRole) {
                    mutedRole = message.guild.roles.create({
                        data: {
                            name: "Muted",
                            color: "#ff0000",
                        },
                        reason: 'No Muted role found, so created one.'
                    })
                    const createdRoleEmbed = new Discord.MessageEmbed()
                        .setDescription('No Muted role was setup, so I created one. Please re-run the command!')
                    return message.reply(createdRoleEmbed);
                }
                
                message.guild.channels.cache.each((channel) => { 
                    channel.createOverwrite(mutedRole, {
                        ADD_REACTIONS: false, 
                        SEND_MESSAGES: false,
                        CONNECT: false
                    });
                });
                
                member
                    .roles.add(mutedRole, muteReason)
                    .then(() => {
                        const muteEmbed = new Discord.MessageEmbed()
                                .setAuthor(`${user.tag} was muted indefinitely`, 'https://www10.lunapic.com/editor/working/160297987890420969?7216548368')
                                .setDescription(`Reason: ${muteReason}`)
                                .setColor('ORANGE')
                                .setTimestamp()
                                .setFooter(`Muted by ${message.author.username}#${message.author.discriminator}`)
                            message.reply(muteEmbed);
                            if (modLogOn === false) return;
                            const modLogChannelID = modLogChannel.split('');
                            const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                            const id = idArray.join('').toString();
                            const muteLogEmbed = new Discord.MessageEmbed()
                                .setAuthor(`<MUTE> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                                .addFields([
                                    { name: 'Member', value: `<@${user.id}>`, inline: true },
                                    { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                                    { name: 'Channel', value: `${message.channel}`, inline: true },
                                    { name: 'Reason', value: `${muteReason}`, inline: true },
                                    { name: 'Duration', value: '∞', inline: false}
                                ])
                                .setColor('ORANGE')
                            message.guild.channels.cache.get(id).send(muteLogEmbed);
                    })
                    .catch(err => {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to mute the member. Please check that the permissions/roles are set up properly to allow me to do this.')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        // Log the error on console
                        return console.error(err);
                    });
            } else {
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }

        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
            .setDescription('❌ You didnt mention a user to mute, or the user specified isn\'t in the server!')
        message.reply(noMemberEmbed);
        }
    }
});

// UNMUTE MEMBERS
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}unmute`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return; 
        const user = message.mentions.users.first();

        if(!message.member.hasPermission('MANAGE_MESSAGES') 
        && !message.member.hasPermission('KICK_MEMBERS') 
        && !message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members**, **Kick Members**, or **Manage Messages** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        if(!message.guild.me.hasPermission("MANAGE_ROLES") 
        && !message.guild.me.hasPermission("ADMINISTRATOR")) {
            const botPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ I require the **Manage Roles** permission to unmute members!')
            return message.channel.send(botPermsEmbed);
        }

        if (user) {
            const member = message.guild.member(user);
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't unmute a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let unmuteReason = args.slice(2).join(' ');
                let mutedRole = message.guild.roles.cache.find(role => role.name == 'Muted');
                if (unmuteReason.trim().length === 0) unmuteReason = 'Unspecified';
                member
                    .roles.remove(mutedRole, unmuteReason)
                    .then(() => {
                        const unmuteEmbed = new Discord.MessageEmbed()
                                .setAuthor(`${user.tag} was unmuted`, 'https://www10.lunapic.com/editor/working/160297978620462243?5735993085')
                                .setDescription(`Reason: ${unmuteReason}`)
                                .setColor('GREEN')
                                .setTimestamp()
                                .setFooter(`Unmuted by ${message.author.username}#${message.author.discriminator}`)
                            message.reply(unmuteEmbed);
                            if (modLogOn === false) return;
                            const modLogChannelID = modLogChannel.split('');
                            const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                            const id = idArray.join('').toString();
                            const unmuteLogEmbed = new Discord.MessageEmbed()
                                .setAuthor(`<UNMUTE> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                                .addFields([
                                    { name: 'Member', value: `<@${user.id}>`, inline: true },
                                    { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                                    { name: 'Channel', value: `${message.channel}`, inline: true },
                                    { name: 'Reason', value: `${unmuteReason}`, inline: true }
                                ])
                                .setColor('GREEN')
                            message.guild.channels.cache.get(id).send(unmuteLogEmbed);

                    })
                    .catch(err => {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to unmute the member. Please check that the permissions/roles are set up properly to allow me to do this.')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        // Log the error on console
                        return console.error(err);
                    });
            } else {
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }
        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You didnt mention a valid user to unmute, or the user specified isn\'t in the server!')
            message.reply(noMemberEmbed);
        }

    }
});

// WARN MEMBERS 
client.on('message', async message => {
    if (message.content.toLowerCase().startsWith(`${prefix}warn`)) {
        const args = message.content.slice(prefix.length).trim().split(' ');
        if (!message.guild) return; 
        const user = message.mentions.users.first();

        if(!message.member.hasPermission('MANAGE_MESSAGES') 
        && !message.member.hasPermission('KICK_MEMBERS') 
        && !message.member.hasPermission('BAN_MEMBERS') 
        && !message.member.hasPermission('ADMINISTRATOR')) {
            const noPermsEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You require the **Ban Members**, **Kick Members**, or **Manage Messages** permission to use this command!')
            return message.channel.send(noPermsEmbed);
        }

        // BOT DOESNT NEED PERMS TO WARN

        if (user) {
            const member = message.guild.member(user);
    
            if (member.permissions.has('ADMINISTRATOR')
            || member.permissions.has('BAN_MEMBERS') 
            || member.permissions.has('KICK_MEMBERS') 
            || member.permissions.has('MANAGE_ROLES') 
            || member.permissions.has('MANAGE_CHANNELS') 
            || member.permissions.has('MANAGE_MESSAGES') 
            || member.permissions.has('MANAGE_NICKNAMES')) {
                const modError = new Discord.MessageEmbed()
                    .setDescription(`❌ You can't warn a moderator!`)
                return message.reply(modError);
            }
            if (member) {
                let warnReason = args.slice(2).join(' ');
                if (warnReason.trim().length === 0) warnReason = 'Unspecified';
                try {
                    const warnEmbed = new Discord.MessageEmbed()
                        .setAuthor(`${user.tag} was warned`, 'https://cdn.discordapp.com/attachments/770823352365350942/771801505048297472/160298000011918161.png')
                        .setDescription(`Reason: ${warnReason}`)
                        .setColor('YELLOW')
                        .setTimestamp()
                        .setFooter(`Warned by ${message.author.username}#${message.author.discriminator}`)
                    message.reply(warnEmbed);
                    if (modLogOn === false) return;
                    const modLogChannelID = modLogChannel.split('');
                    const idArray = modLogChannelID.slice(2, (modLogChannelID.length - 1));
                    const id = idArray.join('').toString();
                    const warnLogEmbed = new Discord.MessageEmbed()
                        .setAuthor(`<WARNING> ${user.tag}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
                        .addFields([
                            { name: 'Member', value: `<@${user.id}>`, inline: true },
                            { name: 'Moderator', value: `<@${message.author.id}>`, inline: true },
                            { name: 'Channel', value: `${message.channel}`, inline: true },
                            { name: 'Reason', value: `${warnReason}`, inline: true }
                        ])
                        .setColor('YELLOW')
                    message.guild.channels.cache.get(id).send(warnLogEmbed);

                } catch(e) {
                        const errorEmbed = new Discord.MessageEmbed()
                            .setDescription('❌ I was unable to warn the member due to an unknown error!')
                        // If the member can't be kicked (role problem, perms problem, etc.)
                        message.reply(errorEmbed);
                        // Log the error on console
                        console.log(e);
                }
            } else {
                const notInServerEmbed = new Discord.MessageEmbed()
                    .setDescription('❌ That user isn\'t in the server!');
                message.reply(notInServerEmbed);
            }
        } else {
            const noMemberEmbed = new Discord.MessageEmbed()
                .setDescription('❌ You didnt mention a valid user to warn, or the user specified isn\'t in the server!')
            message.reply(noMemberEmbed);
        }
    }
});

// doesnt work
client.on("guildMemberAdd", member => {
    if (messageLogOn === false) return;
    const messageLogChannelID = messageLogChannel.split('');
    const idArray = messageLogChannelID.slice(2, (messageLogChannelID.length - 1));
    const id = idArray.join('').toString();
    console.log(idArray, id);
    const messageLogEmbed = new Discord.MessageEmbed()
        .setAuthor(`<NEW MEMBER> ${member.nickname}`, 'https://cdn.discordapp.com/attachments/772586166922903553/772586180960714772/unnamed.png')
        .addFields([
            { name: 'Member', value: `<@${member.id}>`, inline: true },
            { name: 'Joined Server', value: `${member.joinedAt}`, inline: true },
            { name: 'Account Created', value: `${member.user.createdAt}`, inline: true },
            { name: 'ID', value: `${member.id}`, inline: true },
        ])
        .setColor('RED')
    member.guild.channels.cache.get(id).send(messageLogEmbed);
});

client.login('NzcwMDExMTg1NjIxNzYyMDY4.X5XWzA.WJeQ6zH5-GFvN6tdv_a9JUsnilI');

