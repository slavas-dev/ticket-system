# Ticket System Plugin

Discord bot plugin that provides a comprehensive support ticket system with categories, transcript functionality, and user-friendly management.

## Version
**v1.0.0**

## Repository
[https://github.com/slavas-dev/discord-plugin-core](https://github.com/slavas-dev/discord-plugin-core)

## Features

- ✅ Interactive banner with category buttons
- ✅ Automatic ticket channel creation
- ✅ Random or user-ID based naming
- ✅ Transcript generation with file splitting
- ✅ Pinned welcome messages
- ✅ Permission-based access control
- ✅ Multi-language support
- ✅ Silent notification options
- ✅ Professional Apache log format transcripts

## Configuration

```javascript
{
    channelId: 'DISCORD_CHANNEL_ID',      // Banner channel
    categoryId: 'DISCORD_CATEGORY_ID',    // Ticket category
    silence: true,                        // Silent messages
    language: 'en',                       // Language: English
    
    ticketNaming: {
        useRandomSuffix: true,            // Random vs userID naming
        randomLength: 6                   // Random suffix length
    },
    
    buttons: [
        {
            label: 'Game Help',
            style: 'Primary',
            emoji: '🎮'
        }
        // ... more buttons
    ]
}
```

## Button Styles

- 🔵 **Primary** - Blue
- ⚪ **Secondary** - Gray
- 🟢 **Success** - Green
- 🔴 **Danger** - Red

## Ticket Features

### Channel Creation
- Automatic permission setup
- User-specific access
- Category organization
- Unique naming system

### Transcript System
- Complete conversation export
- Apache log format (.txt)
- Automatic file splitting (8MB chunks)
- Batch file delivery
- Attachment preservation

### Management
- Close ticket with confirmation
- Save transcript anytime
- Permission validation
- Error handling

## File Structure

```
ticket-system/
├── config.js           # Plugin configuration
├── index.js            # Main plugin logic
├── ticket-manager.js   # Ticket operations
├── ticket-sender.js    # Banner and button handling
├── lang-helper.js      # Translation system
├── lang/               # Language files
│   └── en.js           # English translations
├── banner.png          # Ticket system banner image
└── README.md           # This file
```

## Setup Instructions

1. **Configure IDs**: Set `channelId` and `categoryId` in config.js
2. **Add Banner**: Place `banner.png` in the plugin directory
3. **Customize Buttons**: Modify the buttons array for your needs
4. **Set Permissions**: Ensure bot has manage channels permission
5. **Language**: Customize translations in `lang/en.js`

## Supported Languages

- 🇺🇸 **English** (en) - Default
- Easily extensible for other languages

## Author
**slavas.dev**