const config = require('./config');
const { info, error } = require('../../console-log');
const { sendBannerMessage } = require('./ticket-sender');
const { createTicket, closeTicket, saveTranscript, getTicketType } = require('./ticket-manager');
const { t } = require('./lang-helper');
const path = require('path');

const currentFile = `${path.basename(path.dirname(__filename))}/${path.basename(__filename)}`;
let channel = null;

module.exports = function(client, colors) {
    client.once('clientReady', async () => {
        channel = client.channels.cache.get(config.channelId);
        
        if (!channel) {
            error(currentFile, t('errors.channelNotFound', { channelId: config.channelId }));
            return;
        }

        if (!channel.isTextBased()) {
            error(currentFile, t('errors.notTextChannel'));
            return;
        }
        
        try {
            const result = await sendBannerMessage(channel);
            if (result.success && !result.skipped) {
                info(currentFile, t('logs.bannerSent'));
            } else if (result.skipped) {
                info(currentFile, t('logs.bannerExists'));
            }
        } catch (err) {
            error(currentFile, t('errors.sendBannerFailed', { error: err.message }));
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const buttonCustomIds = config.buttons.map(btn => btn.label.toLowerCase().replace(/\s+/g, '_'));
        
        if (buttonCustomIds.includes(interaction.customId) || interaction.customId.startsWith('close_ticket_') || interaction.customId.startsWith('transcript_ticket_')) {
            
            if (interaction.replied || interaction.deferred) {
                return;
            }
            
            let initialReply = false;
            try {
                await interaction.reply({ 
                    content: t('tickets.processing'),
                    flags: [64] // EPHEMERAL flag
                });
                initialReply = true;
            } catch (replyErr) {
                if (replyErr.code === 10062 || replyErr.message.includes('already been acknowledged')) {
                    return;
                }
                error(currentFile, `Failed to reply to interaction: ${replyErr.message}`);
                return;
            }
            
            try {
                if (interaction.customId.startsWith('transcript_ticket_')) {
                    const result = await saveTranscript(interaction);
                    if (result.success) {
                        info(currentFile, t('logs.transcriptSaved', { 
                            userName: interaction.user.displayName || interaction.user.username, 
                            channelName: result.channelName 
                        }));
                    }
                    return;
                }
                
                if (interaction.customId.startsWith('close_ticket_')) {
                    const result = await closeTicket(interaction);
                    if (result.success) {
                        info(currentFile, t('logs.ticketClosed', { 
                            userName: interaction.user.displayName || interaction.user.username, 
                            channelName: result.channelName 
                        }));
                    }
                    return;
                }

                const ticketType = getTicketType(interaction.customId);
                
                if (ticketType) {
                    const result = await createTicket(interaction, ticketType);
                    if (result.success) {
                        info(currentFile, t('logs.ticketCreated', { 
                            userName: interaction.user.displayName || interaction.user.username, 
                            ticketType: ticketType, 
                            channelName: result.channelName 
                        }));
                    }
                } else {
                    await interaction.editReply(t('tickets.unknownType'));
                }
                
            } catch (err) {
                error(currentFile, t('errors.interactionFailed', { error: err.message }));
                
                if (initialReply) {
                    try {
                        await interaction.editReply(t('tickets.errorProcessing'));
                    } catch (editErr) {
                    }
                }
            }
        }
    });
};