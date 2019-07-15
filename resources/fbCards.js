module.exports = {

	welcomeCardFB: {
		channelData: {
			attachment:{
				type:"template",
				payload: {
					template_type:"generic",
					sharable: true,
					image_aspect_ratio: "square",
					elements: [
						{
							title:"Welcome!",
							image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-graphic-logo-black-circle-inverted-rounded.jpg",
							subtitle:"I\'m designed to help people learn about Mental Health and NeuroDiversity",
							default_action: {
								type: "web_url",
								url: "https://www.mihnd.co.uk",
								webview_height_ratio: "tall",
							},
							buttons: [
								{
									type:"postback",
									title:"Mental Health",
									payload:"WHAT_IS_MENTAL_HEALTH"
								},{
									type:"postback",
									title:"NeuroDiversity",
									payload:"WHAT_IS_NEURODIVERSITY"
								},{
									type:"postback",
									title:"Get Help",
									payload:"GET_HELP"
	}]}]}}}},

	helpCardFB: {
		channelData: {
			attachment:{
				type:"template",
				payload: {
					template_type:"generic",
					sharable: true,
					image_aspect_ratio: "square",
					elements: [
						{
							title:"Everyone deserves help",
							image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-chat-logo-black-circle-inverted-rounded.jpg",
							subtitle:"Being in a crisis can be very frightening, please get some help & support ASAP",
							default_action: {
								type: "web_url",
								url: "https://www.mihnd.co.uk/crisis",
								webview_height_ratio: "tall",
							},
							buttons: [
								{
									type:"postback",
									title:"Text Shout",
									payload:"TEXT_SHOUT"
								},{
									type:"postback",
									title:"Call the NHS",
									payload:"CALL_THE_NHS"
								},{
									type:"postback",
									title:"Call The Samaritans",
									payload:"CALL_THE_SAMARITANS"
	}]}]}}}},

	shoutCardFB: {
		channelData: {
			attachment:{
				type:"template",
				payload: {
					template_type:"generic",
					sharable: true,
					image_aspect_ratio: "horizontal",
					elements: [
						{
							title:"SHOUT",
							image_url:"https://mihndbotblob.blob.core.windows.net/resources/SHOUT-how-it-works.jpg",
							subtitle:"Shout is the UK’s first free 24/7 text service for anyone in crisis anytime, anywhere",
							default_action: {
								type: "web_url",
								url: "https://www.giveusashout.org",
								webview_height_ratio: "tall",
							},
							buttons: [
								{
									type:"web_url",
									url: "https://www.giveusashout.org/get-help/",
									title:"More Info"
								},{
									type:"postback",
									title:"Text Shout Now",
									payload:"TEXT_SHOUT_NOW"
	}]}]}}}},

	nhsCardFB: {
		channelData: {
			attachment:{
				type:"template",
				payload: {
					template_type:"generic",
					sharable: true,
					image_aspect_ratio: "square",
					elements: [
						{
							title:"NHS 111",
							image_url:"https://mihndbotblob.blob.core.windows.net/resources/111-service-mental-health.png",
							subtitle:"NHS 111 can help if you have a mental health problem and not sure what to do.",
							default_action: {
								type: "web_url",
								url: "https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/nhs-111/",
								webview_height_ratio: "tall",
							},
							buttons: [
								{
									type:"web_url",
									url: "https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/nhs-111/",
									title:"More Info"
								},{
									type:"phone_number",
									title:"Call NHS 111...",
									payload:"111"
		}]}]}}}},

		samaritansCardFB: {
			channelData: {
			  attachment:{
				type:"template",
				payload: {
				  template_type:"generic",
				  sharable: true,
				  image_aspect_ratio: "square",
				  elements: [
					{
					  title:"The Samaritans",
					  image_url:"https://mihndbotblob.blob.core.windows.net/resources/samaritans.jpg",
					  subtitle:"Whatever you're going through, call us free any time, from any phone",
					  default_action: {
						type: "web_url",
						url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/",
						webview_height_ratio: "tall",
					  },
					  buttons: [
						{
						  type:"web_url",
						  url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/",
						  title:"More Info"
						},{
						  type:"phone_number",
						  title:"Call The Samaritans...",
						  payload:"116123"
		  }]}]}}}},

		  errorCardFB: {
			channelData: {
			  attachment:{
				type:"template",
				payload: {
				  template_type:"generic",
				  sharable: true,
				  image_aspect_ratio: "square",
				  elements: [
					{
					  title:"I'm sorry!",
					  image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-question-logo-black-circle-inverted-rounded.jpg",
					  subtitle:"I don\'t have an answer for that. Please ask me about something else, such as:",
					  default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk",
						webview_height_ratio: "tall",
					  },
					  buttons: [
						{
						  type:"postback",
						  title:"Mental Health",
						  payload:"WHAT_IS_MENTAL_HEALTH"
						},{
						  type:"postback",
						  title:"NeuroDiversity",
						  payload:"WHAT_IS_NEURODIVERSITY"
						},{
						  type:"postback",
						  title:"Get Help",
						  payload:"GET_HELP"
		  }]},
			
		  			{
					title:"I'm sorry 2!",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-question-logo-black-circle-inverted-rounded.jpg",
					subtitle:"I don\'t have an answer for that. Please explore our other content or ask me about something else, such as:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk",
						webview_height_ratio: "tall",
					},
					buttons: [
						{
							type:"postback",
							title:"Mental Health",
							payload:"WHAT_IS_MENTAL_HEALTH"
						},{
							type:"postback",
							title:"NeuroDiversity",
							payload:"WHAT_IS_NEURODIVERSITY"
						},{
							type:"postback",
							title:"Get Help",
							payload:"GET_HELP"
				}]}
				]
			
			}}}}
				
						// {
						// 	title:"I'm sorry 2!",
						// 	image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-question-logo-black-circle-inverted-rounded.jpg",
						// 	subtitle:"I don\'t have an answer for that. Please explore our other content or ask me about something else, such as:",
						// 	default_action: {
						// 		type: "web_url",
						// 		url: "https://www.mihnd.co.uk",
						// 		webview_height_ratio: "tall",
						// 	},
						// 	buttons: [
						// 		{
						// 			type:"postback",
						// 			title:"Mental Health",
						// 			payload:"WHAT_IS_MENTAL_HEALTH"
						// 		},{
						// 			type:"postback",
						// 			title:"NeuroDiversity",
						// 			payload:"WHAT_IS_NEURODIVERSITY"
						// 		},{
						// 			type:"postback",
						// 			title:"Get Help",
						// 			payload:"GET_HELP"
						// }]}

    // Get Facebook First Name
    // fbFirstName: function() {
	// 	var user_id = session.user.id
	// 	let fb_page_access_token = dotenv.FACEBOOK_ACCESS_TOKEN
  
	// 	fbFirstName = requests.get("https://graph.facebook.com/v2.6/"+ user_id + "?fields=first_name&access_token=" + fb_page_access_token)
  
	// 	return fbFirstName
  
	//   }

};