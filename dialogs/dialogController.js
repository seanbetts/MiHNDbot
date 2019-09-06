const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const { KnowledgeDialog, KNOWLEDGE_DIALOG } = require('./knowledgeDialog');

const DIALOG_CONTROLLER = 'DIALOG_CONTROLLER';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class DialogController extends ComponentDialog {
    constructor(userState) {
        super(DIALOG_CONTROLLER);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        this.addDialog(new KnowledgeDialog());

        this.initialDialogId = KNOWLEDGE_DIALOG;
    }

    // The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system. If no dialog is active, it will start the default dialog.
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
}

module.exports.DialogController = DialogController;
module.exports.DIALOG_CONTROLLER = DIALOG_CONTROLLER;