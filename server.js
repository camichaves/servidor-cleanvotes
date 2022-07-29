require('dotenv').config({path: __dirname + '/.env'})
const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors())

const session = require('express-session')
const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth2').Strategy;

var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"));
console.log("-----------------------")

console.log(web3)
const { soliditySha3 } = require("web3-utils");


var crypto = require("crypto");
var mysql = require('mysql');
app.use(express.json())

const abiDecoder = require("web3-eth-abi");
const contractAdres = '0x479A46550C17Fe95843574c45BdbBB7389368745';
abi =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "ownerVotacion",
				"type": "address"
			},
			{
				"internalType": "bytes32[]",
				"name": "_codigos",
				"type": "bytes32[]"
			}
		],
		"name": "cargaCodigosVotacion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "_ownerAdr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string[]",
				"name": "_emailsVotantes",
				"type": "string[]"
			}
		],
		"name": "eventNewVotacion",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "_candidateid",
				"type": "uint256"
			}
		],
		"name": "eventVote",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_titulo",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_nameCandidatos",
				"type": "string[]"
			},
			{
				"internalType": "uint256",
				"name": "cantVotantes",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_descripcion",
				"type": "string"
			},
			{
				"internalType": "string[]",
				"name": "_emailsVotantes",
				"type": "string[]"
			}
		],
		"name": "nuevaVotacion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_candidateid",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "_codigo",
				"type": "bytes"
			},
			{
				"internalType": "address",
				"name": "_ownerAdr",
				"type": "address"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "electiones",
		"outputs": [
			{
				"internalType": "string",
				"name": "titleVote",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "candidatecount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "votantecount",
				"type": "uint256"
			},
			{
				"internalType": "enum VoteCodeContract.state",
				"name": "estado",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "initVote",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endVote",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "ownerAdr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getCandidatoNombre",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "ownerAdr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getCandidatoVotos",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


//Middleware
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"


//Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Developer Console
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];

authUser = (request, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/google/callback",
  passReqToCallback: true
}, authUser));


passport.serializeUser((user, done) => {
  console.log(`\n--------> Serialize User:`)
  console.log(user)
  // The USER object is the "authenticated user" from the done() in authUser function.
  // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.  

  done(null, user)
})


passport.deserializeUser((user, done) => {
  console.log("\n--------- Deserialized User:")
  console.log(user)
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

  done(null, user)
})


//Start the NODE JS server
app.listen(3001, () => console.log(`Server started on port 3001...`))
var account = web3.eth.accounts.privateKeyToAccount(process.env['PRIVATE_KEY_WALLET']);
var addrApp = account.address;
var contract = new web3.eth.Contract(abi, contractAdres);
var con = mysql.createConnection({
  host: "localhost",
  user: process.env['USER_DB'],
  password: process.env['PASSWORD_DB'],
  database: "web3vote"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  console.log(account);
});


//console.log() values of "req.session" and "req.user" so we can see what is happening during Google Authentication
let count = 1
showlogs = (req, res, next) => {
  console.log("\n==============================")
  console.log(`------------>  ${count++}`)

  console.log(`\n req.session.passport -------> `)
  console.log(req.session.passport)

  console.log(`\n req.user -------> `)
  console.log(req.user)

  console.log("\n Session and Cookie")
  console.log(`req.session.id -------> ${req.session.id}`)
  console.log(`req.session.cookie -------> `)
  console.log(req.session.cookie)

  console.log("===========================================\n")

  next()
}

app.use(showlogs)


app.get('/auth/google',
  passport.authenticate('google', {
    scope:
      ['email', 'profile']
  }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/redirect',
    failureRedirect: '/login'
  }));

//Define the Login Route
app.get("/login", (req, res) => {
  res.render("login.ejs")
})


//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  res.redirect("/login")
}

//Define the Protected Route, by using the "checkAuthenticated" function defined above as middleware
app.get("/redirect", checkAuthenticated, (req, res) => {
  //res.render("dashboard.ejs", {name: req.user.displayName})
  // redirecciono con el codigo, y que el codigo de votacion quede en el storage x ahora.
  console.log(req.user)

  // ver si ese mail existe en mails, si existe relacionarle codigo y redireccionar con 
  // /dir/codigo
	// 'SELECT IF( EXISTS(SELECT * FROM emails e WHERE e.email =  "' + req.user.email + 
	// '"), UPDATE emails e set e.codigo_id, 0)'
	var sql = 'SELECT e.*, v.address FROM emails e join votaciones v ' +
	' on e.votacion_id = v.votacion_id WHERE e.email =  "' + req.user.email + '"';
	con.query(sql, async function (err, result, fields) {
		if (err) throw err;
		if(result && result.length>0){

			console.log("----")

			// IF NO TIENE REL CODIGO

			if(!result[0].codigo_id){

			sql = 'Select c.codigo_id, c.codigo, v.address from codigos c left join emails e on  c.codigo_id = e.codigo_id join votaciones v on v.votacion_id = c.votacion_id  where c.votacion_id = ' + 
			result[0].votacion_id
			+'  and e.codigo_id is NULL limit 1 ';
			con.query(sql, async function (err, rta, field) {
			if (err) throw err;

			sql = 'UPDATE emails e set e.codigo_id = ' + rta[0].codigo_id 
			+' WHERE e.email_id = ' + result[0].email_id ;
			con.query(sql, async function (err, r) {
			if (err) throw err;

			res.redirect("http://localhost:4200/#/add-vote/" + rta[0].address + "/" + rta[0].codigo);
		});
	
			});
		}else{
			// le retorno el codigo que ya tiene //arreglar
			sql = 'Select c.codigo_id, c.codigo, v.address from codigos c join emails e on e.codigo_id = c.codigo_id' + 
			' join votaciones v on v.votacion_id = e.votacion_id ' +
			' where e.votacion_id = ' + result[0].votacion_id + ' LIMIT 1' ;
			con.query(sql, async function (err, r) {
			if (err) throw err;

			res.redirect("http://localhost:4200/add-vote/" + r[0].address + "/" + r[0].codigo);

		});
		}
		}else{
			res.redirect("http://localhost:4200/" + result[0].address + "/voter/error");
		}
 });
// });
});

