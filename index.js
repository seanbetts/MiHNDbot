// Import required pckages
const path = require('path');
const restify = require('restify');

// Import required bot services.
const { BotFrameworkAdapter, ConversationState, UserState } = require('botbuilder');

// Import middleware for transcript logging
const { TranscriptLoggerMiddleware } = require('botbuilder-core');

// Import storage for transcript
const { AzureBlobTranscriptStore, BlobStorage } = require('botbuilder-azure');

// Enable Application Insights
const appInsights = require('applicationinsights');
appInsights.setup('REMOVED_SECRET')
    .setUseDiskRetryCaching(true)
    .start();

// This bot's main dialog.
const { KnowledgeBot } = require('./bots/knowledgeBot');

// Read botFilePath and botFileSecret from .env file
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create bot adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppId,
    appPassword: process.env.microsoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`😬 Oops. Something went wrong! Please try asking me something else.`);
    // Clear out state
    await conversationState.delete(context);
};

// The transcript store has methods for saving and retrieving bot conversation transcripts.
let transcriptStore = new AzureBlobTranscriptStore({
    storageAccountOrConnectionString: process.env.BLOB_STRING,
    containerName: process.env.BLOB_TRANSCRIPTS_NAME
});

// Create the middleware layer responsible for logging incoming and outgoing activities into the transcript store.
var transcriptMiddleware = new TranscriptLoggerMiddleware(transcriptStore);
adapter.use(transcriptMiddleware);

// Define state store for your bot.
// See https://aka.ms/about-bot-state to learn more about bot state.
const stateStorage = new BlobStorage({
    storageAccountOrConnectionString: process.env.BLOB_STRING,
    containerName: process.env.BLOB_STATE_NAME
});

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(stateStorage);
const userState = new UserState(stateStorage);

// Pass in a logger to the bot. For this sample, the logger is the console, but alternatives such as Application Insights and Event Hub exist for storing the logs of the bot.
const logger = console;

// Create the main dialog.
// const dialog = new UserProfileDialog(userState, logger);
const bot = new KnowledgeBot(conversationState, userState, logger); //add dialog

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
