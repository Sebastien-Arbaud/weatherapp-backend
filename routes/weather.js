var express = require('express');
var router = express.Router();
require('../models/connection'); 
const fetch = require('node-fetch');
const City = require('../models/cities');

//Variable pour récupérer l'API KEY présente dans le fichier .env

const API_KEY = process.env.API_KEY;


//Création d'une route pour ajouter de nouvelles villes.

router.post('/', (req, res) => {
	
	//Cherche dans la base de donnée si la ville n'existe pas déjà.

	City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
		
		//Si la ville n'existe pas dans la BDD on va fetcher l'API afin de récupérer les informations météorologiques nécessaires pour cette ville.

		if (dbData === null) {
			
			fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&lang=Fr&appid=${API_KEY}&units=metric`)
				.then(response => response.json())
				.then(apiData => {
					
					const newCity = new City({
						cityName: req.body.cityName,
						main: apiData.weather[0].main,
						description: apiData.weather[0].description,
						tempMin: apiData.main.temp_min,
						tempMax: apiData.main.temp_max,
					});

				    //On sauvegarde la nouvelle ville dans la BDD

					newCity.save().then(newDoc => {
						res.json({ result: true, weather: newDoc });
					});
				});

		//Si la ville existe déjà un message d'erreur est renvoyé.
			
		} else {
		
			res.json({ result: false, error: 'City already saved' });
		}
	});
});


//Création d'une route qui affiche la météo de toutes les villes présentes dans la base de données.

router.get('/', (req, res) => {
	City.find().then(data => {
		res.json({ weather: data });
	});
});

//Renvoie les informations météos en fonction d’une ville ciblée.

router.get("/:cityName", (req, res) => {
  City.findOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i") },
  }).then(data => {
    if (data) {
      res.json({ result: true, weather: data });
    } else {
      res.json({ result: false, error: "City not found" });
    }
  });
});

//Supprime une ville ciblée dans la base de donnnées.

router.delete("/:cityName", (req, res) => {

	//Recherhce dans la base de données la ville à supprimer.

  City.deleteOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i") },
  }).then(deletedDoc => {

	//La méthode deletedCount indique le nombre de documents supprimés, donc si elle est supérieure à 1 c'est que la suppression a bien été faite.

    if (deletedDoc.deletedCount > 0) {
      City.find().then(data => {
        res.json({ result: true, weather: data });
      });
    } else {
      res.json({ result: false, error: "City not found" });
    }
  });
});

module.exports = router;
