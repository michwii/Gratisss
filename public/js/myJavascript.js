function LogInFacebook(){
	FB.login(function(response) {
		if (response.status === 'connected') {
		// Logged into your app and Facebook.
			console.log("Connected into Facebook");
		} else if (response.status === 'not_authorized') {
		// The person is logged into Facebook, but not your app.
			console.log("Connected into Facebook but without authorization");
		} else {
		// The person is not logged into Facebook, so we're not sure if
		// they are logged into this app or not.
			console.log("NOT Connected into Facebook");
		}
	});
}


function logIn(event){
	var form = event.target;
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening
	var email = $(form).find( "input[name='email']" ).val()
	var password = $(form).find( "input[name='password']" ).val();
	
	$.post( "api/users/connexion", { email: email, password: password }).done(function( data ) {
		var response = data;
		console.log(response);
		if(response.success == "ko"){
			$('#formError').show();
			$('#formError').html(response.message);
		}else{
			window.location.replace("/");
		}
	});
}

function signUp(event){
	var form = event.target;
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening
	console.log(form);
	var email = $(form).find( "input[name='email']" ).val();
	var login = $(form).find( "input[name='login']" ).val();
	var password = $(form).find( "input[name='password']" ).val();
	var confirmPassword = $(form).find( "input[name='passwordAgain']" ).val();
	
	$.post( "api/users", { email: email, password: password, login:login }).done(function( data ) {
		var response = data;
		console.log(data);
		if(response.success == "ko"){
			$('#formError').show();
			$('#formError').html(response.message);
		}else{
			console.log("redirection");
			window.location.replace("/");
		}
	});

}