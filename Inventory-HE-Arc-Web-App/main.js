/*
Choix de l'API.
*/
// API définies
const currentProdApi = 0;
const currentDevApi = 1;
const newApi = 2;

// API utilisée
var chosenApi;


/*
Variables globales.
*/
var theToken;
var productId;
var resultProductsId = [];
var webCodeCamJSdecoder;

// Définition des variables pour la construction des URL
var urlLogin;
var urlGetProductDetails;
var urlSearchProductByName;
var urlLoanProduct;
var urlReturnProduct;


/*
Initialisations.
*/
// Sélection de l'API
window.addEventListener("load", selectApi);

// Initialisation du scanner WebCodeCamJS
window.addEventListener("load", initWebCodeCamJS);


/*
Sélection de l'API.
*/
function selectApi() {
	chosenApi = document.getElementById('apiSelection').selectedIndex;
	buildUrls();

	// Masquage des autres sections
	hideShowAndSearchProduct();
	hideLoanAndReturn();

	// Affichage de la section login
	showLogin();
}

/*
Construction des URL de l'API.
*/
function buildUrls() {
	switch (chosenApi) {
		case currentProdApi: {
			const urlDomain = "https://inventory.ing.he-arc.ch";
			const urlBaseLogin = "/api/login/";
			const urlBase = "/api/rest/";

			// URL pour le login
			urlLogin = [ urlDomain + urlBaseLogin, "/", "" ];
			loginHttpMethod = "GET";

			// URL pour l'affichage d'un produit
			urlGetProductDetails = [ urlDomain + urlBase, "/Product/info?productId=", "" ];
			httpMethodGetProduct = "GET";

			// URL pour la recherche d'un produit
			urlSearchProductByName = [ urlDomain + urlBase, "/Product/search?term=", "" ];
			httpMethodSearchProduct = "GET";

			// URL pour l'emprunt d'un produit
			urlLoanProduct = [ urlDomain + urlBase, "/Product/loan?productId=", "&beginDate=", "&endDate=", "" ];
			httpMethodLoanProduct = "GET";

			// URL pour le retour d'un produit
			urlReturnProduct = [ urlDomain + urlBase, "/Product/returnProduct?productId=", "" ];
			httpMethodReturnProduct = "GET";
			break;
		}
		case currentDevApi: {
			console.log("To login to the dev API, use the following login informations:\n" +
					"Username: devweb.user or devweb.manager or devweb.admin\n" +
					"Password: 123456");

			const urlDomain = "https://inventory-dev.ing.he-arc.ch";
			const urlBaseLogin = "/api/login/";
			const urlBase = "/api/rest/";

			// URL pour le login
			urlLogin = [ urlDomain + urlBaseLogin, "/", "" ];
			loginHttpMethod = "GET";

			// URL pour l'affichage d'un produit
			urlGetProductDetails = [ urlDomain + urlBase, "/Product/info?productId=", "" ];
			httpMethodGetProduct = "GET";

			// URL pour la recherche d'un produit
			urlSearchProductByName = [ urlDomain + urlBase, "/Product/search?term=", "" ];
			httpMethodSearchProduct = "GET";

			// URL pour l'emprunt d'un produit
			urlLoanProduct = [ urlDomain + urlBase, "/Product/loan?productId=", "&beginDate=", "&endDate=", "" ];
			httpMethodLoanProduct = "GET";

			// URL pour le retour d'un produit
			urlReturnProduct = [ urlDomain + urlBase, "/Product/returnProduct?productId=", "" ];
			httpMethodReturnProduct = "GET";
			break;
		}
		case newApi: {
			console.log("To login to the new API on Mockable.io, use the following login informations:\n" +
					"Username: devweb.user\n" +
					"Password: 123456");

			const urlDomain = "https://demo6654639.mockable.io";
			const urlBaseLogin = "/api/login/";
			const urlBase = "/api/rest/";

			// URL pour le login
			urlLogin = [ urlDomain + urlBaseLogin, "/", "/" ];
			loginHttpMethod = "GET";

			// URL pour l'affichage d'un produit
			urlGetProductDetails = [ urlDomain + urlBase, "/products/", "/details/" ];
			httpMethodGetProduct = "GET";

			// URL pour la recherche d'un produit
			urlSearchProductByName = [ urlDomain + urlBase, "/search/", "/" ];
			httpMethodSearchProduct = "GET";

			// URL pour l'emprunt d'un produit
			urlLoanProduct = [ urlDomain + urlBase, "/products/", "/loan/", "/", "/" ];
			httpMethodLoanProduct = "PUT";

			// URL pour le retour d'un produit
			urlReturnProduct = [ urlDomain + urlBase, "/products/", "/return/" ];
			httpMethodReturnProduct = "PUT";
			break;
		}
	}
}


