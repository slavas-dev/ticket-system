const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('./config');
const { error } = require('../../console-log');
const { t } = require('./lang-helper');
const path = require('path');

const currentFile = `${path.basename(path.dirname(__filename))}/${path.basename(__filename)}`;

function generateRandomSuffix(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function createTicket(interaction, ticketType) {
    const guild = interaction.guild;
    const userId = interaction.user.id;
    
    let ticketSuffix;
    let ticketName;
    let existingTicket;
    
    if (config.ticketNaming.useRandomSuffix) {
        do {
            ticketSuffix = generateRandomSuffix(config.ticketNaming.randomLength);
            ticketName = `${ticketType}-${ticketSuffix}`;
            existingTicket = guild.channels.cache.find(channel => 
                channel.name === ticketName && channel.parentId === config.categoryId
            );
        } while (existingTicket);
    } else {
        ticketSuffix = userId;
        ticketName = `${ticketType}-${ticketSuffix}`;
        existingTicket = guild.channels.cache.find(channel => 
            channel.name === ticketName && channel.parentId === config.categoryId
        );
    }
    
    try {
        if (!config.ticketNaming.useRandomSuffix && existingTicket) {
            await interaction.editReply(t('tickets.alreadyExists', { 
                ticketType: ticketType, 
                channelId: existingTicket.id 
            }));
            return { success: false, reason: 'exists' };
        }

        const ticketChannel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: config.categoryId,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: userId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ],
                }
            ]
        });

        await interaction.editReply(t('tickets.created', { 
            ticketType: ticketType, 
            channelId: ticketChannel.id 
        }));
        
        const welcomeMessage = t('tickets.welcome', { userId: userId });
        const privacyMessage = t('tickets.privacy');
        
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`transcript_ticket_${ticketChannel.id}`)
                    .setLabel(config.transcriptButton.label)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`close_ticket_${ticketChannel.id}`)
                    .setLabel(config.closeButton.label)
                    .setStyle(ButtonStyle.Danger)
            );
        
        const messageOptions = {
            content: welcomeMessage + '\n\n' + privacyMessage,
            components: [actionRow]
        };
        
        if (config.silence) {
            messageOptions.flags = [4096];
        }
        
        const welcomeMsg = await ticketChannel.send(messageOptions);
        
        try {
            await welcomeMsg.pin();
        } catch (pinErr) {
            error(currentFile, `Failed to pin welcome message: ${pinErr.message}`);
        }

        return { 
            success: true, 
            channelId: ticketChannel.id, 
            channelName: ticketChannel.name 
        };
    } catch (err) {
        error(currentFile, `Failed to create ticket: ${err.message}`);
        try {
            await interaction.editReply(t('tickets.creationFailed'));
        } catch (replyErr) {
            error(currentFile, `Failed to send error response: ${replyErr.message}`);
        }
        return { success: false, reason: 'error', error: err.message };
    }
}

async function closeTicket(interaction) {
    const channelId = interaction.customId.replace('close_ticket_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    
    try {
        if (!channel) {
            await interaction.editReply(t('tickets.channelNotFound'));
            return { success: false, reason: 'not_found' };
        }
        
        let isOwner = false;
        
        if (config.ticketNaming.useRandomSuffix) {
            const userPermissions = channel.permissionOverwrites.cache.get(interaction.user.id);
            isOwner = userPermissions && userPermissions.allow.has(PermissionFlagsBits.ViewChannel);
        } else {
            isOwner = channel.name.endsWith(`-${interaction.user.id}`);
        }
        
        const hasPermission = interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels);
        
        if (!isOwner && !hasPermission) {
            await interaction.editReply(t('tickets.noPermission'));
            return { success: false, reason: 'no_permission' };
        }
        
        await interaction.editReply(t('tickets.closingTicket'));
        await channel.send(t('tickets.closing'));
        
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (deleteErr) {
                error(currentFile, t('errors.deleteChannelFailed', { error: deleteErr.message }));
            }
        }, 5000);
        
        return { 
            success: true, 
            channelName: channel.name 
        };
    } catch (err) {
        error(currentFile, `Failed to close ticket: ${err.message}`);
        try {
            await interaction.editReply(t('tickets.closeFailed'));
        } catch (replyErr) {
            error(currentFile, `Failed to send error response: ${replyErr.message}`);
        }
        return { success: false, reason: 'error', error: err.message };
    }
}

