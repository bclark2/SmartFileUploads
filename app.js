var express    = require('express');
var app        = express();
var path       = require('path');
var formidable = require('formidable');
var watson     = require('watson-developer-cloud')
var fs         = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res) {

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));

  //Replace with your IBM Username and Password
  var visual_recognition = watson.visual_recognition({
	  username: 'IBM USERNAME',
	  password: 'IBM PASSWORD',
	  version: 'v2-beta',
	  version_date: '2015-12-02'
  });

  var requestType = req.get('Content-Type');

  //Supply the name of the posted file.
  var params = {
    images_file: fs.createReadStream('./uploads/' + file.name)
  };

  //IBM Watson image classification response 
  visual_recognition.classify(params, 
	  function(err, response) {
	     if (err)
	          console.log(err);
	       else
	      console.log(JSON.stringify(response, null, 2));
	  });
   
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
