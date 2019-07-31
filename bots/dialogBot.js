const { ActivityHandler, ActivityTypes } = require('botbuilder');
const { CardFactory } = require('botbuilder-core');
const { QnAMaker } = require('botbuilder-ai');

// const CONVERSATION_DATA_PROPERTY = 'conversationData';
// const USER_PROFILE_PROPERTY = 'userProfile';

const WelcomeCard = require('../resources/welcomeCard.json');
const fbCards = require('../resources/fbCards.js');
const fbBot = require('../bots/fbBot.js');
// const teamsWelcomeCard = require('../resources/teamsWelcomeCard.json');

// initialized to access values in .env file.
var dotenv = require('dotenv');
dotenv.config();

var sendTyping = async function(context) {
    await context.sendActivities([
        { type: 'typing' },
        { type: 'delay', value: 2000 }
    ]);
};

class DialogBot extends ActivityHandler {
    constructor(conversationState, userState, dialog, logger, transcriptStore) {
        super();

        // Create the state property accessors for the conversation data and user profile.
        // this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        // this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        // The state management objects for the conversation and user state.
        // this.conversationState = conversationState;
        // this.userState = userState;

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!logger) {
            logger = console;
            logger.log('[DialogBot]: logger not passed in, defaulting to console');
        }

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAAuthKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            logger.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        this.dialogState = this.conversationState.createProperty('DialogState');

        // The transcript store will be queried to retrieve the transcript if the bot receives '!history' from a user.
        this.transcriptStore = transcriptStore;

        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            await sendTyping(context);
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                    await context.sendActivity({ attachments: [welcomeCard] });
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onTurn(async (turnContext, next) => {
            if (turnContext.activity.text === '!history') {
                // Retrieve the activities from the Transcript (blob store) and send them over to the channel when a request to upload history arrives. This could be an event or a special message activity as above.
                // Create the connector client to send transcript activities
                let connector = turnContext.adapter.createConnectorClient(turnContext.activity.serviceUrl);

                // Get all the message type activities from the Transcript.
                let continuationToken = '';
                var count = 0;

                // WebChat and Emulator require modifying the activity.Id to display the same activity again within the same chat window
                let updateActivities = [ 'webchat', 'emulator', 'directline' ].includes(turnContext.activity.channelId);
                let incrementId = 0;
                if (updateActivities && turnContext.activity.id.includes('|')) {
                    incrementId = parseInt(turnContext.activity.id.split('|')[1]) || 0;
                } do {
                    // Transcript activities are retrieved in pages.  When the continuationToken is null, there are no more activities to be retireved for this conversation.
                    var pagedTranscript = await this.transcriptStore.getTranscriptActivities(turnContext.activity.channelId, turnContext.activity.conversation.id, continuationToken);
                    let activities = pagedTranscript.items.filter(item => item.type === ActivityTypes.Message);

                    if (updateActivities) {
                        activities.forEach(function(a) {
                            incrementId++;
                            a.id = `${ turnContext.activity.conversation.id }|${ incrementId.toString().padStart(7, '0') }`;
                            a.timestamp = new Date().toISOString();
                            a.channelData = []; // WebChat uses ChannelData for id comparisons, so we clear it here
                            a.replyToId = '';
                        });
                    }

                    // DirectLine only allows the upload of at most 500 activities at a time. The limit of 1500 below is arbitrary and up to the Bot author to decide.
                    count += activities.length;
                    if (activities.length > 500 || count > 1500) {
                        console.log('Attempt to upload too many activities'); // throw new InvalidOperationException
                    }

                    await connector.conversations.sendConversationHistory(turnContext.activity.conversation.id, { activities });
                    continuationToken = pagedTranscript.continuationToken;
                }
                while (continuationToken != null);

                console.log('Transcript sent');
            } else {
                // Echo back to the user whatever they typed.
                console.log(`User sent: ${ turnContext.activity.text }\n`);
            }
            await next();
        });

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            await sendTyping(context);
            console.log('Processing a Message Activity');

            const qnaResults = await this.qnaMaker.getAnswers(context);

            // Show choices if the Facebook Payload from ChannelData is not handled
            if (!await fbBot.processFacebookPayload(context, context.activity.channelData)) {
                // detect if Facebook Messenger is the channel being used
                if (context.activity.channelId === 'facebook') {
                    let facebookPayload = context.activity.channelData;
                    let fbSender = facebookPayload.sender;
                    var fbPSID = fbSender.id;
                    if (qnaResults[0]) {
                        const { answer, context: { prompts } } = qnaResults[0];

                        // set a variable for the prompts array from QnA
                        var qnaPrompts = null;
                        if (qnaResults[0].context != null) {
                            qnaPrompts = qnaResults[0].context.prompts;
                        }

                        // map the prompts to the required format for quick_replies channelData
                        var qnaPromptsArray = qnaPrompts.map(obj => {
                            return { content_type: 'text', title: obj.displayText, payload: obj.displayText };
                        });

                        let reply;
                        if (prompts.length) {
                            const quickReply = {
                                channelData: {
                                    text: answer,
                                    quick_replies: qnaPromptsArray
                                }
                            };
                            reply = quickReply;
                        } else {
                            reply = {
                                channelData: {
                                    text: answer
                                }
                            };
                        }

                        await context.sendActivity(reply);

                        // If no answers were returned from QnA Maker, reply with help.
                    } else {
                        let errorCardFB = await fbCards.getErrorCardFB(fbPSID);
                        await context.sendActivity(errorCardFB);
                    }
                } else {
                // If an answer was received from QnA Maker, send the answer back to the user.
                    if (qnaResults[0]) {
                        const { answer, context: { prompts } } = qnaResults[0];

                        let reply;
                        if (prompts.length) {
                            const card = {
                                'type': 'AdaptiveCard',
                                'body': [
                                    {
                                        'type': 'TextBlock',
                                        'text': answer,
                                        wrap: true
                                    }
                                ],
                                'actions': prompts.map(({ displayText }) => ({ type: 'Action.Submit', title: displayText, data: displayText })),
                                '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                                'version': '1.1'
                            };

                            reply = { attachments: [CardFactory.adaptiveCard(card)] };
                        } else {
                            reply = answer;
                        }

                        await context.sendActivity(reply);

                        // If no answers were returned from QnA Maker, reply with help.
                    } else {
                        await context.sendActivity('I\'m sorry, I don\'t have an answer for that. Please ask me something else, such as: \n\n "What Is Mental Health?" \n\n "What Is NeuroDiversity" \n\n "Help"');
                    }
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onEvent(async (turnContext) => {
            console.log('Processing an Event Activity.');

            // Analyze Facebook payload from EventActivity.Value
            await fbBot.processFacebookPayload(turnContext, turnContext.activity.value);
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
