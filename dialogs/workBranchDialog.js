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
const WORK_BRANCH_DIALOG = 'WORK_BRANCH_DIALOG';

const { UserProfile } = require('../userProfile');
const USER_PROFILE_DIALOG = 'USER_PROFILE_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class WorkBranchDialog extends ComponentDialog {
    constructor(userState, logger) {
        super(WORK_BRANCH_DIALOG);

        // Define a "done" response for the work dialog.
        this.doneOption = 'done';

        //this.userProfile = userState.createProperty(USER_PROFILE);

        this.logger = logger;

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
						this.workHoursStep.bind(this),
            this.workStressStep.bind(this),
            this.workStressDealStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async workHoursStep(stepContext) {
					return await stepContext.prompt(CHOICE_PROMPT, {
							prompt: 'Thank you. Have many hours have you worked today?',
							choices: ChoiceFactory.toChoices(['1-3 hours', '4-6 hours', '7-10 hours', '11-13 hours', '14+ hours'])
				});
    }

		async workStressStep(stepContext) {
        stepContext.values.workHours = stepContext.result.value;
					return await stepContext.prompt(CHOICE_PROMPT, {
							prompt: 'Thank you. Have you been stressed at work today?',
							choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async workStressDealStep(stepContext) {
        stepContext.values.workStress = stepContext.result.value;
        if (stepContext.result.value === 'Yes') {
          return await stepContext.prompt(CHOICE_PROMPT, {
							prompt: 'I\'m sorry to hear that. Have you been able to deal with the Work Stress today?',
							choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
        } else {
          let msg = 'That\'s good to hear';
          await stepContext.context.sendActivity(msg);
          return await stepContext.endDialog('No');
        }
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await stepContext.endDialog();
      }
}

module.exports.WorkBranchDialog = WorkBranchDialog;
module.exports.WORK_BRANCH_DIALOG = WORK_BRANCH_DIALOG;
