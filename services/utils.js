exports.validateEmail = function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}


exports.transformBrandNameInUrl = function(brandName){
	brandName = brandName.replace(/-/g,"_");
	brandName = brandName.replace(/ /g, "-");
	brandName = brandName.replace(/'/g, "-");
	brandName = brandName.replace(/"/g, "-");
	return encodeURIComponent(brandName);
};

exports.transformUrlInBrandName = function(url){
	url = url.replace(/-/g, " ");
	url = url.replace(/_/g,"-");
	return url;
};