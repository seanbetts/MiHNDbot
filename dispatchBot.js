const dispatchRecognizer = new LuisRecognizer({
    applicationId: process.env.LuisAppId,
    endpointKey: process.env.LuisAPIKey,
    endpoint: `https://${ process.env.LuisAPIHostName }.api.cognitive.microsoft.com`
}, {
    includeAllIntents: true,
    includeInstanceData: true
}, true);

const qnaMaker = new QnAMaker({
    knowledgeBaseId: process.env.QnAKnowledgebaseId,
    endpointKey: process.env.QnAAuthKey,
    host: process.env.QnAEndpointHostName
});

this.onMessage(async (context, next) => {
    this.logger.log('Processing Message Activity.');

    // First, we use the dispatch model to determine which cognitive service (LUIS or QnA) to use.
    const recognizerResult = await dispatchRecognizer.recognize(context);

    // Top intent tell us which cognitive service to use.
    const intent = LuisRecognizer.topIntent(recognizerResult);

    // Next, we call the dispatcher with the top intent.
    await this.dispatchToTopIntentAsync(context, intent, recognizerResult);

    await next();
});
