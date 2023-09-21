var express = require('express');
var router = express.Router();


const User = require('../models/users');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');



//Création d'une route pour créer un compte

router.post('/singup', (req,res) => {

  //Vérifie si les champs obligatoire pour la création d'un compte sont bien remplis sinon renvoie un message d'erreur.
    
    if ( req.body.email === '' || req.body.password === '' || req.body.email === '' && req.body.password === ''){
res.json({result : false, error: 'Missing or empty fields'});
return;
    } 

    //Cherche dans la base de donnée si l'email renseigné sur le front est déjà présent dans celle-ci.

    User.findOne({ email : req.body.email}).then(
        data =>
        {

          //Si l'adresse e-mail existe déjà dans la base de donnée un message d'erreur est envoyé indiquant que l'utilisateur existe déjà.

    if(data){
        res.json({result : false, error: 'User already exists'}); 

        //Si l'utlisateur n'existe pas déjà, il est alors crée avec les informations renseigné.Le mot de passe est crypté et un token est généré
    }else {
        const hash = bcrypt.hashSync(req.body.password, 10);

const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hash,
    token: uid2(32),
});

newUser.save().then(newDoc => {
    console.log(newDoc)
    res.json({ result: true, token: newDoc.token });
});
}
});
});

//Création de la route pour se connecter quand on a déjà un compte.

router.post('/singin', (req, res) => {

  //Vérfie que les champs obligatoire pour se connecter sont bien renseignés sinon renvoie un message d'erreur.

    if ( req.body.email === '' || req.body.password === '' || req.body.email === '' && req.body.password === '') {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }

    //Cherche si l'adresse mail renseigné sur le front est bien présente dans la BDD 
  
    User.findOne({ email: req.body.email })
      .then(data => {

        //Si l'adresse mail existe dans la BDD, le mot de passe crypté et comparé avec le mot de passe renseigné en clair sur le front.

        if (data && bcrypt.compareSync(req.body.password, data.password)) {
          res.json({ result: true, user: data });

          //Si il n'y a pas de correspondance un message d'erreur est renvoyé.

        } else {
          res.json({ result: false, error: 'User not found or wrong password' });
        }
      });
  });




module.exports = router;