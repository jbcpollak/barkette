var Flickr = require("flickrapi");

var data = fs.readFileSync('./config.json'), config;

try {
  config = JSON.parse(data);
  console.dir(config);
}
catch (err) {
  console.log('There has been an error parsing your JSON.')
  console.log(err);
}

Flickr.authenticate(config.flickr, function(error, flickr) {
  // we can now use "flickr" as our API object
  flickr.photos.search({
     tags: "dog clothing",
    page: 1,
    per_page: 500
  }, function(err, result) {
    // result is Flickr's response
    // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
    // s small square 75x75
    // q large square 150x150
    // t thumbnail, 100 on longest side
    // m small, 240 on longest side
    // n small, 320 on longest side
    // - medium, 500 on longest side
    // z medium 640, 640 on longest side
    // c medium 800, 800 on longest side†
    // b large, 1024 on longest side*
    // o original image, either a jpg, gif or png, depending on source format

    for (var key in result.photos.photo) {
      var photo = result.photos.photo[key];
      var id = photo.id;
      var farm = photo.farm;
      var server = photo.server;
      var secret = photo.secret;
      photoURL = "http://farm" + farm + ".staticflickr.com/" + server + "/" + id + "_" + secret + "_m.jpg",

      console.log(photoURL);
    };
  });
});