
import "../../environment.js"
import Brevo from "@getbrevo/brevo"

const API_key = process.env.Brevo_API_key
const key = process.env.Brevo_key

let defaultClient = Brevo.ApiClient.instance;

// Configure API key authorization: api-key
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = API_key;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//apiKey.apiKeyPrefix = 'Token';

// Configure API key authorization: partner-key
let partnerKey = defaultClient.authentications['partner-key'];
partnerKey.apiKey = API_key;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//partnerKey.apiKeyPrefix = 'Token';

let apiInstance = new Brevo.TransactionalEmailsApi();

let sendSmtpEmail = new Brevo.SendSmtpEmail({

     "sender":{ "email":"wpsadi@outlook.com", "name":"Brevo"},
     "subject":"This is my default subject line",
     "htmlContent":"<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>",
     "params":{
        "greeting":"This is the default greeting",
        "headline":"This is the default headline"
     },
   "messageVersions":[
     //Definition for Message Version 1 
     {
         "to":[
            {
               "email":"bob@example.com",
               "name":"Bob Anderson"
            },
            {
               "email":"anne@example.com",
               "name":"Anne Smith"
            }
         ],
         "htmlContent":"<!DOCTYPE html><html><body><h1>Modified header!</h1><p>This is still a paragraph</p></body></html>",
         "subject":"We are happy to be working with you"
      },
     
     // Definition for Message Version 2
      {
         "to":[
            {
               "email":"jim@example.com",
               "name":"Jim Stevens"
            },
            {
               "email":"mark@example.com",
               "name":"Mark Payton"
            },
            {
               "email":"andrea@example.com",
               "name":"Andrea Wallace"
            }
         ]
      }
   ]

}); // SendSmtpEmail | Values to send a transactional email

apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
  console.log('API called successfully. Returned data: ' + data);
}, function(error) {
  console.error(error);
});
