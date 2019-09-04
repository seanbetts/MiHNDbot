// Import required pckages
const path = require('path');
const restify = require('restify');

// Import required bot services.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { BotConfiguration } = require('botframework-config');

// Import middleware for transcript logging
const { TranscriptLoggerMiddleware } = require('botbuilder-core'); // ConsoleTranscriptLogger,

// Import storage for transcript
const { AzureBlobTranscriptStore } = require('botbuilder-azure');

// Enable Application Insights
const appInsights = require('applicationinsights');
appInsights.setup('REMOVED_SECRET')
    .setUseDiskRetryCaching(true)
    .start();

// This bot's main dialog.
const { DialogBot } = require('./bots/dialogBot');

// Read botFilePath and botFileSecret from .env file
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Get the .bot file path
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));
let botConfig;
try {
    // Read bot configuration from .bot file.
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(`Error reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    process.exit();
}

// For local development configuration as defined in .bot file
const DEV_ENVIRONMENT = 'development';

// Name of Transcript Blob Type service within the .bot file
const BLOB_TRANSCRIPT_CONFIGURATION = 'BlobTranscriptStorage';

// Define name of the endpoint configuration section from the .bot file
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

// Get bot endpoint configuration by service name - Bot configuration as defined in .bot file
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);

// Create bot adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppId, // || endpointConfig.appId,
    appPassword: process.env.microsoftAppPassword // || endpointConfig.appPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`😬/nOops. Something went wrong! Please try asking me something else.`);
    // Clear out state
    await conversationState.delete(context);
};

// Get blob service configuration for transcripts and console logs as defined in .bot file
const blobTranscriptStorageConfig = botConfig.findServiceByNameOrId(BLOB_TRANSCRIPT_CONFIGURATION);

// The transcript store has methods for saving and retrieving bot conversation transcripts.
let transcriptStore = new AzureBlobTranscriptStore({
    storageAccountOrConnectionString: blobTranscriptStorageConfig.connectionString,
    containerName: blobTranscriptStorageConfig.container
});

// Create the middleware layer responsible for logging incoming and outgoing activities into the transcript store.
var transcriptMiddleware = new TranscriptLoggerMiddleware(transcriptStore);
adapter.use(transcriptMiddleware);

// Define state store for your bot.
// See https://aka.ms/about-bot-state to learn more about bot state.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Pass in a logger to the bot. For this sample, the logger is the console, but alternatives such as Application Insights and Event Hub exist for storing the logs of the bot.
const logger = console;

// Create the main dialog.
// const dialog = new UserProfileDialog(userState, logger);
const bot = new DialogBot(conversationState, userState, logger);

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});
