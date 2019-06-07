//EXPLICACIÓN PROGRAMA

	//Este fichero maneja las peticiones realizadas por dialogFlow al dominio botodor.ignorelist.com
	//Para ello se creó un certificado SSL y modificado apache2 para que redirigiera a otra ruta y puerto distinto, en este caso el 3000 del node.js
	//Una vez recibe los parámetros los clasifica, dependiendo de los valores que recibe, llamará a una función distinta
	//Cada función hace una peticion http al la aplicacion de Java RestFul WebService para retornar una consulta SPARQL
	//Dicha consulta dependerá de la función seleccionada dependiendo del Path recibido por el node.js
	//El simbolo <---> indica que es indicado por el usuario algo específico

//Definicion variables

	var request = require('request');
	var express = require('express');
	var app = express();
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	var consultaFormatoDialogFlow
	var rutaBaseConexionApi= 'http://botodor.ignorelist.com:8084/recetasCeliacos/consultas/recetario/';
	var tiempoTotal=0;

//Manejo peticiones de DialogFlow

	//Controlador peticiones y respuestas
	app.use(function (req, res) {
	 	console.log('\x1b[2m%s\x1b[0m',"\n#-----------Recibiendo informacion de DialogFlow-----------#\n");
		if (!req.body) return res.sendStatus(400)
		res.setHeader('Content-Type', 'application/json');
		console.log('\x1b[11m%s\x1b[0m',"	#Ha recibido peticion con los siguientes valores#\n");

	//DEFINICION VARIABLES RECIBIDAS POR DIALOGFLOW

		//En caso de querer acceder directamente al dominio, será redirigido a url indicada
		if(Object.entries(req.body).length === 0) {
			res.redirect('http://botodor.ignorelist.com:8084/recetasCeliacos');
		}

		//Define la variable descripcion
		if(req.body.queryResult.parameters['descripcion']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámentro descripcion: "+req.body.queryResult.parameters['descripcion']);
			var descripcion = req.body.queryResult.parameters['descripcion'];
        }

		//Define la variable auxiliar
        if(req.body.queryResult.parameters['auxiliar']) {
        	console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámentro descripcion: "+req.body.queryResult.parameters['auxiliar']);
            var auxiliar = req.body.queryResult.parameters['auxiliar'];
        }


		//Define la variable tiempoRealizar
		if(req.body.queryResult.parameters['tiempoRealizar']) {
     	    console.log("\x1b[32m%s\x1b[0m","#------->Recibido parámetro tiempoRealizar: "+req.body.queryResult.parameters['tiempoRealizar']);
	       	var tiempoRealizar = req.body.queryResult.parameters['tiempoRealizar'];
		}

		//Define la variable tiempoMin
        if(req.body.queryResult.parameters['tiempoMin']) {
            var tiempo = req.body.queryResult.parameters['tiempoMin'];
				//En caso de que la variable tiempoMin contenga alguno de los siguientes caracteres
		 		if (tiempo.includes("horas y") || tiempo.includes("horas") || tiempo.includes("hora") || tiempo.includes("horas") ||  tiempo.includes("hora y") || tiempo.includes("h") ||  tiempo.includes("y horas") ||  tiempo.includes("y hora") ||  tiempo.includes("y h")) {
					tiempoModificado = tiempo.replace('horas y',":").replace("horas",":").replace("hora y",":").replace("hora",":").replace("h",":");
					var separacionCadenaTiempo = tiempoModificado.split(":");
        	        var tiempoTotal=separacionCadenaTiempo[0]*60;
						//Comprobamos que el resultado final es un entero para retornarlo
						if(tiempoTotal === parseInt(tiempoTotal,10)){
            	            tiempoMin=tiempoTotal;
                        }
						//En caso de que la variable tiempo siga teniendo alguno de los siguientes campos
						if (tiempo.includes("minutos") || tiempo.includes("minuto") || tiempo.includes("mins") || tiempo.includes("min")){
							tiempoModificado= tiempoModificado.replace("y minutos",":").replace("y minuto",":").replace("y min",":").replace("minutos",":").replace("minuto",":").replace("min",":");
    		                separacionCadenaTiempo=tiempoModificado.split(":");
                    		var tiempoTotal=tiempoTotal+separacionCadenaTiempo[1]*1;
								//Comprobamos que el resultado final es un entero para retornarlo
								if(tiempoTotal === parseInt(tiempoTotal,10)){
									tiempoMin=tiempoTotal;
								}
        		}
		//En caso de que no contenga la variable tiempoMin algunos de los campos mencionados en la condición anterior
		} else {
			tiempoModificado=tiempo.replace("y minutos",":").replace("y minuto",":").replace("y min",":").replace("minutos",":").replace("minuto",":").replace("min",":");
			separacionCadenaTiempo=tiempoModificado.split(":");
			var tiempoMin=separacionCadenaTiempo[0]*1;
		}
            console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro tiempoMin con valor: "+tiempoMin);
		}

		//Define la variable mayorDe
		if(req.body.queryResult.parameters['mayorDe']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro mayorDe: "+req.body.queryResult.parameters['mayorDe']);
			var mayorDe = req.body.queryResult.parameters['mayorDe'];
		}

		//Define la variable pasosRealizar
		if(req.body.queryResult.parameters['pasosRealizar']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro pasosRealizar: "+req.body.queryResult.parameters['pasosRealizar']);
			var pasosRealizar = req.body.queryResult.parameters['pasosRealizar'];
		}

		//Define la variable menorDe
		if(req.body.queryResult.parameters['menorDe']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro menorDe: "+req.body.queryResult.parameters['menorDe']);
			var menorDe = req.body.queryResult.parameters['menorDe'];
		}

		//Define la variable categoria
		if(req.body.queryResult.parameters['categoria']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro categoria: "+req.body.queryResult.parameters['categoria']);
			var categoria = req.body.queryResult.parameters['categoria'];
		}

		//Define la variable tipoIngrediente
		if(req.body.queryResult.parameters['tipoIngrediente']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro tipoIngrediente con valor: "+req.body.queryResult.parameters['tipoIngrediente']);
			var tipoIngrediente = req.body.queryResult.parameters['tipoIngrediente'];
		}

		//Define la variable ingredientes
		if(req.body.queryResult.parameters['ingredientes']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro ingredientes: "+req.body.queryResult.parameters['ingredientes']);
			var ingredientes = req.body.queryResult.parameters['ingredientes'];
		}

		//Define la variable negacion
		if(req.body.queryResult.parameters['negacion']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro negacion: "+req.body.queryResult.parameters['negacion']);
			var negacion = req.body.queryResult.parameters['negacion'];
		}

		//Define la variable number
		if(req.body.queryResult.parameters['number']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro number con valor: "+req.body.queryResult.parameters['number']);
			var number = req.body.queryResult.parameters['number'];
		}

		//Define la variable recetas
		if(req.body.queryResult.parameters['recetasRecetas']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro recetasRecetas: "+req.body.queryResult.parameters['recetasRecetas']);
			var recetas = req.body.queryResult.parameters['recetasRecetas'];
		}

		//Define la variable afirmacion
		if(req.body.queryResult.parameters['afirmacion']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro afirmacion: "+req.body.queryResult.parameters['afirmacion']);
			var afirmacion = req.body.queryResult.parameters['afirmacion'];
		}

		//Define la variable tipoCategorias
		if(req.body.queryResult.parameters['tipoCategorias']) {
	        console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro tipoCategorias con valor: "+req.body.queryResult.parameters['tipoCategorias']);
			var tipoCategorias = req.body.queryResult.parameters['tipoCategorias'];
		}

		//Define la variable nombreRecetas
        if(req.body.queryResult.parameters['nombre']) {
            console.log('\x1b[32m%s\x1b[0m',"#------->Recibido parámetro nombre con valor: "+req.body.queryResult.parameters['nombre']);
            var nombreReceta = req.body.queryResult.parameters['nombre'];
   		}


	//DEFINICION DE LA FUNCIONES DEPENDIENDO DE LOS VALORES RECIBIDOS


		//Receta cantidad limitada
		if (recetas && number && !tipoIngrediente && !descripcion && !menorDe && !tiempoMin && !categoria && !pasosRealizar && !tipoCategorias) {
			conexionRestAPI(rutaBaseConexionApi+'/recetaslimitadas/'+number+'/recetas');
			console.log('\x1b[36m%s\x1b[0m', "\n##Con los parámetros recibos se mostrarán cantidades limitadas de recetas##");
		}

		//Todas las recetas
		if (recetas && !number && !tipoIngrediente && !descripcion && !menorDe && !tiempoMin && !categoria && !pasosRealizar && !tipoCategorias) {
			conexionRestAPI(rutaBaseConexionApi+'recetas');
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar todas las recetas ##");
		}

		//Recetas con ingrediente
		if (tipoIngrediente && recetas && !number && !descripcion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar todas las recetas y sus ingrientes ##");
			conexionRestAPI(rutaBaseConexionApi+tipoIngrediente+'/recetas/');
		}

		//Recetas con ingrediente limitadando cantidad
		if (tipoIngrediente && !negacion && recetas && number && !descripcion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas que contiene un ingrediente pero limitando la cantidad  ##");
			conexionRestAPI(rutaBaseConexionApi+'ingredinteLimitadoReceta/'+tipoIngrediente+'/afirmacion/recetas/'+number);
        }

		//Recetas no tienen ingrediente
		if (tipoIngrediente && negacion  && recetas && !number && !descripcion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las recetas que no tienen un tipo de ingrediente ##");
			conexionRestAPI(rutaBaseConexionApi+tipoIngrediente+'/negacion/recetas');
		}

		//Recetas no tienen ingrediente limitando cantiad
		if (tipoIngrediente && negacion  && recetas && number && !descripcion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas que no tienen un tipo de ingrediente limitando la cantidad ##");
			conexionRestAPI(rutaBaseConexionApi+'ingredinteLimitadoReceta/'+tipoIngrediente+'/negacion/recetas/'+number);
    	}

		//Descripcion recetas
		if (descripcion && !tipoIngrediente && !tiempoMin && !categoria && !pasosRealizar && !ingredientes && recetas && !tipoCategorias && !tiempoRealizar || descripcion && !tipoIngrediente && !tiempoMin && !categoria && !pasosRealizar && !ingredientes && !recetas && !tipoCategorias && !tiempoRealizar) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripción de cada receta ##");
			conexionRestAPI(rutaBaseConexionApi+'descripciones');
        }

		//Descripcion receta especifica
		if(descripcion && recetas && nombreReceta && !categoria && !pasosRealizar && !negacion && !afirmacion || descripcion && !recetas && nombreReceta && !categoria && !pasosRealizar && !negacion && !afirmacion){
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripcion de una receta específica ##");
			conexionRestAPI(rutaBaseConexionApi+'descripcionRecetaEspecifica/'+nombreReceta+'');
		}

		//Descripcion recetas con ingrediente
		if (descripcion && recetas && afirmacion && tipoIngrediente && !negacion && !number) {
		console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripción de las recetas que contienen un tipo de ingrediente ##");
			conexionRestAPI(rutaBaseConexionApi+'descripcionesConIngredientes/'+tipoIngrediente+'');
    	}

		//Descripcion recetas con ingrediente limitando cantidad
		if (descripcion && recetas && tipoIngrediente && !negacion && number) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripcion de las recetas que contienen un ingrediente pero limitando la cantidad ##");
	        	conexionRestAPI(rutaBaseConexionApi+'descripcionesConIngredientesAlgunos/'+tipoIngrediente+'/'+number+'');
    	}

		//Descripcion recetas sin ingrediente
    	if (descripcion && recetas && tipoIngrediente && negacion && !number) {
		console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripcion de las recetas que no contienen un ingrediente ##");
		conexionRestAPI(rutaBaseConexionApi+'descripcionesSinIngredientes/'+tipoIngrediente+'');
    	}

		//Descripcion recetas sin ingrediente limitando cantidad
        if (descripcion && recetas && tipoIngrediente && negacion && number) {
		console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar descripcion de las recetas que no tienen un ingrediente pero limitando la cantidad ##");
             	conexionRestAPI(rutaBaseConexionApi+'descripcionesSinIngredientesAlgunos/'+tipoIngrediente+'/'+number+'');
        }

		//Descripcion recetas cantidad limitada
        if (descripcion && recetas && !tipoIngrediente && !negacion && number && !categoria && !tipoCategorias || descripcion && !recetas && !tipoIngrediente && !negacion && number && !categoria && !tipoCategorias) {
		console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripcion de las recettas pero limitando la cantidad ##");
		conexionRestAPI(rutaBaseConexionApi+'getDescripcion/Limitadas/'+number+'');
        }

		//Descripcion recetas<--->categoria
		if(descripcion && tipoCategorias && !recetas && !ingredientes || descripcion && tipoCategorias && recetas && !ingredientes) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar la descripcion de las recetas pero de una categoría espcífica ##");
			conexionRestAPI(rutaBaseConexionApi+'getDescripcionPorCategoria/Especifica/'+tipoCategorias+'');
		}

		//Recetas más de X
		if(!descripcion && recetas && tiempoMin && !menorDe && mayorDe) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las recetas que tadan más de X tiempo ##");
			conexionRestAPI(rutaBaseConexionApi+'elaboracionRecetaMayorDe/'+tiempoMin+'');
		}

		//Recetas<--->categoria
		if (recetas && tipoCategorias && !categoria && !descripcion && !afirmacion && !number && !tipoIngrediente || tipoCategorias && !recetas && !categoria && !descripcion && !afirmacion && !number && !tipoIngrediente) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrando recetas de una categoria especifica ##");
			conexionRestAPI(rutaBaseConexionApi+'recetasPorTipoCategoria/'+tipoCategorias+'');;
		}

		//Recetas tiempo
		if(recetas && tiempoRealizar && !descripcion && !categoria && !pasosRealizar && !ingredientes || !recetas && tiempoRealizar && !descripcion && !categoria && !pasosRealizar && !ingredientes) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las recetas y su tiempo de elaboración ##");
			conexionRestAPI(rutaBaseConexionApi+'getRecetasTiempoElaboracion');
		}

		//Categorias
		if(!recetas && !afirmacion && !descripcion && !tiempoMin && !tipoCategorias && !ingredientes && !nombreReceta && !negacion && !tiempoRealizar && categoria) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las categorias ##");
			conexionRestAPI(rutaBaseConexionApi+'categoriasRecetas');
		}

		//Categorias asociadas a sus recetas
        if(categoria && recetas && !afirmacion && !descripcion && !tiempoMin && !tipoCategorias && !ingredientes && !nombreReceta && !negacion && !tiempoRealizar) {
                console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las categorias de cada receta ##");
                conexionRestAPI(rutaBaseConexionApi+'categorias/asociadasACadaRecetas');
        }


		//Recetas menos X
		if(recetas && tiempoMin && menorDe && !descripcion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar las recetas que tardan menos de X tiempo en elaborarse ##");
			conexionRestAPI(rutaBaseConexionApi+'/elaboracionRecetaMenorDe/'+tiempoMin+'');
		}

		//Recetas<--->categoria sin ingrediente
		if(tipoIngrediente && negacion && tipoCategorias && !descripcion && !recetas) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas pertenecientes a una categoria específica sin un tipo de ingrediente ##");
			conexionRestAPI(rutaBaseConexionApi+'categoriasEspecificasSinIngrediente/'+tipoIngrediente+'/'+tipoCategorias+'');
		}

		//Receta<--->categoria con ingrediente
		if(tipoIngrediente && !negacion && tipoCategorias && !descripcion && !recetas && !number && afirmacion) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas de una categoria específica que tiene un tipo de ingrediente ##");
            conexionRestAPI(rutaBaseConexionApi+'categoriasEspecificasConIngrediente/'+tipoIngrediente+'/'+tipoCategorias+'');
       }

		//Receta<--->categoria con ingrediente limitando cantidad
        if(tipoIngrediente && !negacion && tipoCategorias && !descripcion && !recetas && number) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas de una categoria específica con un tipo de ingrediente pero limitando la cantidad ##");
            conexionRestAPI(rutaBaseConexionApi+'getCategoriaEspecificaConIngredienteLimitadaCantidadRecetas/'+tipoIngrediente+'/'+tipoCategorias+'/'+number+''); 
    	}

		//Receta<--->categoria sin ingrediente limitando cantidad
        if(tipoIngrediente && negacion && tipoCategorias && !descripcion && !recetas && number) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas de una categoria específica sin un tipo de ingrediente pero limitando la cantidad ##");
            conexionRestAPI(rutaBaseConexionApi+'getCategoriaEspecificaSinIngredienteLimitadaCantidadRecetas/'+tipoIngrediente+'/'+tipoCategorias+'/'+number+''); 
        }

		//Receta<--->categoria menor X
		 if(!tipoIngrediente && !negacion && tipoCategorias && !descripcion && !recetas && tiempoMin && menorDe)  {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas de una categoria que tarden menos de X ##");
            conexionRestAPI(rutaBaseConexionApi+'getCategoriaEspecificaEnFuncionTiempoMenorX/'+tipoCategorias+'/'+tiempoMin+''); 
        }

        //Receta<--->categoria mayor X
     	if(!tipoIngrediente && !negacion && tipoCategorias && !descripcion && !recetas && tiempoMin && !menorDe && mayorDe)  {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar receas de una categoria que tardan más de X ##");
            conexionRestAPI(rutaBaseConexionApi+'getCategoriaEspecificaEnFuncionTiempoMayorX/'+tipoCategorias+'/'+tiempoMin+''); 
        }

		//Tiempo categoria<--->recetas
		if(!tipoIngrediente && !negacion && tipoCategorias && !descripcion && !recetas && tiempoRealizar) {
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar recetas de una categoria y su tiempo ##");
			conexionRestAPI(rutaBaseConexionApi+'tiempoRealizarCategoriaEspecifica/'+tipoCategorias+'');
		}

		//Ingredientes<--->receta
		if (!tipoIngrediente && !negacion && !tipoCategorias && !descripcion && recetas && !tiempoRealizar && ingredientes && nombreReceta && !pasosRealizar || !tipoIngrediente && !negacion && !tipoCategorias && !descripcion && !recetas && !tiempoRealizar && ingredientes && nombreReceta && !pasosRealizar ){
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar los ingredientes de una receta ##");
			conexionRestAPI(rutaBaseConexionApi+'getMostrarIngredientesDeUnaReceta/'+nombreReceta+'');
		}

 	 	//Ingredientes todas recetas
        if (!tipoIngrediente && !negacion && !tipoCategorias && !descripcion && recetas && !tiempoRealizar && ingredientes && !nombreReceta && !pasosRealizar || !tipoIngrediente && !negacion && !tipoCategorias && !descripcion && !recetas && !tiempoRealizar && ingredientes && !nombreReceta && !pasosRealizar ){
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar los ingredientes de todas las recetas ##");
			conexionRestAPI(rutaBaseConexionApi+'getMostrarIngredientesRecetas/');
        }

        //Pasos<--->receta
        if (!tipoIngrediente && !negacion && !tipoCategorias && !descripcion && !recetas && !tiempoRealizar && !ingredientes && nombreReceta && pasosRealizar){
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar los pasos de todas las recetas ##");
			conexionRestAPI(rutaBaseConexionApi+'getMostrarPasosRecetaEspecifica/'+nombreReceta+'');
        }

		//Pasos todas recetas
		if(!tipoIngrediente && !negacion && !tipoCategorias && !descripcion && !tiempoRealizar && !ingredientes && !nombreReceta && pasosRealizar && recetas) {
			conexionRestAPI(rutaBaseConexionApi+'getMostrarPasosTodasRecetas');
		}

		//Todo<--->receta
	        if (!tipoIngrediente && !negacion && !tipoCategorias && !descripcion && !recetas  && !tiempoRealizar && !ingredientes && !pasosRealizar && nombreReceta || !tipoIngrediente && !negacion && !tipoCategorias && !descripcion && recetas  && !tiempoRealizar && !ingredientes && !pasosRealizar && nombreReceta){
			console.log('\x1b[36m%s\x1b[0m', "\n## Mostrar todo de una receta específica ##");
			conexionRestAPI(rutaBaseConexionApi+'getMostrarDatosCompletosReceta/'+nombreReceta+'');
	        }
		//Si el usuario pulsa boton preguntando qué hacer
		if(auxiliar && !negacion && !afirmacion && !menorDe && !mayorDe && !categoria && !tipoCategorias && !pasosRealizar && !tiempoMin && !number && !tiempoRealizar && !descripcion && !recetas && !ingredientes) {
			consultaFormatoDialogFlow={
							"fulfillmentMessages": [
							{
								"card": {
									"title":"\nPuedes preguntarme por...",
									"imageUri":'https://media.tenor.com/images/55d076a1e81f84d48b3ee5b53bc0a918/tenor.gif',
									"subtitle":"Las recetas, cantidad de recetas, categorías, ingredientes, descripciones, pasos a realizar, tiempo de elaboración entre otros\n\nA continuación te muestro algunos ejemplos:"
									},
								"platform":"TELEGRAM"
							},
						  	{
 								 "card": {
                                    "title":"\n	------>Categorías:",
									"buttons": [
												{"text":"Dime las categorías"},
												{"text":"Muéstrame los postres"}
										]
                                },
                                "platform":"TELEGRAM"
							},
							{
								"card": {
                             			"title":"\n	------>Descripciones:",
                                        "buttons": [
                                                    {"text":"Dime las descripciones"},
													{"text":"Descripciones de recetas sin sal"}
                                    	]
                                },
                                "platform":"TELEGRAM"
                            },
							{
	                            "card": {
	                                    "title":"\n ------>Tipos de ingredientes:",
	                                    "buttons": [
                                                    {"text":"Recetas que tengan sal"},
                                                    {"text":"Postres que tengan quinoa"}
	                                            ]
	                                    },
	                            "platform":"TELEGRAM"
                            },
							{
                                "card": {
                                        "title":"\n     ------>Recetas:",
                                        "buttons": [
                                                    {"text":"Dime todas las recetas"},
                                                    {"text":"Muéstrame 5 recetas"}
										]
	                                    },
	                            "platform":"TELEGRAM"
                            },
							{
	                            "card": {
	                                    "title":"\n     ------>Tiempo de elaboración:",
	                                    "buttons": [
	                                                {"text":"Dime las recetas que tardan más de 1 hora y 10 minutos"}
											]
	                                    },
	                            "platform":"TELEGRAM"
	                    	},
						]};
		}

		//Enviar respuesta a DialogFlow
		res.end(JSON.stringify(consultaFormatoDialogFlow));
	});


