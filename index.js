var express = require('express');
var app = express();
var braintree = require('braintree');
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
		res.send(response.clientToken);
	});
});

app.post('/payment-methods', function (req,res) {
	var nonce = req.body.payment_method_nonce;
	gateway.transaction.sale({
		amount : '42.00',
		paymentMethodNonce : nonce,
	} , function(err, result) {
		//implement what ever has to be sent back
	});
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


