const express = require('express')
const app = express()
const port = 3000
const {WebhookClient} = require('dialogflow-fulfillment');

//firebase
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Configura la credencial de Firebase
const serviceAccount = require('./pruebas-iot-a58f4-firebase-adminsdk-s9ed8-2515e59e8a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pruebas-iot-a58f4-default-rtdb.firebaseio.com'
});

app.use(bodyParser.json());

// Ruta de ejemplo que lee los datos de Firebase Realtime Database
app.get('/datos', (req, res) => {
  obtenerDatos('/value/dht11/hum').then((valor) => {
    res.send(`La humedad de ${valor} %`);
    // Cualquier otro código que dependa de la variable "valor" debe estar aquí
  }).catch((error) => {
    console.error(error);
  });
   
  
})

function obtenerDatos(url) {
 return new Promise((resolve, reject) => {
    const ref = admin.database().ref(url);
    ref.once('value', (snapshot) => {
      const data = snapshot.val();
      const valor = data.toString();
      resolve(valor);
    }, (error) => {
      reject(error);
    });
  });
}


app.post('/webhook',express.json(), function (req, res) {
 const agent = new WebhookClient({ request:req, response:res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`sdas`);
   
  }
  //funcion para el intent de df calidad del aire 
   function ProbandoWebhook(agent) {
    agent.add(`Hola perro glitch joto puto `);
  }
  

 //------------------------------------------------------------------------------ 
  

  function mensaje(ppm){
    let conclusion;
    //niveles optimos
    if(ppm<400)
      conclusion='El aire es fresco y de alta calidad, posee niveles optimos de dióxido de carbono, '+ppm+' partes por millón';
    //niveles normales
    if(ppm>400 && ppm<600)
      conclusion='El aire es de buena calidad, posee niveles normales de dióxido de carbono, '+ppm+' partes por millón';
    //niveles aceptables
    if(ppm>600 && ppm<1000)
      conclusion='El aire es de calidad moderada, posee niveles aceptables de dióxido de carbono, '+ppm+' partes por millón';
    //niveles elevados
    if(ppm>1000 && ppm<2000)
      conclusion='El aire es de calidad deficiente, posee niveles elevados de dióxido de carbono, '+ppm+' partes por millón'+ ', esto puede causar somnolencia y afectar la concentración.';
    if(ppm>2000)
      conclusion='El aire es de mala calidad, posee niveles muy elevados de dióxido de carbono, '+ppm+' partes por millón'+'  puede causar dolores de cabeza, fatiga y reducir significativamente la concentración. Recomendable ventilar el lugar.';
  return conclusion;
  }
  
  
  
  
   function CalidadAire(agent) {

     
 const ref = admin.database().ref('/value/ppm');
  return ref.once('value').then((snapshot) => {
    const data = snapshot.val();
    const valor = data.toString();
    let msj="";
    //obtener la categorización del aire
    msj = mensaje(data);
    agent.add(msj);   
  }).catch((error) => {
    console.error(error);
    agent.add(`No pude obtener la información de la calidad del aire. Intenta de nuevo más tarde.`);
  });  
     
   }

  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
   intentMap.set('Aire', CalidadAire);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

