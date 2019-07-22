var fbFetch1 = function() {
    const fb_page_access_token = process.env.FACEBOOK_ACCESS_TOKEN;
    const fbID = 2826538590752448;

    fetch('https://graph.facebook.com/v3.3/' + fbID + '?fields=first_name&access_token=' + fb_page_access_token)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        var fbName = JSON.stringify(myJson.first_name);
        var fbNameTrim = fbName.slice(1,-1);
        console.log(fbNameTrim); // This successfully prints fbNameTrim to the console
    })
    // console.log(fbNameTrim + " 2"); // This successfully prints fbNameTrim to the console
    // return fbNameTrim;
}




var fbFetch2 = async function() {
    const fb_page_access_token = process.env.FACEBOOK_ACCESS_TOKEN;
	const fbID = 2826538590752448;

	var fbData = await fetch ('https://graph.facebook.com/v3.3/' + fbID + '?fields=first_name&access_token=' + fb_page_access_token);
	var fbResponse = await fbData.json();
	var fbName = await JSON.stringify(fbResponse.first_name);
	var fbNameTrim = await fbName.slice(1,-1);
	console.log(fbNameTrim);

	return await fbNameTrim;
}




var fbFetch3 = function() {
	const fb_page_access_token = process.env.FACEBOOK_ACCESS_TOKEN;
	const fbID = 2826538590752448;

	// Make a request for user first_name
	fetch('https://graph.facebook.com/v3.3/' + fbID + '?fields=first_name&access_token=' + fb_page_access_token)

		// Check response ok and load it as json
		.then (function(response) {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		})
		// Check if a first_name is returned, transform to string and trim inverted commas
		.then (function(user) {
			if (user.first_name == null) {
				throw new Error('No first name available from Facebook: setting to "Emotional Being"');
				let fbNameTrim = "Emotional Being";
			}
			var fbName = JSON.stringify(user.first_name);
			var fbNameTrim = fbName.slice(1,-1);
		})
		// Catch errors
		.catch(function(error) {
			console.log('There has been a problem with your fetch operation: ', error.message);
			console.log('Setting your name to "Emotional Being"');
		});
}