/*
Authentification de l'utilisateur.
Fonction du onclick du bouton de login.
*/
function login_onclick() {
	// Username: "devweb.user", "devweb.manager", "devweb.admin"
	// Password: "123456"

	var username = document.getElementById('login_username').value;
	var password = document.getElementById('login_password').value;
	login(username, password);
}


/*
Authentification de l'utilisateur.
*/
function login(username, password) {
	// Construction de l'URL de login
	var loginUrl = makeUrlLogin(username, password);
	console.log("Login with this username: " + username);
	console.log("URL to login:\n" + loginUrl);

	// Envoi de la requête de login
	sendRequest(loginHttpMethod, loginUrl, processLogin);
}


/*
Construction de l'URL de login.
*/
function makeUrlLogin(username, password) {
	return urlLogin[0] + username + urlLogin[1] + password + urlLogin[2];
}


/*
Actions au login de l'utilisateur.
Callback de la fonction login().
*/
function processLogin(response) {
	if (isRequestSuccess(response)) {
		// Login réussi, enregistrement du token
		setToken(response);

		// Masquage du formulaire de login
		hideLogin();

		// Affichage des autres commandes
		showShowAndSearchProduct();
	}
	else {
		// Le login a échoué, affichage de l'erreur
		printError('login_response', response);
	}
}


/*
Récupère le token de la réponse reçue.
*/
function setToken(response) {
	if (chosenApi == currentProdApi || chosenApi == currentDevApi) {
		theToken = response.result;
	}
	else if (chosenApi == newApi) {
		theToken = response.token;
	}
	console.log("Received token: " + theToken);
}


/*
Récupération des détails d'un produit.
Fonction du onclick du bouton.
*/
function getProductDetails_onclick() {
	productId = document.getElementById('showProductDetails_productId').value;
	getProductDetails(productId);
}


/*
Récupération des détails d'un produit.
*/
function getProductDetails(productId) {
	// Construction de l'URL
	var url = makeUrlGetProductDetails(productId);
	console.log("URL to retrieve details of product with ID " + productId + ":\n" + url);

	// Envoi de la requête
	sendRequest(httpMethodGetProduct, url, processProductDetails);
}


/*
Construction de l'URL pour l'affichage d'un produit.
*/
function makeUrlGetProductDetails(productId) {
	return urlGetProductDetails[0] + theToken + urlGetProductDetails[1] + productId + urlGetProductDetails[2];
}


/*
Affichage des détails du produit.
Fonction de callback.
*/
function processProductDetails(response) {
	if (isRequestSuccess(response)) {
		if (chosenApi == currentProdApi || chosenApi == currentDevApi) {
			var is_loan = response.result.loan ? true : false;

			console.log("Product ID: " + response.result.id
					+ ", product name: " + response.result.name
					+ ", product description: " + response.result.description
					+ ", is loan: " + is_loan);

			// Affichage des détails du produit
			document.getElementById('getProductDetails_response').innerHTML =
					"ID : " + response.result.id + "<br/>" +
					"Nom : " + response.result.name + "<br/>" +
					"Description : " + response.result.description + "<br/>" +
					"Loué : " + is_loan;
		}
		else if (chosenApi == newApi) {
			console.log("Product ID: " + response.product.id
					+ ", product name: " + response.product.name
					+ ", product description: " + response.product.description
					+ ", is loan: " + response.product.is_loan);

			// Affichage des détails du produit
			document.getElementById('getProductDetails_response').innerHTML =
					"ID : " + response.product.id + "<br/>" +
					"Nom : " + response.product.name + "<br/>" +
					"Description : " + response.product.description + "<br/>" +
					"Loué : " + response.product.is_loan;
		}

		// Affichage de la location et du retour du produit
		showLoanAndReturn();
	}
	else {
		// Affichage de l'erreur
		printError('getProductDetails_response', response);

		// Masquage de la location et du retour du produit
		hideLoanAndReturn();
	}
}


/*
Recherche d'un produit par son nom.
Fonction du onclick du bouton.
*/
function searchProductByName_onclick() {
	var term = document.getElementById('searchProductByName_term').value;
	searchProductByName(term);
}


/*
Recherche d'un produit par son nom.
*/
function searchProductByName(term) {
	// Construction de l'URL
	var url = makeUrlSearchProductByName(term);
	console.log("URL to search the product with the name \"" + term + "\":\n" + url);

	// Envoi de la requête
	sendRequest(httpMethodSearchProduct, url, processSearchProductByName);
}


/*
Construction de l'URL pour la recherche d'un produit.
*/
function makeUrlSearchProductByName(term) {
	return urlSearchProductByName[0] + theToken + urlSearchProductByName[1] + term + urlSearchProductByName[2];
}


