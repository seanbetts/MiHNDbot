const { DialogBot } = require('./dialogBot');
const { CardFactory } = require('botbuilder-core');

const WelcomeCard = require('../resources/welcomeCard.json');

class WelcomeBot extends DialogBot {
    constructor(conversationState, userState, logger) { //add dialog
        super(conversationState, userState, logger); // add dialog

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
    }
}

// Create the typing gif
var sendTyping = async function(context) {
    await context.sendActivities([
        { type: 'typing' },
        { type: 'delay', value: 2000 }
    ]);
};

module.exports.WelcomeBot = WelcomeBot;