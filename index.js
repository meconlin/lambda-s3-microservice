var config = require('./config.js')
var AWS = require('aws-sdk');
var config = require('./config')
var HttpStatus = require('http-status-codes');
var csv = require('csv-streamify');

AWS.config.update({region: config.region, accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey});
var s3 = new AWS.S3();
var Transform = require('stream').Transform;

Array.prototype.contains = function (v) {
    return this.indexOf(v) > -1;
};

var messageNotFound = function(key) {
    return HttpStatus.getStatusText(HttpStatus.NOT_FOUND) + " : " + key;
};

var messageServerError = function(err) {
    return HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) + " : " + err;
};

var _run = function(event, context) {
  console.log("starting : ", event);
  try {
    var parser = new Transform({objectMode: true});
    var csvToJson = csv({objectMode: true});
    var globalArr = [];
    var search = event.search || "default";
    var whereIndex = config.fileLayout.whereIndex;
    var selectIndex = config.fileLayout.selectIndex;
    search = search.toLowerCase();
    // transform S3 stream
    //
    parser._transform = function(data, encoding, done) {
      if (data[whereIndex].toLowerCase() === search) {
        var code = data[selectIndex];
        if (!globalArr.contains(code)) {
          globalArr.push(code);
        };
      }
      done();
    };

    var params = {
      Bucket: config.s3_bucket,
      Key: config.s3_key
    };

    console.log("s3 get obj : ", params);
    s3.getObject(params).createReadStream()
      .pipe(csvToJson)
      .pipe(parser)
      .on('finish', function() {
                      console.log("finish called : "  + globalArr.length);
                      if(globalArr.length > 0 ) {
                        context.succeed( globalArr )
                      } else {
                        context.fail(messageNotFound(make));
                      }
                    });
  }catch(e){
    console.error("Error : ", e);
    context.fail(messageServerError(e));
  }
};

exports.handler = function(event, context) {
  _run(event, context);
};

// eg. $>node index.js test create
//     will run an integration test locally
var first_value = process.argv[2];
if ("test" === first_value) {
  _run( config.test.fake_event, config.test.fake_context );
}
