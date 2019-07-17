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
							title:"Welcome " + this.fbFirstName + "!",
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
					title:"I'm sorry " + this.fbFirstName + "!",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-question-logo-black-circle-inverted-rounded.jpg",
					subtitle:"I'm sorry, I can\'t answer that. Please check out our other content -> -> ->",
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
					title:"Blog",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-blog-logo.jpg",
					subtitle:"Here are our most popular blog posts about Mental Health and NeuroDiversity:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk/blog",
						webview_height_ratio: "tall",
					},
					buttons: [
					{
						type:"web_url",
						url: "https://www.mihnd.co.uk/supporter-stories",
						title:"Supporter Stories"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/featured-posts",
						title:"Featured Posts"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/blog",
						title:"See More"
				}]},
				
				{
					title:"Books",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-book-logo.jpg",
					subtitle:"Here are our favourite books about Mental Health and NeuroDiversity:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk/books",
						webview_height_ratio: "tall",
					},
					buttons: [
					{
						type:"web_url",
						url: "https://geo.itunes.apple.com/gb/book/reasons-to-stay-alive/id914514684?mt=11&ls=1",
						title:"Reasons To Stay Alive"
					},{
						type:"web_url",
						url: "https://geo.itunes.apple.com/gb/book/depressive-illness-the-curse-of-the-strong/id622733043?mt=11&ls=1",
						title:"The Curse Of The Strong"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/books",
						title:"See More"
				}]},
				
				{
					title:"Podcasts",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-podcast-logo.jpg",
					subtitle:"Lots of fantastic Podcasts exploring Mental Health and NeuroDiversity below:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk/podcasts",
						webview_height_ratio: "tall",
					},
					buttons: [
					{
						type:"web_url",
						url: "https://itunes.apple.com/gb/podcast/bryony-gordons-mad-world/id1224672811?mt=2&app=podcast",
						title:"Mad World"
					},{
						type:"web_url",
						url: "https://itunes.apple.com/gb/podcast/happy-place/id1353058891?mt=2&app=podcast",
						title:"Happy Place"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/podcasts",
						title:"See More"
				}]},
				
				{
					title:"Videos",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-video-logo.jpg",
					subtitle:"Inspiring videos we've seen about Mental Health and NeuroDiversity:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk/videos",
						webview_height_ratio: "tall",
					},
					buttons: [
					{
						type:"web_url",
						url: "https://www.ted.com/talks/temple_grandin_the_world_needs_all_kinds_of_minds?language=en&referrer=playlist-the_autism_spectrum&utm_campaign=tedspread&utm_medium=referral&utm_source=tedcomshare",
						title:"Temple Grandin"
					},{
						type:"web_url",
						url: "https://www.ted.com/talks/brene_brown_on_vulnerability?language=en&utm_campaign=tedspread&utm_medium=referral&utm_source=tedcomshare",
						title:"Power Of Vulnerability"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/videos",
						title:"See More"
				}]},
				
				{
					title:"Apps",
					image_url:"https://mihndbotblob.blob.core.windows.net/resources/MiHND-app-logo.jpg",
					subtitle:"Great apps we've found that help with Mental Health and NeuroDiversity:",
					default_action: {
						type: "web_url",
						url: "https://www.mihnd.co.uk/apps",
						webview_height_ratio: "tall",
					},
					buttons: [
					{
						type:"web_url",
						url: "https://www.headspace.com/",
						title:"Headspace"
					},{
						type:"web_url",
						url: "https://www.happyfeed.co/",
						title:"Happyfeed"
					},{
						type:"web_url",
						url: "https://www.mihnd.co.uk/apps",
						title:"See More"
				}]}
			]
		}}}},

		// Get Facebook First Name
		fbFirstName: { function () {
			var user_id = "716540089" // session.user.id
			let fb_page_access_token = dotenv.FACEBOOK_ACCESS_TOKEN
		
			fbFirstName = requests.get("https://graph.facebook.com/v2.6/"+ user_id + "?fields=first_name&access_token=" + fb_page_access_token)
			
			if (fbFirstName != null) {
				return fbFirstName
			} else {
				return "Human"
			}

		}}

};