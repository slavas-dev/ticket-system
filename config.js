module.exports = {
    plugin: {
        name: 'Ticket System',
        version: '1.0.0',
        author: 'slavas.dev',
        description: 'A system for managing support tickets'
    },
    channelId: 'YOUR_CHANNEL_ID_HERE',
    categoryId: 'YOUR_CATEGORY_ID_HERE',
    silence: true,
    language: 'en',

    ticketNaming: {
        useRandomSuffix: true,
        randomLength: 6
    },

    closeButton: {
        label: 'Close Ticket',
        style: 'Danger'
    },

    transcriptButton: {
        label: 'Save Transcript',
        style: 'Secondary'
    },

    buttons: [
        {
            label: 'Game Help',
            style: 'Primary',
            emoji: '🎮'
        },
        {
            label: 'Technical Support',
            style: 'Secondary',
            emoji: '🛠️'
        },
        {
            label: 'Bug Report',
            style: 'Danger',
            emoji: '🐛'
        },
        {
            label: 'General Inquiry',
            style: 'Success',
            emoji: '💬'
        }
    ]
};