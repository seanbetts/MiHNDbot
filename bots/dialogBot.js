// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MemoryStorage } = require('botbuilder');
const restify = require('restify');
const { CosmosDbStorage } = require("botbuilder-azure");

// initialized to access values in .env file.
var dotenv = require('dotenv');
dotenv.config();

// Add memory storage.
// var storage = new MemoryStorage();

// Create access to CosmosDb Storage - this replaces local Memory Storage.
var storage = new CosmosDbStorage({
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT,
    authKey: process.env.AUTH_KEY,
    databaseId: process.env.DATABASE,
    collectionId: process.env.COLLECTION
})

class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     * @param {any} logger object for logging events, defaults to console if none is provided
     */
    constructor(conversationState, userState, dialog, logger) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!logger) {
            logger = console;
            logger.log('[DialogBot]: logger not passed in, defaulting to console');
        }

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            this.logger.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.DialogBot = DialogBot;