/*
Affichage des produits trouvés.
Fonction de callback.
*/
function processSearchProductByName(response) {
	if (isRequestSuccess(response)) {

		var total;
		var results;

		// Adaptation selon l'API
		if (chosenApi == currentProdApi || chosenApi == currentDevApi) {
			totalResults = response.result.total;
			results = response.result.datas;
		}
		else if (chosenApi == newApi) {
			totalResults = response.number_results;
			results = response.results;
		}

		console.log("Number of results: " + totalResults);
		console.log("Complete response:\n" + JSON.stringify(response));

		// Affichage du nombre de résultats
		var responseSection = document.getElementById('searchProductByName_response');
		responseSection.innerHTML = "Nombre de résultats : " + totalResults + "</br>"
		 		+ "<ul id=\"searchProductByName_list\"></ul>";

		// Affichage de la liste des résultats
		var resultsListSection = "";
		for (i = 0; i < totalResults; ++i) {
			if (!(chosenApi == currentProdApi || chosenApi == currentDevApi) || results[i] != false) {
				var resultId = "searchProductByName_result" + i;

				resultsListSection +=
						"<li>" + "<a " + "id=\"" + resultId + "\"" + " href=\"" + "#" + "\">"
						+ results[i].id
						+ ": "
						+ results[i].name
						+ "</a>" + "</li>";
			}
		}
		document.getElementById('searchProductByName_list').innerHTML = resultsListSection;

		// Ajout d'un lien sur chaque résultat
		for (i = 0; i < totalResults; ++i) {
			if (!(chosenApi == currentProdApi || chosenApi == currentDevApi) || results[i] != false) {
				resultProductsId[i] = results[i].id;

				var resultId = "searchProductByName_result" + i;
				document.getElementById(resultId).onclick = function(mouseEvent) {
					// Recherche du produit sélectionné
					productId = resultProductsId[mouseEvent.srcElement.id["searchProductByName_result".length]];
					getProductDetails(productId);
				}
			}
		}

	}
	else {
		// Affichage de l'erreur
		printError('searchProductByName_response', response);
	}
}


/*
Emprunt d'un produit.
Fonction du onclick du bouton.
*/
function loanProduct_onclick() {
	var beginDate = document.getElementById('beginDate_productId').value;
	var endDate = document.getElementById('endDate_productId').value;

	loanProduct(productId, beginDate, endDate);
}


/*
Emprunt d'un produit.
*/
function loanProduct(productId, beginDate, endDate) {
	// Construction de l'URL
	var url = makeUrlLoanProduct(productId, beginDate, endDate);
	console.log("URL to loan the product with ID " + productId
			+ " from the " + beginDate
			+ " to the " + endDate
			+ ":\n" + url);

	// Envoi de la requête
	sendRequest(httpMethodLoanProduct, url, processLoanProduct);
}


/*
Construction de l'URL pour l'emprunt d'un produit.
*/
function makeUrlLoanProduct(productId, beginDate, endDate) {
	return urlLoanProduct[0] + theToken + urlLoanProduct[1] + productId
			+ urlLoanProduct[2] + beginDate + urlLoanProduct[3] + endDate + urlLoanProduct[4];
}


/*
Affichage des produits trouvés.
Fonction de callback.
*/
function processLoanProduct(response) {
	if (isRequestSuccess(response)) {
		console.log("Loan success!");

		// Affichage des résultats
		document.getElementById('loanProduct_response').innerHTML =
				"Emprunt du produit réussi !";
	}
	else {
		// Affichage de l'erreur
		printError('loanProduct_response', response);
	}
}


/*
Retour d'un produit.
Fonction du onclick du bouton.
*/
function returnProduct_onclick() {
	returnProduct(productId);
}


/*
Retour d'un produit.
*/
function returnProduct(productId) {
	// Construction de l'URL
	var url = makeUrlReturnProduct(productId);
	console.log("URL to return the product with ID " + productId + ":\n" + url);

	// Envoi de la requête
	sendRequest(httpMethodReturnProduct, url, processReturnProduct);
}


/*
Construction de l'URL pour le retour d'un produit.
*/
function makeUrlReturnProduct(productId) {
	return urlReturnProduct[0] + theToken + urlReturnProduct[1] + productId + urlReturnProduct[2];
}


/*
Affichage des produits trouvés.
Fonction de callback.
*/
function processReturnProduct(response) {
	if (isRequestSuccess(response)) {
		console.log("Return success!");

		// Affichage des résultats
		document.getElementById('returnProduct_response').innerHTML =
				"Retour du produit réussi !";
	}
	else {
		// Affichage de l'erreur
		printError('returnProduct_response', response);
	}
}