app.post("/mailsvotacion", asyncWrapper(async (req) => verificarMailsVotacion(req)));

function asyncWrapper(fn) {
  return (req, res, next) => {
    return Promise.resolve(fn(req))
      .then((result) => res.send(result))
      .catch((err) => next(err))
  }
}

async function verificarMailsVotacion(request){

  votacionAddress = request.body.votacionAddress;
  hashTrx = request.body.hash;

  const met = await contract.methods.electiones(votacionAddress).call();

  const mails = await obtenerVotacionMails(hashTrx);
  console.log(mails);
  if (met.owner === '0x0000000000000000000000000000000000000000') {
    console.log("No existe")
    return false;
  }
  console.log("Existe!");
  const estado = met.estado;
  if (estado == 0) {
    console.log("Estado creado!");
  } else {
    console.log("Estado distinto de creadooo!:" + estado);
    return false;
  }



  var codigos = [];
  // generar 1 codigo x mail, 

  for (let i = 0; i < mails.length; i++) {
    var cod = crypto.randomBytes(20).toString('hex');
    codigos.push(cod);
  }

  //guardar en la bd, 
  var codigosKeccack = [];
  const sql = 'INSERT INTO votaciones (address, ready) VALUES ("' + met.owner + '", 0);';
  con.query(sql, async function (err, votaci) {
    if (err) throw err;
    
    for (let i = 0; i < codigos.length; i++) {
      //keccackearlo 
      codigosKeccack[i] = soliditySha3(codigos[i]);
      const sql = 'INSERT INTO codigos (votacion_id, codigo) VALUES ("' 
      + votaci.insertId + '", "' + codigos[i] +'");';
      con.query(sql, function (err, codig) {
        if (err) throw err;
      });
    }
        for (let j = 0; j < mails.length; j++) {
          const sql = 'INSERT INTO emails (votacion_id, email, codigo_id) VALUES ("' 
          + votaci.insertId + '", "' + mails[j] + '", NULL);';
          con.query(sql, function (err, result) {
            if (err) throw err;
		});
	}
			//y mandarle eso al contrato.
  			
  			// const m = await contract.methods
  			// .cargaCodigosVotacion(votacionAddress, codigosKeccack).send({ from: account.address });
  			
			//   const tx = await contract.methods.cargaCodigosVotacion(votacionAddress, codigosKeccack);
			//   const gas = await tx.estimateGas({from: account.address});
			//   const gasPrice = await web3.eth.getGasPrice();
			//   const data = tx.encodeABI();
			//   const nonce = await web3.eth.getTransactionCount(account.address);
			//   const txData = {
			// 	from: account.address,
			// 	to: contractAdres,
			// 	data: data,
			// 	gas,
			// 	gasPrice,
			// 	nonce
			//   };

			console.log("--------------")
			console.log(codigosKeccack);
			const networkId = await web3.eth.net.getId();
			const tx =  contract.methods.cargaCodigosVotacion(votacionAddress, codigosKeccack);
  			const gas = await tx.estimateGas({from: account.address});
  			const gasPrice = await web3.eth.getGasPrice();
 		 	const data = tx.encodeABI();
  			const nonce = await web3.eth.getTransactionCount(account.address);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAdres, 
      data,
      gas,
      gasPrice,
      nonce, 
      chainId: networkId
    },
    "effbf7fdd8e4c9fd9edcb682a050b5bca8521177afad5374d4ca2bb2984c2f28"
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(`Transaction hash: ${receipt.transactionHash}`);
	return true;
          
  });

   
}

  //VERIFICAR QUE LA VOTACION EXISTA Y ESTE EN ESTADO PENDIENTE (config billetera)

//Define the Logout
// app.post("/logout", (req,res) => {
//     req.logOut()
//     res.redirect("/login")
//     console.log(`-------> User Logged out`)
// })

async function obtenerVoto(transactionHash){
    const rta = await web3.eth.getTransaction(transactionHash, function (error, result){console.log(result);});
    console.log(rta);
    const inputs = [
      {
        internalType: 'uint256',
        name: '_candidateid',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: '_codigo',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: '_ownerAdr',
        type: 'address'
      }
    ];
    const decoded = await this.web3.eth.abi.decodeParameters(
      inputs,
      rta.input.slice(10)); // Or (11), not sure
    rta.value = await this.getCandidate(decoded[0], decoded[2]);
    return rta;

  }

  async function obtenerVotacionMails(transactionHash){
	console.log(transactionHash);
    const rta = await web3.eth.getTransaction(transactionHash, function (error, result){console.log(result);});
    console.log(rta);
	const inputs =  [
		{
			"internalType": "string",
			"name": "_titulo",
			"type": "string"
		},
		{
			"internalType": "string[]",
			"name": "_nameCandidatos",
			"type": "string[]"
		},
		{
			"internalType": "uint256",
			"name": "cantVotantes",
			"type": "uint256"
		},
		{
			"internalType": "string",
			"name": "_descripcion",
			"type": "string"
		},
		{
			"internalType": "string[]",
			"name": "_emailsVotantes",
			"type": "string[]"
		}
	];
    const decoded = await web3.eth.abi.decodeParameters(
      inputs,
      rta.input.slice(10)); // Or (11), not sure
	  console.log(decoded);
    return decoded[4];
	}