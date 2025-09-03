module.exports = {
    errors: {
        channelNotFound: 'Channel with ID {channelId} not found',
        notTextChannel: 'Channel is not a text channel',
        bannerNotFound: 'banner.png not found in plugin directory',
        deleteChannelFailed: 'Error deleting ticket channel: {error}',
        interactionFailed: 'Error handling button interaction: {error}',
        sendBannerFailed: 'Error sending banner: {error}',
        languageNotFound: 'Language file for \'{language}\' not found, falling back to \'{defaultLang}\'',
        defaultLanguageNotFound: 'Default language file not found'
    },
    tickets: {
        alreadyExists: 'You already have an active {ticketType} ticket: <#{channelId}>',
        created: '{ticketType} ticket created successfully! <#{channelId}>',
        creationFailed: 'Failed to create ticket. Please try again later.',
        processing: 'Processing your request...',
        channelNotFound: 'Ticket channel not found.',
        noPermission: 'You do not have permission to close this ticket.',
        closing: 'Closing ticket in 5 seconds...',
        closeFailed: 'Failed to close ticket. Please try again later.',
        transcriptFailed: 'Failed to save transcript. Please try again later.',
        savingTranscript: 'Saving transcript...',
        transcriptReady: 'Transcript ready!',
        closingTicket: 'Closing ticket...',
        transcriptSuccess: 'Transcript saved successfully!',
        transcriptHeader: '# Ticket Transcript',
        transcriptChannel: 'Channel: {channelName}',
        transcriptCreated: 'Created: {date}',
        transcriptMessages: 'Total Messages: {count}',
        transcriptNoContent: '[No text content]',
        transcriptAttachment: '[Attachment] {name}: {url}',
        transcriptFilePart: 'Transcript files (part {part})',
        unknownType: 'Unknown ticket type.',
        errorProcessing: 'Error processing request. Please try again later.',
        privacy: '**Privacy Notice:**\nThis ticket is private and only visible to you and our support team. All information shared here will be kept confidential and used solely for resolving your inquiry.',
        welcome: 'Hello <@{userId}>! Your ticket has been created. Please describe your issue and wait for support.'
    },
    logs: {
        bannerSent: 'Banner with buttons sent successfully',
        bannerExists: 'Banner message already exists, skipping send',
        ticketCreated: '{userName} created {ticketType} ticket: {channelName}',
        ticketClosed: '{userName} closed ticket: {channelName}',
        transcriptSaved: '{userName} saved transcript for: {channelName}'
    }
};
