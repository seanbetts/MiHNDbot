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
const { WorkBranchDialog, WORK_BRANCH_DIALOG } = require('./workBranchDialog');
const { AgitationBranchDialog, AGITATION_BRANCH_DIALOG } = require('./agitationBranchDialog');
const { AnxietyBranchDialog, ANXIETY_BRANCH_DIALOG } = require('./anxietyBranchDialog');
const { FamilyStressBranchDialog, FAMILY_STRESS_BRANCH_DIALOG } = require('./familyStressBranchDialog');
const { LowMoodBranchDialog, LOW_MOOD_BRANCH_DIALOG } = require('./lowMoodBranchDialog');

const { UserProfile } = require('../userProfile');
const USER_PROFILE_DIALOG = 'USER_PROFILE_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserProfileDialog extends ComponentDialog {
    constructor(userState, logger) {
        super(USER_PROFILE_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.logger = logger;

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));

        this.addDialog(new WorkBranchDialog());
        this.addDialog(new AgitationBranchDialog());
        this.addDialog(new AnxietyBranchDialog());
        this.addDialog(new FamilyStressBranchDialog());
        this.addDialog(new LowMoodBranchDialog());

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.moodStep.bind(this),
            this.workStep.bind(this),
            this.workSelectionStep.bind(this),
            this.foodStep.bind(this),
            this.agitationStep.bind(this),
            this.agitationDealStep.bind(this),
            this.anxietyStep.bind(this),
            this.anxietyDealStep.bind(this),
            this.lowMoodStep.bind(this),
            this.lowMoodDealStep.bind(this),
            this.familyStressStep.bind(this),
            this.familyStressDealStep.bind(this),
            this.medicationStep.bind(this),
            this.sleepStep.bind(this),
            this.exerciseStep.bind(this),
            this.summaryStep.bind(this),
            this.followUpDateStep.bind(this),
            this.followUpTimeStep.bind(this),
            this.followUpConfirmationStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async nameStep(stepContext) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await stepContext.prompt(NAME_PROMPT, `Hi, I'm MiHNDbot, \n \n I'd like to help you manage your mental fitness. \n \n First off, what's your name?`);
    }

    async moodStep(stepContext) {
        stepContext.values.name = stepContext.result;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Thanks ' + stepContext.values.name + ', it\'s great to meet you. \n \n How you are feeling today?',
            choices: ChoiceFactory.toChoices(['Hopeless', 'Low', 'OK', 'Good', 'Great'])
        });
    }

    async workStep(stepContext) {
        stepContext.values.mood = stepContext.result.value;
        if (stepContext.result.value === 'Great') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'I\'m really glad to hear that! \n \n Ok, next question. Did you work today?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else if (stepContext.result.value === 'Good') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'I\'m glad to hear that. \n \n Ok, next question. Did you work today?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else if (stepContext.result.value === 'OK') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Great! \n \n Ok, next question. Did you work today?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else if (stepContext.result.value === 'Low') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'I\'m sorry to hear that. \n \n Ok, next question. Did you work today?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else if (stepContext.result.value === 'Hopeless') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'I\'m really sorry to hear that. \n \n Remember, if you\'re in crisis you can text "HELP" at any time to find out how to get in touch with someone to speak to. \n \n Ok, next question. Did you work today?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });
        } else {
        }
    }

    async workSelectionStep(stepContext) {
        stepContext.values.work = stepContext.result.value;
        if (stepContext.result.value === 'No') {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Thank you. \n \n Can you let me know why you didn\'t work today?',
                choices: ChoiceFactory.toChoices(['Weekend', 'Day off', 'Holiday', 'Sick Day'])
            });
        } else {
            return await stepContext.beginDialog(WORK_BRANCH_DIALOG);
        }
    }

    async foodStep(stepContext) {
        stepContext.values.workStress = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Ok. How many meals have you eaten today?.',
            choices: ChoiceFactory.toChoices(['No meals', '1 meal', '2 meals', '3 meals'])
        });
    }

    async agitationStep(stepContext) {
        stepContext.values.food = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Have you felt at all aggitated or irritable today?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async agitationDealStep(stepContext) {
        stepContext.values.agitation = stepContext.result.value;
        if (stepContext.result.value === 'No') {
            return await stepContext.next();
        } else {
            return await stepContext.beginDialog(AGITATION_BRANCH_DIALOG);
        }
    }

    async anxietyStep(stepContext) {
        // stepContext.values.agitationDeal = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Thanks for that. Have you felt anxious or worried today?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async anxietyDealStep(stepContext) {
        stepContext.values.anxiety = stepContext.result.value;
        if (stepContext.result.value === 'No') {
            return await stepContext.next();
        } else {
            return await stepContext.beginDialog(ANXIETY_BRANCH_DIALOG);
        }
    }

    async lowMoodStep(stepContext) {
        // stepContext.values.anxietyDeal = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'So, have you had a low mood or been tearful at all today?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async lowMoodDealStep(stepContext) {
        stepContext.values.lowMood = stepContext.result.value;
        if (stepContext.result.value === 'No') {
            return await stepContext.next();
        } else {
            return await stepContext.beginDialog(LOW_MOOD_BRANCH_DIALOG);
        }
    }

    async familyStressStep(stepContext) {
        // stepContext.values.lowMoodDeal = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Have you experienced any family stress today?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async familyStressDealStep(stepContext) {
        stepContext.values.familyStress = stepContext.result.value;
        if (stepContext.result.value === 'No') {
            return await stepContext.next();
        } else {
            return await stepContext.beginDialog(FAMILY_STRESS_BRANCH_DIALOG);
        }
    }

    async medicationStep(stepContext) {
        // stepContext.values.familyStressDeal = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Have you taken your medication today?',
            choices: ChoiceFactory.toChoices(['Yes', 'No'])
        });
    }

    async sleepStep(stepContext) {
        stepContext.values.medication = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'How much sleep did you get last night?',
            choices: ChoiceFactory.toChoices(['0-4 hours', '5-9 hours', '10+ hours'])
        });
    }

    async exerciseStep(stepContext) {
        stepContext.values.sleep = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Lastly, how active have you been today?',
            choices: ChoiceFactory.toChoices(['None', 'Light', 'Active', 'Excessive'])
        });
    }

    async summaryStep(stepContext) {
        stepContext.values.exercise = stepContext.result.value;
        const userProfile = await this.userProfile.get(stepContext.context, new UserProfile());

        userProfile.name = stepContext.values.name;
        userProfile.mood = stepContext.values.mood;
        userProfile.work = stepContext.values.work;
        userProfile.workHours = stepContext.values.workHours;
        userProfile.workStress = stepContext.values.workStress;
        userProfile.food = stepContext.values.food;
        userProfile.agitation = stepContext.values.agitation;
        userProfile.agitationDeal = stepContext.values.agitationDeal;
        userProfile.anxiety = stepContext.values.anxiety;
        userProfile.anxietyDeal = stepContext.values.anxietyDeal;
        userProfile.lowMood = stepContext.values.lowMood;
        userProfile.lowMoodDeal = stepContext.values.lowMoodDeal;
        userProfile.familyStress = stepContext.values.familyStress;
        userProfile.familyStressDeal = stepContext.values.familyStressDeal;
        userProfile.medication = stepContext.values.medication;
        userProfile.sleep = stepContext.values.sleep;
        userProfile.exercise = stepContext.values.exercise;

        // eslint-disable-next-line no-useless-escape
        let msg = `Thank you for sharing ${ userProfile.name }. Here\'s what I've learned from you today: \n Your mood has been ${ userProfile.mood } \n Work = ${ userProfile.work } \n You\'ve had ${ userProfile.food } \n Agitation = ${ userProfile.agitation } \n Anxiety = ${ userProfile.anxiety } \n Low Mood = ${ userProfile.lowMood } \n Family Stress = ${ userProfile.familyStress } \n Medication = ${ userProfile.medication } \n You had ${ userProfile.sleep } Sleep \n Your exercise was ${ userProfile.exercise }`;

        await stepContext.context.sendActivity(msg);
        return await stepContext.next();
    }

    async followUpDateStep(stepContext) {
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'I hope you\'ve found our session useful. When would you like me to check in with you next?',
            choices: ChoiceFactory.toChoices(['Tomorrow', 'In a couple of days', 'Next week', 'Next month'])
        });
    }

    async followUpTimeStep(stepContext) {
        stepContext.values.followUpDate = stepContext.result.value;
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Great! I\'ll check in with you ' + stepContext.values.followUpDate + '. What time works best for you?',
            choices: ChoiceFactory.toChoices(['Morning', 'Lunchtime', 'Afternoon', 'Evening'])
        });
    }

    async followUpConfirmationStep(stepContext) {
        stepContext.values.followUpTime = stepContext.result.value;
        let msg = 'Ok! \n \n I\'ll check in with you ' + stepContext.values.followUpDate + ' in the ' + stepContext.values.followUpTime + '.' + '\n \n See you then';

        await stepContext.context.sendActivity(msg);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await stepContext.endDialog();
    }
}

module.exports.UserProfileDialog = UserProfileDialog;
module.exports.USER_PROFILE_DIALOG = USER_PROFILE_DIALOG;
