// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    constructor(name, mood, work, workHours, workStress, workStressDeal, food, agitation, agitationDeal, anxiety, anxietyDeal, lowMood, lowMoodDeal, familyStress, familyStressDeal, medication, sleep, exercise, followUpDate, followUpTime) {
        this.name = name;
        this.mood = mood;
        this.work = work;
        this.workHours = workHours;
        this.workStress = workStress;
        this.workStressDeal = workStressDeal;
        this.food = food;
        this.agitation = agitation;
        this.agitationDeal = agitationDeal;
        this.anxiety = anxiety;
        this.anxietyDeal = anxietyDeal;
        this.lowMood = lowMood;
        this.lowMoodDeal = lowMoodDeal;
        this.familyStress = familyStress;
        this.familyStressDeal = familyStressDeal;
        this.medication = medication;
        this.sleep = sleep;
        this.exercise = exercise;
        this.followUpDate = followUpDate;
        this.followUpDTime = followUpTime;
    }
}

module.exports.UserProfile = UserProfile;