/*
Envoi d'une requête.
*/
function sendRequest(method, url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function() {
		sendRequest_callback(xhr, callback);
	}

	xhr.send();
}


/*
Traitement de la réponse.
*/
function sendRequest_callback(xhr, callback) {
	if (xhr.readyState === XMLHttpRequest.DONE) {
		if (xhr.status === 200) {
			var response = JSON.parse(xhr.responseText);

			// Traitement de la réponse
			callback(response);
		}
	}
}


/*
Vérification de la réponse.
*/
function isRequestSuccess(response) {
	return response.success;
}


/*
Affichage de la section de login.
*/
function showLogin() {
	document.getElementById('signIn').style.display = 'block';

	// Autofocus sur le champ Product ID
	document.getElementById('login_username').focus();
}


/*
Masquage de la section de login.
*/
function hideLogin() {
	document.getElementById('signIn').style.display = 'none';
}


/*
Affichage des sections Show Product, ScanWebCodeCamJS et Search Product.
*/
function showShowAndSearchProduct() {
	document.getElementById('showProduct').style.display = 'block';
	document.getElementById('scanWebCodeCamJS').style.display = 'block';
	document.getElementById('searchProductByName').style.display = 'block';

	// Autofocus sur le champ Product ID
	document.getElementById('showProductDetails_productId').focus();
}


/*
Masquage des sections Show Product, ScanWebCodeCamJS et Search Product.
*/
function hideShowAndSearchProduct() {
	document.getElementById('showProduct').style.display = 'none';
	document.getElementById('scanWebCodeCamJS').style.display = 'none';
	document.getElementById('searchProductByName').style.display = 'none';
}


/*
Affichage des sections Loan et Return.
*/
function showLoanAndReturn() {
	document.getElementById('loanProduct').style.display = 'block';
	document.getElementById('returnProduct').style.display = 'block';

	// Autofocus sur le champ Product ID
	document.getElementById('beginDate_productId').focus();
}


/*
Masquage des sections Loan et Return.
*/
function hideLoanAndReturn() {
	document.getElementById('loanProduct').style.display = 'none';
	document.getElementById('returnProduct').style.display = 'none';
}


/*
Affichage de l'erreur.
*/
function printError(elementId, response) {
	document.getElementById(elementId).innerHTML = response.error;
	console.log("Error: " + response.error);
}


/*
Scanner WebCodeCamJS
Démarrage du scan de codes-barres et codes QR.
*/
function initWebCodeCamJS() {
	var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent";
	var arg = {
		resultFunction: function(result) {
			// Affichage du contenu du code QR
			document.getElementById("scanWebCodeCamJS_response").innerHTML = "Found " + result.format + ": " + result.code;

			// Recherche du produit correspondant
			productId = result.code;
			getProductDetails(productId);
		}
	};
	webCodeCamJSdecoder = new WebCodeCamJS("canvas");
	webCodeCamJSdecoder.buildSelectMenu('select.scanWebCodeCamJS', 'environment|back');
	//webCodeCamJSdecoder.options.width = 625;
	//webCodeCamJSdecoder.options.height = 576;
	webCodeCamJSdecoder.init(arg);

	// Activation du bouton pour démarrer le scanner
	setButtonToStartScanWebCodeCamJS();

	// Redémarrage du scanner en cas de changement de caméra
	document.querySelector('select').addEventListener('change', function() {
		webCodeCamJSdecoder.stop().play();
	});
}

/*
Scanner WebCodeCamJS
Démarrage du scanner.
*/
function startScanWebCodeCamJS() {
	document.getElementById('scanWebCodeCamJSPreview').style.display = 'block';
	webCodeCamJSdecoder.play();
	setButtonToStopScanWebCodeCamJS();
}

/*
Scanner WebCodeCamJS
Arrêt du scanner.
*/
function stopScanWebCodeCamJS() {
	document.getElementById('scanWebCodeCamJSPreview').style.display = 'none';
	webCodeCamJSdecoder.stop();
	setButtonToStartScanWebCodeCamJS();
}

/*
Mise à jour du bouton pour démarrer le scanner.
*/
function setButtonToStartScanWebCodeCamJS() {
	document.getElementById('buttonScanWebCodeCamJS').textContent = "Start scan WebCodeCamJS";
	document.getElementById('buttonScanWebCodeCamJS').onclick = startScanWebCodeCamJS;
}

/*
Mise à jour du bouton pour arrêter le scanner.
*/
function setButtonToStopScanWebCodeCamJS() {
	document.getElementById('buttonScanWebCodeCamJS').textContent = "Stop scan WebCodeCamJS";
	document.getElementById('buttonScanWebCodeCamJS').onclick = stopScanWebCodeCamJS;
}
