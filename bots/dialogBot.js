const { ActivityHandler, MemoryStorage } = require('botbuilder');
const { CardFactory } = require('botbuilder-core');
const { CosmosDbStorage } = require("botbuilder-azure");
const { QnAMaker } = require('botbuilder-ai');
const restify = require('restify');
const WelcomeCard = require('../resources/welcomeCard.json');
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

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            this.logger.log('Processing a Message Activity');

            const qnaResults = await this.qnaMaker.getAnswers(context);

            // Show choices if the Facebook Payload from ChannelData is not handled
            if (!await this.processFacebookPayload(context, context.activity.channelData)) {
								// detect if Facebook Messenger is the channel being used
                if (context.activity.channelId == 'facebook') {
                  if (qnaResults[0]) {
                    const { answer, context: { prompts }} = qnaResults[0];

										// set a variable for the prompts array from QnA
										var qnaPrompts = null;
										if(qnaResults[0].context != null){
												qnaPrompts = qnaResults[0].context.prompts;
										}

                    // map the prompts to the required format for quick_replies channelData
                    var qnaPromptsArray = qnaPrompts.map(obj =>{
                      return {content_type: "text", title: obj.displayText, payload: {turnContext: {activity: {text: obj.displayText}}}}
                    });

                    let reply;
                    if (prompts.length) {

                      const quickReply = {
                        channelData: {
                            text: answer,
                            quick_replies: qnaPromptsArray
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

                      // call the QnA
                      // const qnaResults = await this.qnaMaker.getAnswers(turnContext);

                      await context.sendActivity(reply);

                  // If no answers were returned from QnA Maker, reply with help.
                  } else {

											const errorCardFB = {
												channelData: {
													attachment:{
														type:"template",
														payload: {
															template_type:"generic",
															sharable: true,
															image_aspect_ratio: "square",
															elements: [
																{
																	title:"I'm sorry!",
																	image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-graphic-logo-black-circle-inverted-rounded.jpg",
																	subtitle:"I don\'t have an asnwer for that. Please ask me about something else, such as:",
																	default_action: {
																		type: "web_url",
																		url: "https://www.mihnd.co.uk",
																		webview_height_ratio: "tall",
																	},
																	buttons: [
																		{
																			type:"postback",
																			title:"Mental Health",
																			payload:"WHAT_IS_MENTAL_HEALTH"
																		},{
																			type:"postback",
																			title:"NeuroDiversity",
																			payload:"WHAT_IS_NEURODIVERSITY"
																		},{
																			type:"postback",
																			title:"Get Help",
																			payload:"GET_HELP"
											}]}]}}}}

											await turnContext.sendActivity(errorCardFB);
                  }

                } else {
								// default to WebChat channel
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
                sharable: true,
                image_aspect_ratio: "square",
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
                        title:"Mental Health",
                        payload:"WHAT_IS_MENTAL_HEALTH"
                      },{
                        type:"postback",
                        title:"NeuroDiversity",
                        payload:"WHAT_IS_NEURODIVERSITY"
                      },{
                        type:"postback",
                        title:"Get Help",
                        payload:"GET_HELP"
        }]}]}}}}

        const helpCardFB = {
          channelData: {
            attachment:{
              type:"template",
              payload: {
                template_type:"generic",
                sharable: true,
                image_aspect_ratio: "square",
                elements: [
                  {
                    title:"Everyone deserves help",
                    image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-graphic-logo-black-circle-inverted-rounded.jpg",
                    subtitle:"Being in a crisis can be very frightening, please get some help & support ASAP",
                    default_action: {
                      type: "web_url",
                      url: "https://www.mihnd.co.uk/crisis",
                      webview_height_ratio: "tall",
                    },
                    buttons: [
                      {
                        type:"postback",
                        title:"Text Shout",
                        payload:"TEXT_SHOUT"
                      },{
                        type:"postback",
                        title:"Call the NHS",
                        payload:"CALL_THE_NHS"
                      },{
                        type:"postback",
                        title:"Call The Samaritans",
                        payload:"CALL_THE_SAMARITANS"
        }]}]}}}}

        const shoutCardFB = {
          channelData: {
            attachment:{
              type:"template",
              payload: {
                template_type:"generic",
                sharable: true,
                image_aspect_ratio: "horizontal",
                elements: [
                  {
                    title:"SHOUT",
                    image_url:"https://mihndbotblob.blob.core.windows.net/resources/SHOUT-how-it-works.jpg",
                    subtitle:"Shout is the UK’s first free 24/7 text service for anyone in crisis anytime, anywhere",
                    default_action: {
                      type: "web_url",
                      url: "https://www.giveusashout.org",
                      webview_height_ratio: "tall",
                    },
                    buttons: [
                      {
                        type:"web_url",
                        url: "https://www.giveusashout.org/get-help/",
                        title:"More Info"
                      },{
                        type:"postback",
                        title:"Text Shout Now",
                        payload:"TEXT_SHOUT_NOW"
        }]}]}}}}

        const nhsCardFB = {
          channelData: {
            attachment:{
              type:"template",
              payload: {
                template_type:"generic",
                sharable: true,
                image_aspect_ratio: "square",
                elements: [
                  {
                    title:"NHS 111",
                    image_url:"https://mihndbotblob.blob.core.windows.net/resources/111-service-mental-health.png",
                    subtitle:"NHS 111 can help if you have a mental health problem and not sure what to do.",
                    default_action: {
                      type: "web_url",
                      url: "https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/nhs-111/",
                      webview_height_ratio: "tall",
                    },
                    buttons: [
                      {
                        type:"web_url",
                        url: "https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/nhs-111/",
                        title:"More Info"
                      },{
                        type:"phone_number",
                        title:"Call NHS 111...",
                        payload:"111"
          }]}]}}}}

        const samaritansCardFB = {
          channelData: {
            attachment:{
              type:"template",
              payload: {
                template_type:"generic",
                sharable: true,
                image_aspect_ratio: "square",
                elements: [
                  {
                    title:"The Samaritans",
                    image_url:"https://mihndbotblob.blob.core.windows.net/resources/samaritans.jpg",
                    subtitle:"Whatever you're going through, call us free any time, from any phone",
                    default_action: {
                      type: "web_url",
                      url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/",
                      webview_height_ratio: "tall",
                    },
                    buttons: [
                      {
                        type:"web_url",
                        url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/",
                        title:"More Info"
                      },{
                        type:"phone_number",
                        title:"Call The Samaritans...",
                        payload:"116123"
        }]}]}}}}

        if (postback.payload == "GET_STARTED") {
          await turnContext.sendActivity(welcomeCardFB);
        } else {
        if (postback.payload == "GET_HELP") {
          await turnContext.sendActivity(helpCardFB);
        } else {
        if (postback.payload == "WHAT_IS_MENTAL_HEALTH") {
          // qnaMaker.getAnswers doesn't accept string input, so we need to adjust our turnContext
          // to match what it expects, which is a string in Activity.Text
          turnContext.activity.text = postback.payload;

          // call the QnA
          const qnaResults = await this.qnaMaker.getAnswers(turnContext);

          // If an answer was received from QnA Maker, send the answer back to the user.
          if (qnaResults[0]) {
            const { answer, context: { prompts }} = qnaResults[0];

					// set a variable for the prompts array from QnA
					var qnaPrompts = null;
					if(qnaResults[0].context != null){
							qnaPrompts = qnaResults[0].context.prompts;
					}

					// map the prompts to the required format for quick_replies channelData
					var qnaPromptsArray = qnaPrompts.map(obj =>{
						return {content_type: "text", title: obj.displayText, payload: obj.displayText}
					});


						let reply;
            if (prompts.length) {
              const quickReply = {
                channelData: {
                    text: answer,
                    quick_replies: qnaPromptsArray
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
              await turnContext.sendActivity(reply);

          // If no answers were returned from QnA Maker, reply with help.
          } else {
            await turnContext.sendActivity('No QnA Maker answers were found.');
          }
        } else {
        if (postback.payload == "WHAT_IS_NEURODIVERSITY") {
          // qnaMaker.getAnswers doesn't accept string input, so we need to adjust our turnContext
          // to match what it expects, which is a string in Activity.Text
          turnContext.activity.text = postback.payload;
          const qnaResults = await this.qnaMaker.getAnswers(turnContext);

          // If an answer was received from QnA Maker, send the answer back to the user.
          if (qnaResults[0]) {
            const { answer, context: { prompts }} = qnaResults[0];

						// set a variable for the prompts array from QnA
						var qnaPrompts = null;
						if(qnaResults[0].context != null){
								qnaPrompts = qnaResults[0].context.prompts;
						}

						// map the prompts to the required format for quick_replies channelData
						var qnaPromptsArray = qnaPrompts.map(obj =>{
							return {content_type: "text", title: obj.displayText, payload: obj.displayText}
						});

            let reply;
            if (prompts.length) {
              const quickReply = {
                channelData: {
                    text: answer,
                    quick_replies: qnaPromptsArray
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
              await turnContext.sendActivity(reply);

          // If no answers were returned from QnA Maker, reply with help.
          } else {
            await turnContext.sendActivity('No QnA Maker answers were found.');
          }

        } else {
        if (postback.payload == "TEXT_SHOUT") {
          await turnContext.sendActivity(shoutCardFB);
        } else {
        if (postback.payload == "TEXT_SHOUT_NOW") {
          await turnContext.sendActivity("To get help from Shout please text SHOUT to 85258");
        } else {
        if (postback.payload == "CALL_THE_NHS") {
          await turnContext.sendActivity(nhsCardFB);
        } else {
        if (postback.payload == "CALL_THE_SAMARITANS") {
          await turnContext.sendActivity(samaritansCardFB);
        } else {
          await turnContext.sendActivity('PostBack not defined...YET!');
        }}}}}}}}
    }

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
