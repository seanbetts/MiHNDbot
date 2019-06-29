class CancelAndHelpDialog extends ComponentDialog {
	async onBegnDialog(innerDc, options) {
		const result - await this.interrupt(innerDc);
		if (result) {
				return result;
		}
		return await super.onBeginDialog(innerDc, options);
	}

	async onContinueDialog(innerDc) {
		const result = await this.interrupt(innerDc);
		if (result) {
				return result;
		}
		return await super.onContinueDialog(innerDc);
	}
	
	async interrupt(innerDc) {
		const text = innerDc.context.activity.text.toLowerCase();
		
		switch (text) {
			case 'help':
			case '?':
					await innerDc.context.sendActivity('[This is where to send sample help to the user...]')
					return { status: DialogTurnStatus.waiting};
			case 'cancel':
			case 'quit':
					await innerDc.context.sendActivity('Cancelling);
					return await innerDc.cancelAllDialogs();
		}
	}
	
}