var express = require('express');
var app = express();
var braintree = require('braintree');
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

var gateway = braintree.connect({
	environment: braintree.Environment.Sandbox,
	merchantId: "k9gyh34vkz7d66dq",
	publicKey: "6t63yqdqrnbct5kn",
	privateKey: "7956aaf1a7ac4003ba0d66436a7b54f4" 
});

app.get('/client_token', function (req,res) {
	gateway.clientToken.generate({}, function (err,response){
		res.json({client_token : response.clientToken});
	});
});

app.post('/nonce/transaction', function (req,res) {
	var nonce = req.body.nonce;
	gateway.customer.create({
		paymentMethodNonce:nonce
	}, function(err, customer_result) {
		if (customer_result.success) {
			console.log("customer id:" + customer_result.customer.id);
			console.log("customer paymentMethod:" + customer_result.customer.paymentMethods[0].token);
			console.log("customer id:" + customer_result.customer.id);
			var token = customer_result.customer.paymentMethods[0].token;

			gateway.transaction.sale({
			amount : '42.00',
			paymentMethodNonce : nonce,
			options: {
			storeInVault: true
			}
		} , function(err, result) {
			if (err) {
				console.log(result);
	    res.send("<h1>Error:  " + err + "</h1>");
	  } else if (result.success) {
	    res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
	  } else {
	    res.send("<h1>Error:  " + result.message + "</h1>");
	  }
		});
		}
	});
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


