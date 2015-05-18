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
	var email = $(form).find( "input[name='email']" ).val()
	var password = $(form).find( "input[name='password']" ).val();
	var confirmPassword = $(form).find( "input[name='passwordAgain']" ).val();
	
	$.post( "api/users", { email: email, password: password }).done(function( data ) {
		var response = data;
		if(response.success == "ko"){
			$('#formError').show();
			$('#formError').html(response.message);
		}else{
			console.log("redirection");
			window.location.replace("/");
		}
	});

}