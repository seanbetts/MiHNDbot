async dispatchToTopIntentAsync(context, intent, recognizerResult) {
    switch (intent) {
    case 'Book_Flight':
        await this.processBookFlight(context, recognizerResult.luisResult);
        break;
    case 'MiHNDbot':
        await this.processMiHNDbot(context, recognizerResult.luisResult);
        break;
    case 'MiHNDbot-KB':
        await this.processMiHNDbotKB(context);
        break;
    default:
        this.logger.log(`Dispatch unrecognized intent: ${ intent }.`);
        await context.sendActivity(`Dispatch unrecognized intent: ${ intent }.`);
        break;
    }
}
