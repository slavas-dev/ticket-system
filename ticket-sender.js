const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const config = require('./config');
const { error } = require('../../console-log');
const { t } = require('./lang-helper');
const path = require('path');
const fs = require('fs');

const currentFile = `${path.basename(path.dirname(__filename))}/${path.basename(__filename)}`;

async function sendBannerMessage(channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(msg => msg.author.id === channel.client.user.id);
    
    if (botMessages.size > 0) {
        return { success: true, skipped: true };
    }

    const bannerPath = path.join(__dirname, 'banner.png');
    if (!fs.existsSync(bannerPath)) {
        throw new Error(t('errors.bannerNotFound'));
    }

    const attachment = new AttachmentBuilder(bannerPath, { name: 'banner.png' });

    const buttons = config.buttons.map(buttonConfig => {
        const customId = buttonConfig.label.toLowerCase().replace(/\s+/g, '_');
        
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setLabel(buttonConfig.label)
            .setStyle(ButtonStyle[buttonConfig.style]);
        
        if (buttonConfig.emoji && buttonConfig.emoji.trim() !== '') {
            button.setEmoji(buttonConfig.emoji);
        }
        
        return button;
    });

    const row = new ActionRowBuilder().addComponents(buttons);

    const messageOptions = {
        files: [attachment],
        components: [row]
    };
    
    if (config.silence) {
        messageOptions.flags = [4096];
    }

    await channel.send(messageOptions);
    
    return { success: true, skipped: false };
}

module.exports = {
    sendBannerMessage
};