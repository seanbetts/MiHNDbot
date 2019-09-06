// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const LOW_MOOD_BRANCH_DIALOG = 'LOW_MOOD_BRANCH_DIALOG';

const { UserProfile } = require('../userProfile');
const USER_PROFILE_DIALOG = 'USER_PROFILE_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class LowMoodBranchDialog extends ComponentDialog {
    constructor(userState, logger) {
        super(LOW_MOOD_BRANCH_DIALOG);

        // Define a "done" response for the work dialog.
        this.doneOption = 'done';

        //this.userProfile = userState.createProperty(USER_PROFILE);

        this.logger = logger;

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.lowMoodDealStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async lowMoodDealStep(stepContext) {
					return await stepContext.prompt(CHOICE_PROMPT, {
							prompt: 'I\'m really sorry to hear that. Have you been able to deal with the Low Mood today?',
							choices: ChoiceFactory.toChoices(['Yes', 'No'])
				});
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await stepContext.endDialog();
    }
}

module.exports.LowMoodBranchDialog = LowMoodBranchDialog;
module.exports.LOW_MOOD_BRANCH_DIALOG = LOW_MOOD_BRANCH_DIALOG;
