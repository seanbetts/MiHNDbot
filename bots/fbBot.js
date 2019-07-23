const fbCards = require('../resources/fbCards.js'); 

// Customisation code for Facebook Messenger


// Process a Facebook payload from channel data, to handle optin events, postbacks and quick replies.
const processFacebookPayload = async function (turnContext, data) {
    // At this point we know we are on Facebook channel, and can consume the Facebook custom payload present in channelData.
    const facebookPayload = data;
    if (facebookPayload) {
        if (facebookPayload.postback) {
            // Postback
            await this.onFacebookPostback(turnContext, facebookPayload.postback, facebookPayload.sender);
            return true;
        } else if (facebookPayload.optin) {
            // Optin
            await this.onFacebookOptin(turnContext, facebookPayload.optin);
            return true;
        } else if (facebookPayload.message && facebookPayload.message.quick_reply) {
            // Quick Reply
            await this.onFacebookQuickReply(turnContext, facebookPayload.message.quick_reply);
            return true;
        }
    }
    return false;
}


// Called when receiving a Facebook messaging_postback event. Facebook Developer Reference: Postback - https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks/
const onFacebookPostback = async function (turnContext, postback, sender) {
    console.log('Facebook Postback message received.');
    var fbPSID = sender.id;
    console.log('User PSID is ' + fbPSID);

    // PostBack handling logic
    if (postback.payload == "GET_STARTED") {
        let welcomeCardFB = await fbCards.getWelcomeCardFB(fbPSID);
        await turnContext.sendActivity(welcomeCardFB);
    } else {
    if (postback.payload == "GET_HELP") {
        let helpCardFB = await fbCards.getHelpCardFB(fbPSID);
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
        let errorCardFB = await fbCards.getErrorCardFB(fbPSID);
        await turnContext.sendActivity(errorCardFB);
        }

    } else {
    if (postback.payload == "TEXT_SHOUT") {
        await turnContext.sendActivity(fbCards.shoutCardFB);
    } else {
    if (postback.payload == "TEXT_SHOUT_NOW") {
        await turnContext.sendActivity("To get help from Shout please text SHOUT to 85258");
    } else {
    if (postback.payload == "CALL_THE_NHS") {
        await turnContext.sendActivity(fbCards.nhsCardFB);
    } else {
    if (postback.payload == "CALL_THE_SAMARITANS") {
        await turnContext.sendActivity(fbCards.samaritansCardFB);
    } else {
        await turnContext.sendActivity('Facebook PostBack not defined...YET!');
    }}}}}}}}
}

// Called when receiving a Facebook messaging_optin event. Facebook Developer Reference: Optin - https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_optins/
const onFacebookOptin = async function (turnContext, optin) {
    console.log('Optin message received.');
    // TODO: Your optin handling logic here...
}


// Called when receiving a Facebook quick reply. Facebook Developer Reference: Quick reply - https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies/
const onFacebookQuickReply = async function (turnContext, quickReply) {
    console.log('Facebook QuickReply message received.');

    // qnaMaker.getAnswers doesn't accept string input, so we need to adjust our turnContext
    // to match what it expects, which is a string in Activity.Text
    turnContext.activity.text = quickReply.payload;
    console.log('Set activity.text to ' + quickReply.payload);

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

    } else {
        let errorCardFB = await fbCards.getErrorCardFB(fbPSID);
        await turnContext.sendActivity(errorCardFB);
    }
}


module.exports = {
    processFacebookPayload:processFacebookPayload,
    onFacebookPostback:onFacebookPostback,
    onFacebookOptin:onFacebookOptin,
    onFacebookQuickReply:onFacebookQuickReply
};