async function saveTranscript(interaction) {
    const channelId = interaction.customId.replace('transcript_ticket_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    
    try {
        if (!channel) {
            await interaction.editReply(t('tickets.channelNotFound'));
            return { success: false, reason: 'not_found' };
        }
        
        let isOwner = false;
        
        if (config.ticketNaming.useRandomSuffix) {
            const userPermissions = channel.permissionOverwrites.cache.get(interaction.user.id);
            isOwner = userPermissions && userPermissions.allow.has(PermissionFlagsBits.ViewChannel);
        } else {
            isOwner = channel.name.endsWith(`-${interaction.user.id}`);
        }
        
        const hasPermission = interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels);
        
        if (!isOwner && !hasPermission) {
            await interaction.editReply(t('tickets.noPermission'));
            return { success: false, reason: 'no_permission' };
        }
        
        await interaction.editReply(t('tickets.savingTranscript'));
        
        let allMessages = [];
        let lastId;
        
        while (true) {
            const options = { limit: 100 };
            if (lastId) {
                options.before = lastId;
            }
            
            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) break;
            
            allMessages.push(...Array.from(messages.values()));
            lastId = messages.last().id;
            
        }
        
        const sortedMessages = allMessages.reverse();
        
        let transcript = t('tickets.transcriptHeader') + '\n';
        transcript += t('tickets.transcriptChannel', { channelName: channel.name }) + '\n';
        transcript += t('tickets.transcriptCreated', { date: new Date().toISOString() }) + '\n';
        transcript += t('tickets.transcriptMessages', { count: sortedMessages.length }) + '\n\n';
        transcript += `=====================================\n\n`;
        
        const transcriptContent = [];
        
        sortedMessages.forEach(msg => {
            const timestamp = msg.createdAt.toISOString().replace('T', ' ').replace('Z', ' UTC');
            const author = msg.author.username;
            const content = msg.content || t('tickets.transcriptNoContent');
            
            transcriptContent.push(`[${timestamp}] ${author}:`);
            transcriptContent.push(content);
            transcriptContent.push('');
            
            if (msg.attachments.size > 0) {
                msg.attachments.forEach(attachment => {
                    transcriptContent.push(t('tickets.transcriptAttachment', { 
                        name: attachment.name, 
                        url: attachment.url 
                    }));
                });
                transcriptContent.push('');
            }
        });
        
        const maxFileSize = 8 * 1024 * 1024;
        const files = [];
        
        const fullContent = transcript + transcriptContent.join('\n');
        const fullContentBuffer = Buffer.from(fullContent, 'utf8');
        
        if (fullContentBuffer.length <= maxFileSize) {
            const attachment = new (require('discord.js').AttachmentBuilder)(fullContentBuffer, { 
                name: `transcript-${channel.name}-${Date.now()}.txt` 
            });
            files.push(attachment);
        } else {
            const headerSize = Buffer.from(transcript, 'utf8').length;
            let currentContent = '';
            let currentSize = headerSize;
            let partNumber = 1;
            const totalParts = Math.ceil(fullContentBuffer.length / maxFileSize);
            
            for (let i = 0; i < transcriptContent.length; i++) {
                const line = transcriptContent[i] + '\n';
                const lineSize = Buffer.from(line, 'utf8').length;
                
                if (currentSize + lineSize > maxFileSize && currentContent.length > 0) {
                    const partHeader = transcript + `Part ${partNumber} of ${totalParts}\n\n=====================================\n\n`;
                    const partContent = partHeader + currentContent;
                    const buffer = Buffer.from(partContent, 'utf8');
                    const attachment = new (require('discord.js').AttachmentBuilder)(buffer, { 
                        name: `transcript-${channel.name}-part${partNumber}-${Date.now()}.txt` 
                    });
                    files.push(attachment);
                    
                    currentContent = '';
                    currentSize = headerSize;
                    partNumber++;
                }
                
                currentContent += line;
                currentSize += lineSize;
            }
            
            if (currentContent.length > 0) {
                const partHeader = transcript + `Part ${partNumber} of ${totalParts}\n\n=====================================\n\n`;
                const partContent = partHeader + currentContent;
                const buffer = Buffer.from(partContent, 'utf8');
                const attachment = new (require('discord.js').AttachmentBuilder)(buffer, { 
                    name: `transcript-${channel.name}-part${partNumber}-${Date.now()}.txt` 
                });
                files.push(attachment);
            }
        }
        
        await interaction.editReply(t('tickets.transcriptReady'));
        
        const maxFilesPerMessage = 10;
        for (let i = 0; i < files.length; i += maxFilesPerMessage) {
            const fileBatch = files.slice(i, i + maxFilesPerMessage);
            const isFirstBatch = i === 0;
            
            await channel.send({
                content: isFirstBatch ? t('tickets.transcriptSuccess') : t('tickets.transcriptFilePart', { part: Math.floor(i/maxFilesPerMessage) + 1 }),
                files: fileBatch
            });
        }
        
        return { 
            success: true, 
            channelName: channel.name 
        };
    } catch (err) {
        error(currentFile, `Failed to save transcript: ${err.message}`);
        try {
            await interaction.editReply(t('tickets.transcriptFailed'));
        } catch (replyErr) {
            error(currentFile, `Failed to send error response: ${replyErr.message}`);
        }
        return { success: false, reason: 'error', error: err.message };
    }
}

function getTicketType(customId) {
    const buttonConfig = config.buttons.find(btn => 
        btn.label.toLowerCase().replace(/\s+/g, '_') === customId
    );
    
    if (buttonConfig) {
        return buttonConfig.label.toLowerCase().replace(/\s+/g, '-');
    }
    
    return null;
}

module.exports = {
    createTicket,
    closeTicket,
    saveTranscript,
    getTicketType
};