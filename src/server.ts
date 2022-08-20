// import express from 'express';
import express, { Request, Response } from 'express';

import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import * as fs from 'fs';
import {default as axios } from 'axios';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  const handler = async function ( req: Request, res: Response) {
    let { image_url } = req.query;
    const istrusted = await urlTrust(image_url);
    if (istrusted) {
      let filteredpath = await filterImageFromURL(image_url);
      res.on('close',cleaner)
      res.status(200)
        .sendFile(filteredpath);
    } else {
      return res.status(400)
                .send(`Please provide a valid url`);
    }
  };
  
  async function urlTrust(image_url: string) {
    return await axios.head(image_url)
                      .then((res : any) => {
                        return res.status == 200
                      })
                      .catch((e:any) => {
                        return false
                      });
  }
  
  const cleaner =  function ()  {
    const folder = __dirname + "/util/tmp/";
    let filesToclean = new Array();
    
    fs.readdirSync(folder).forEach(file => {
      filesToclean.push(folder + file);
    });
    deleteLocalFiles(filesToclean);    
  };

  app.get( "/filteredimage/",handler );



  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();