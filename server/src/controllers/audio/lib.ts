import AudioS from "../../schema/schemaAudio.js";
import cloudinary from "cloudinary";

const recordSampleRate = 44100;

// we do not call functions set_audio and get_audio from front (hidden in RecordAudio.js)
function set_audio(req: any, res: any) {
  if (!req.body) {
    res.status(400).json({
      text: "Requête invalide",
    });
  } else {
    let audio = req.body;
    console.log(req.body, req.files);

    const values = Object.values(req.files);
    // @ts-ignore
    const originalFilename = values[0] ? values[0].originalFilename : null;
    const promises = values.map((image) =>
      // @ts-ignore
      cloudinary.uploader.upload(image.path, "", {
        folder: "/audio",
        resource_type: "video",
      })
    );

    Promise.all(promises)
      .then((results) => {
        let data = results[0];
        if (data) {
          let audio = {
            resource_type: data.resource_type,
            bytes: data.bytes,
            type: data.type,
            etag: data.etag,
            original_filename: originalFilename,
            public_id: data.public_id,
            secure_url: data.secure_url,
            signature: data.signature,
            url: data.url,
            version: data.version,
          };
          var _u = new AudioS(audio);
          // @ts-ignore
          _u.save((err, data) => {
            if (err) {
              res.status(500).json({
                text: "Erreur interne",
                error: err,
              });
            } else {
              res.status(200).json({
                text: "Succès",
                data: {
                  audioId: data._id,
                  public_id: data.public_id,
                  secure_url: data.secure_url,
                },
              });
            }
          });
        } else {
          res.status(401).json({
            text: "Pas de résultats à l'enregistrement",
          });
        }
      })
      .catch((e) => console.log(e));

    // var _u = new Audio(audio);

    // _u.save( (err, data) => {
    //   if (err) {
    //     res.status(500).json({
    //       "text": "Erreur interne",
    //       "error": err
    //     })
    //   } else {
    //     res.status(200).json({
    //       "text": "Succès",
    //       "data": data
    //     })
    //   }
    // })
  }
}

// @ts-ignore
function get_audio(req, res) {
  console.log("get_audio");
  // @ts-ignore
  var query = req.body;
  var find = new Promise(function (resolve, reject) {
    // @ts-ignore
    Audio.find(query).exec(function (err, result) {
      if (err) {
        reject(500);
      } else {
        if (result) {
          resolve(result);
        } else {
          reject(204);
        }
      }
    });
  });

  find.then(
    function (result) {
      res.status(200).json({
        text: "Succès",
        data: result,
      });
    },
    function (error) {
      switch (error) {
        case 500:
          res.status(500).json({
            text: "Erreur interne",
          });
          break;
        case 204:
          res.status(404).json({
            text: "Erreur sur le résultat",
          });
          break;
        default:
          res.status(500).json({
            text: "Erreur interne",
          });
      }
    }
  );
}

//On exporte notre fonction
exports.set_audio = set_audio;
exports.get_audio = get_audio;
