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
    environment:  braintree.Environment.Sandbox,
    merchantId:   '2dbwgsxsq9pnv5gj',
    publicKey:    '5b5jgjwbgdqnb9p5',
    privateKey:   'd6e65a031b8223322eead6abcd588b17'
});

app.get('/client_token', function (req,res) {
	gateway.clientToken.generate({}, function (err,response){
		if (err) {
			console.log(err);
		}
		res.json({client_token : response.clientToken});
	});
});

//TODO : find if the below func is of any use for retrieving accounts from vault
app.post('/customer',checkAgreement);

app.post('/nonce/transaction', function (req,res) {
	var nonce = req.body.nonce;

	//TODO : check how to vault an account
	/*gateway.customer.create({
		paymentMethodNonce:nonce
	}, function(err, customer_result) {
		if (customer_result.success) {
			console.log("customer id:" + customer_result.customer.id);
			console.log("customer paymentMethod:" + customer_result.customer.paymentMethods[0].token);
			console.log("customer id:" + customer_result.customer.id);
			var token = customer_result.customer.paymentMethods[0].token;
*/
			gateway.transaction.sale({
			amount : '42.00',
			paymentMethodNonce : nonce,

			/*options: {
			storeInVault: true
			}*/

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
		/*}
	});*/
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


function checkAgreement(req, res) {

		var model = {};
        var customerId = req.body.accountNumber;
        console.log(customerId);

        gateway.customer.find(customerId, function(err, customer) {
            console.log(err);
            console.log(customer);

            if (err) {
                model.isCustomer = false;

                gateway.clientToken.generate({}, function(err, response) {
                    model.clientToken = response.clientToken;
                    res.json(model);
                });
                
            } else {
                model.isCustomer = true;           
                res.json(model);
            }

        });
    }