//Esta función maneja la respuesta por parte la API RESTful que ha consultado previamente con el servidor fuseki
//Dependiendo de los campos que contenga accederá a un peldaño u otro y determinará la forma que tendrá la respuesta

	function controladorPeticiones(err, response, body) {
		//En caso de que ocurra algún error
		if(err) {
			console.log('error: ', err);
		//En caso de que no ocurra ningún fallo, parseará el json y ajustará la respuesta para retornarla
		} else {
			var consulta = JSON.parse(body)
			var count = Object.keys(consulta.results.bindings).length;
			var consultaFormatoJson = [];
			for (contadorLongitudConsultaJson=0; contadorLongitudConsultaJson<count; contadorLongitudConsultaJson++) {
				if(consulta.results.bindings[contadorLongitudConsultaJson].nombreReceta !== undefined) {
					var nombreReceta = consulta.results.bindings[contadorLongitudConsultaJson].nombreReceta.value ;
				}
				if (consulta.results.bindings[contadorLongitudConsultaJson].imagen !== undefined) {
					var imagenReceta = consulta.results.bindings[contadorLongitudConsultaJson].imagen.value ;
				}
				//Si tiempoTotal está definino
				if (consulta.results.bindings[contadorLongitudConsultaJson].tiempoTotal !== undefined) {
					var tiempoTotal = consulta.results.bindings[contadorLongitudConsultaJson].tiempoTotal.value ;
					//Si descripcion está definido
					if (consulta.results.bindings[contadorLongitudConsultaJson].descripcion !== undefined) {
						var descripcionReceta = consulta.results.bindings[contadorLongitudConsultaJson].descripcion.value ;
						//Si categoriaReceta está definido
						if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta !== undefined) {
							var categoriaReceta = consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta.value ;
							//Si pasosRealizar está definido
							if(consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar !== undefined) {
								//Si pasosRealizar no está definido
								if(consulta.results.bindings[contadorLongitudConsultaJson+1].pasosRealizar == null) { 
                        	        consultaFormatoJson.unshift({"card":{ "title": "Pasos a realizar: ",},"platform":"TELEGRAM"},);
                                }
								var pasosRealizar = consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar.value ;
								consultaFormatoJson.push(
	                	                                        {
                                	                        	"text": {
                                        	        	                "text": [
                                        		                                '------->'+pasosRealizar
                                	                	                        ]
                        	                                	        },
	                	                                        "platform":"TELEGRAM"
        		                                                },
	        	                                        );
							}
							//Si pasosRealizar no está definido
							if(consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar == null) {
								if(consulta.results.bindings[contadorLongitudConsultaJson-1].pasosRealizar !== undefined) {	
									consultaFormatoJson.push({"card":{ "title": "Ingredientes: ",},"platform":"TELEGRAM"},);
									consultaFormatoJson.splice(0,0,{"card":{ "title": nombreReceta,"subtitle":"\nTiempo de elaboracion: "+tiempoTotal+"\nCategoria: "+categoriaReceta+"\n\n"+"Descripcion: "+"\n"+descripcionReceta ,"imageUri":imagenReceta,},"platform":"TELEGRAM"},);
								}
            	                var ingredientes = consulta.results.bindings[contadorLongitudConsultaJson].ingredientes.value ;
								consultaFormatoJson.push(
                	                                	        {
                        	                                	"text": {
	                                	                                "text": [
        	                                	                                '-------->'+ingredientes
                	                                	                        ]
                        	                                	        },
                                	                                "platform":"TELEGRAM"
	                                	                        },
        	                                	        );
	                                                }
						}
						//Si categoriaReceta no está definido
						if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta == null) {
							consultaFormatoJson.push(
                                        	                {
                                                	        "card": {
                                                        	        "title": nombreReceta+' en '+tiempoTotal +' minutos',
                                                                	"imageUri": imagenReceta,
	                                                                "subtitle": descripcionReceta,
															},
                	                                        "platform":"TELEGRAM",
                        	                                },
                                	                );
						}
					}
					//Si descripcion no está definido
					if  (consulta.results.bindings[contadorLongitudConsultaJson].descripcion == undefined) {
    	                //Si categoriaReceta está definido
            	        if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta !== undefined) {
                    	}
                        //Si categoriaReceta no está definido
                        if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta == null) {
                                consultaFormatoJson.push(
    	                                {
            	                        "card": {
                    	                        "title": nombreReceta,
                            	                "imageUri": imagenReceta,
                                    	        "subtitle": 'tiempo de elaboracion: '+tiempoTotal+" minutos",
                                            	},
                                        "platform":"TELEGRAM",
                                        },
                                );
    	                }
            	}
				}
				//Si no está definido tiempoTotal
				if (consulta.results.bindings[contadorLongitudConsultaJson].tiempoTotal == undefined) {
        	        //Si descripcion está definido
                	if (consulta.results.bindings[contadorLongitudConsultaJson].descripcion !== undefined) {
						var descripcionReceta = consulta.results.bindings[contadorLongitudConsultaJson].descripcion.value;
                        //Si categoriaReceta está definido
                        if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta !== undefined) {
                                var categoriaReceta = consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta.value; 
								consultaFormatoJson.push(
                	                                        {
                        	                                "card": {
                                	                                "title": nombreReceta+' pertenece a la categoria de '+categoriaReceta,
                                        	                        "imageUrl":imagenReceta,
                                                        	        "subtitle": descripcionReceta,
	                                                                },
        	                                                "platform":"TELEGRAM",
                	                                        },
                        	                        );
                                	        }
	                        //Si categoriaReceta no está definido
	                        if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta == null) {
	                                consultaFormatoJson.push(
	    	                                {
	            	                        "card": {
	                    	                        "title": nombreReceta,
	                            	                "imageUri":imagenReceta,
	                                    	        "subtitle": descripcionReceta,
	                                            	},
	                                        "platform":"TELEGRAM",
	                                        },
	                                );
	    	                }
	            	}
					//Si descripcion no está definido
                    if  (consulta.results.bindings[contadorLongitudConsultaJson].descripcion == null) {
                        //Si categoriaReceta está definido
						if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta !== undefined) {
                         	var categoriaReceta=consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta.value;
							consultaFormatoJson.push(
	                        	                        {
	                                	                "card": {
	                                        	                "title": "\n\n"+nombreReceta,
	                                                	        "imageUri": imagenReceta,
	                                                        	"subtitle": "Pertenece a la categoria de: "+categoriaReceta
	                                                            },
		                                               "platform":"TELEGRAM",
	        	                                        },
                        	                        );
                                	        }
	                    //Si categoriaReceta no está definido
	                    if (consulta.results.bindings[contadorLongitudConsultaJson].categoriaReceta == null) {
							//Si categoria está definido
							if(consulta.results.bindings[contadorLongitudConsultaJson].categoria !== undefined){
								var categoria = consulta.results.bindings[contadorLongitudConsultaJson].categoria.value;
								consultaFormatoJson.push(
									{
									"text": {
                                	        "text": [
														categoria
                                            		]
									        },
									"platform":"TELEGRAM"
									},
								);
							}
							//Si categoria no está definido
							if (consulta.results.bindings[contadorLongitudConsultaJson].categoria == undefined) {
								//Si ingredientes está definido
								if(consulta.results.bindings[contadorLongitudConsultaJson].ingredientes !== undefined){
									var nombreReceta = consulta.results.bindings[contadorLongitudConsultaJson].nombreReceta.value ;
									var ingredientes=consulta.results.bindings[contadorLongitudConsultaJson].ingredientes.value;
                        		        consultaFormatoJson.push(
                 							{
		           	                	      "text": {
                                        	        "text": [
    	                                        	        "----->"+ingredientes
                                                        	]
                                                    },
                                            "platform":"TELEGRAM"
                                        	},
	                                	);
									if( typeof consulta.results.bindings[contadorLongitudConsultaJson+1] === 'undefined' ){
										consultaFormatoJson.splice(0,0,{"card":{ "title": consulta.results.bindings[0].nombreReceta.value, imageUri: consulta.results.bindings[0].imagen.value,},"platform":"TELEGRAM"},);
									} else {
										if(consulta.results.bindings[contadorLongitudConsultaJson].nombreReceta.value != consulta.results.bindings[contadorLongitudConsultaJson+1].nombreReceta.value ){
                            	        	consultaFormatoJson.push({"card":{ "title": consulta.results.bindings[contadorLongitudConsultaJson+1].nombreReceta.value,"imageUri": consulta.results.bindings[contadorLongitudConsultaJson+1].imagen.value,},"platform":"TELEGRAM"},);
                                    	}
									}
								}
								//Si ingredientes no está definido
								if (consulta.results.bindings[contadorLongitudConsultaJson].ingredientes == null && consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar == null){
									 consultaFormatoJson.push(
                                        {
    	                                "card": {
                	                	        "title": nombreReceta,
                        		                "imageUri": imagenReceta,
												"buttons": [
                                                            {"text":"+info",
												 			"postback":nombreReceta},
                                                        	]
        		                	                },
    	                	               "platform":"TELEGRAM",
                                        },
                                    );
                                }
							}
							//Si está definido pasosRealizar
							if(consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar !== undefined) {
								var pasosRealizar=consulta.results.bindings[contadorLongitudConsultaJson].pasosRealizar.value;
									consultaFormatoJson.push(
            	                                                {
                    	                                      "text": {
                            	                                        "text": [
                                    	                                        "----->"+pasosRealizar
                                            	                                ]
                                                    	                },
                                                                "platform":"TELEGRAM"
                                                                },
        	                                                );
                            		if( typeof consulta.results.bindings[contadorLongitudConsultaJson+1] === 'undefined' ){
                                     	consultaFormatoJson.splice(0,0,{"card":{ "title": consulta.results.bindings[0].nombreReceta.value, imageUri: consulta.results.bindings[0].imagen.value,},"platform":"TELEGRAM"},);
								 	} else {
										if(consulta.results.bindings[contadorLongitudConsultaJson].nombreReceta.value != consulta.results.bindings[contadorLongitudConsultaJson+1].nombreReceta.value ){
											consultaFormatoJson.push({"card":{ "title": consulta.results.bindings[contadorLongitudConsultaJson+1].nombreReceta.value,"imageUri": consulta.results.bindings[contadorLongitudConsultaJson+1].imagen.value,},"platform":"TELEGRAM"},);
                            	        }
                                    }
							}
						}
        	        }
				}
			}
			//En caso de que la consulta realizada contenga informacion, la retornará
			if(typeof consultaFormatoJson !== 'undefined' && consultaFormatoJson.length >0){
				consultaFormatoDialogFlow={"fulfillmentMessages":consultaFormatoJson};
			//Por el otro lado si no retornea nada o está vacio, mostrará un mensaje de error
			} else {
				consultaFormatoDialogFlow={"fulfillmentText":"No se ha encontrado nada relacionado por favor, repitalo con otros parámetros"};
			}
		}
	};

//Envía la url, realiza una peticion http y retorna el valor recibido a la función controladorPeticiones

	function conexionRestAPI(urlModificada) {
		consultaFormatoDialogFlow = undefined;
		var req = request(urlModificada, controladorPeticiones)
		while(consultaFormatoDialogFlow === undefined) {
	                require('deasync').runLoopOnce();
		}
		return consultaFormatoDialogFlow;
	}
	app.listen(3000);
