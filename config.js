//  microservice lambda config
//

var config = {};
config = {
  accessKeyId: 'YOURACCESSID',
  secretAccessKey: 'YOURSECRET',
  region: 'us-east-1',
  s3_bucket: 'yourcompany.example.data',
  s3_key: '/keypart1/yourdata.csv',
  fileLayout: {
    whereIndex: 4,      // what column has indicator for row matching (think where clause)
    selectIndex: 2      // what column holds values we want to return (think select of a single column)
  }
}

// test objects for runing locally
//
config.test = {};
config.test.fake_context = {
                            done: function(err, value){ console.log('done : ',err, value);},
                            succeed: function( err, value ){ console.log('succeed', err, value)},
                            fail: function(err, value){ console.log('fail', err, value)}};

config.test.fake_event = { search: undefined };
module.exports = config;
