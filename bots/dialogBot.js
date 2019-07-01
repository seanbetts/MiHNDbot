const { ActivityHandler, MemoryStorage } = require('botbuilder');
const { CardFactory } = require('botbuilder-core');
const { CosmosDbStorage } = require("botbuilder-azure");
const { QnAMaker } = require('botbuilder-ai');
// const { FacebookAdapter } = require('botbuilder-adapter-facebook');
const restify = require('restify');
const WelcomeCard = require('../resources/welcomeCard.json');
// const facebookPageIdOption = 'Facebook Page Id';
const quickRepliesOption = 'Quick Replies';
// const postBackOption = 'PostBack';

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

/* initialise Facebook Adapter
const adapter = new FacebookAdapter({
     verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
     app_secret: process.env.FACEBOOK_APP_SECRET,
     access_token: process.env.FACEBOOK_ACCESS_TOKEN
});

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.post('/api/messages', (req, res) => {
     adapter.processActivity(req, res, async(context) => {
         // do your bot logic here!
     });
}); */

class DialogBot extends ActivityHandler {

    /**
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

        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
          if (!await this.processFacebookPayload(context, context.activity.channelData)) {
              if (context.activity.channelId == 'facebook') {
                const membersAdded = context.activity.membersAdded;
                for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                    if (membersAdded[cnt].id !== context.activity.recipient.id) {
                        await context.sendActivity({
                              channelData: {
                                attachment:{
                                  type:"template",
                                  payload: {
                                    template_type:"generic",
                                    elements: [
                                      {
                                        title:"Welcome!",
                                        image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-graphic-logo-black-circle-inverted-rounded.jpg",
                                        subtitle:"I'm a chatbot designed to help people understand more about Mental Health and NeuroDiversity.",
                                        default_action: {
                                          type: "web_url",
                                          url: "https://www.mihnd.co.uk",
                                          webview_height_ratio: "tall",
                                        },
                                        buttons: [
                                          {
                                            type:"postback",
                                            title:"Find out more about Mental Health",
                                            payload:"What is Mental Health?"
                                          },{
                                            type:"postback",
                                            title:"Find out more about NeuroDiversity",
                                            payload:"What is NeuroDiversity?"
                                          },{
                                            type:"postback",
                                            title:"Get Help",
                                            payload:"Help"
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                }
                              }
                        });
                    }
                }
              } else {
                const membersAdded = context.activity.membersAdded;
                for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                    if (membersAdded[cnt].id !== context.activity.recipient.id) {
                        const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                        await context.sendActivity({ attachments: [welcomeCard] });
                    }
                }
              }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            this.logger.log('Processing a Message Activity');

            const qnaResults = await this.qnaMaker.getAnswers(context);

            // Show choices if the Facebook Payload from ChannelData is not handled
            if (!await this.processFacebookPayload(context, context.activity.channelData)) {
                if (context.activity.channelId == 'facebook') {
                  if (qnaResults[0]) {
                    const { answer, context: { prompts }} = qnaResults[0];

                    let reply;
                    if (prompts.length) {

                      const quickReply = {
                        channelData: {
                            text: answer,
                            quick_replies: [
                              {
                                content_type: "text",
                                title: "Prompt 1",
                                payload: "Prompt 1"
                              },{
                                content_type: "text",
                                title: "Prompt 2",
                                payload: "Prompt 2"
                              }
                            ]
                        }
                      }

                        reply = quickReply;
                      } else {
                        reply = {
                          channelData: {
                            text: answer,
                          }
                        }
                      }

                      await context.sendActivity(reply);

                  // If no answers were returned from QnA Maker, reply with help.
                  } else {
                      await context.sendActivity('I\'m sorry, I don\'t have an answer for that. Please ask me something else, such as: \n\n "What Is Mental Health?" \n\n "What Is NeuroDiversity" \n\n "Help"');
                  }

                } else {

                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                  const { answer, context: { prompts }} = qnaResults[0];

                  let reply;
                  if (prompts.length) {

                    const card = {
                      "type": "AdaptiveCard",
                      "body": [
                        {
                          "type": "TextBlock",
                          "text": answer,
                          wrap: true
                        }
                    ],
                    "actions": prompts.map(({ displayText }) => ({ type: "Action.Submit", title: displayText, data: displayText })),
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version": "1.1"
                    }

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
            this.logger.log('Processing an Event Activity.');

            // Analyze Facebook payload from EventActivity.Value
            await this.processFacebookPayload(turnContext, turnContext.activity.value);
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }

    /**
     * Process a Facebook payload from channel data, to handle optin events, postbacks and quick replies.
     * NOTE: This is a simplification of the Facebook object model. There are many more events and payloads
     * that could be captured here. We only show some key features that are commonly used. The sample
     * can be extended to account for more Facebook-specific events according to developers' needs.
     * @param {Object} turnContext
     * @param {Object} data
     */

