const crypto = require('crypto');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { assertUserAuthenticated } = require('../../services/auth');

const File = require('../../models/file');

function getPath(_id, uploadPath, fileName) {
  const fileExtension = fileName ? path.extname(fileName) : '';
  return path.join(
    __dirname,
    '../uploads',
    uploadPath,
    ...(fileName ? [`${_id}${fileExtension ? fileExtension : ''}`] : [])
  );
}

async function uploadFile(file, uploadPath, result) {
  // Find a free Id for this file
  let _id, existingOne;

  do {
    _id = crypto.randomBytes(32).toString('hex');
    existingOne = await File.findById(_id);
  } while (existingOne);

  const uploadDir = getPath(_id, uploadPath);

  // upload dir exists ?
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  const path = getPath(_id, uploadPath, file.name);

  // Move the uploaded file
  await new Promise((resolve, reject) =>
    file.mv(path, function (err) {
      if (err) return reject(err);
      resolve();
    })
  );

  // Create the document
  const fileDoc = new File({
    _id,
    path,
    name: file.name,
    mimeType: file.mimetype,
    encoding: file.encoding,
    size: file.size,
  });

  await fileDoc.save();
  result.push(fileDoc);
}

module.exports = [
  {
    method: 'post',
    url: '/upload',
    handlers: [
      assertUserAuthenticated,
      async (req, res) => {
        const files = Object.keys(req.files).map((k) => req.files[k]);
        assert(files && files.length > 0, 'No file specified for upload.');

        const result = [];

        for (let file of files) await uploadFile(file, req.query.path.replace('../', ''), result);

        res.json({ result });
      },
    ],
  },
  {
    method: 'get',
    url: '/view/:id',
    handlers: [
      async (req, res, next) => {
        assert(req.params.id, 'Missing Id for file.');

        const file = await File.findById(req.params.id);

        if (file)
          fs.exists(file.path, function (exists) {
            if (exists) {
              res.download(
                file.path,
                file.name,
                {
                  headers: {
                    'Cache-Control': 'max-age=31536000',
                  },
                },
                (err) => {
                  if (err) next(err);
                }
              );
            } else res.sendStatus(404);
          });
        else res.sendStatus(404);
      },
    ],
  },
];