    async processFacebookPayload(turnContext, data) {
        // At this point we know we are on Facebook channel, and can consume the Facebook custom payload present in channelData.
        const facebookPayload = data;
        if (facebookPayload) {
            if (facebookPayload.postback) {
                // Postback
                await this.onFacebookPostback(turnContext, facebookPayload.postback);
                return true;
            } else if (facebookPayload.optin) {
                // Optin
                await this.onFacebookOptin(turnContext, facebookPayload.optin);
                return true;
            } else if (facebookPayload.message && facebookPayload.message.quick_reply) {
                // Quick Reply
                await this.onFacebookQuickReply(turnContext, facebookPayload.message.quick_reply);
                return true;
            } else if (facebookPayload.message && facebookPayload.message.is_echo) {
                // Echo
                await this.onFacebookEcho(turnContext, facebookPayload.message);
                return true;
            }
        }
        return false;
    }

    /*
     * Called when receiving a Facebook messaging_postback event.
     * Facebook Developer Reference: Postback
     * https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks/
     * @param {Object} postback JSON object for postback payload.
     * @param {Object} turnContext
     */
    async onFacebookPostback(turnContext, postback) {
        this.logger.log('Postback message received.');
        //postBack handling logic

        const welcomeCardFB = {
          channelData: {
            attachment:{
              type:"template",
              payload: {
                template_type:"generic",
                // shareable: true,
                // image_aspect_ratio: "square",
                elements: [
                  {
                    title:"Welcome!",
                    image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-graphic-logo-black-circle-inverted-rounded.jpg",
                    subtitle:"I\'m designed to help people learn about Mental Health and NeuroDiversity",
                    default_action: {
                      type: "web_url",
                      url: "https://www.mihnd.co.uk",
                      webview_height_ratio: "tall",
                    },
                    buttons: [
                      {
                        type:"postback",
                        title:"Learn about Mental Health",
                        payload:"WHAT_IS_MENTAL_HEALTH"
                      },{
                        type:"postback",
                        title:"Learn about NeuroDiversity",
                        payload:"WHAT_IS_NEURODIVERSITY"
                      },{
                        type:"postback",
                        title:"Get Help",
                        payload:"GET_HELP"
                      }
                    ]
                  }
                ]
              }
            }
          }
        }

        if (postback.payload == "GET_STARTED") {
          await turnContext.sendActivity('Let\'s Get Started');
          await turnContext.sendActivity(welcomeCardFB);
        } else {
        if (postback.payload == "GET_HELP") {
          await turnContext.sendActivity('Let\'s Get You Some Help');
          //await turnContext.sendActivity(helpCardFB);
        } else {
          await turnContext.sendActivity('Are you sure?');
        }
        }
    }

    /**
     * Called when a message has been sent by your Facebook page.
     * Facebook Developer Reference: Echoes
     * https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-echoes/
     * @param {Object} facebookMessage
     * @param {Object} turnContext
     */
    // async onFacebookEcho(turnContext, facebookMessage) {
    //     this.logger.log('Echo message received.');
    // }

    /**
     * Called when receiving a Facebook messaging_optin event.
     * Facebook Developer Reference: Optin
     * https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_optins/
     * @param {Object} optin
     * @param {Object} turnContext
     */
    /* async onFacebookOptin(turnContext, optin) {
        this.logger.log('Optin message received.');
        // TODO: Your optin handling logic here...
    } */

    /**
     * Called when receiving a Facebook quick reply.
     * Facebook Developer Reference: Quick reply
     * https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies/
     * @param {Object} quickReply
     * @param {Object} turnContext
     */
    async onFacebookQuickReply(turnContext, quickReply) {
        this.logger.log('QuickReply message received.');
        // TODO: Your QuickReply handling logic here...

        // Process the message by checking the Activity.Text.  The FacebookQuickReply could also contain a json payload.

    }

}

module.exports.DialogBot = DialogBot;
