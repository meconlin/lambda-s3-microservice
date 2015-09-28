### lambda-s3-microservice  

Example Lambda microservice for filtering and returning S3 CSV data.
Designed to be used with an API Gateway.

Make a read only serverless REST endpoint out of a file residing in S3. Useful for very slow changing data that a disperate system needs occasionally.
This is a demo verion of real Lambda I creaed at work to return valid 10 digit vins for any make, we use it to validate a VIN against target makes during ingest.

Returns unique values only.

#### Install  
```$>npm install```

#### Lambda Usage  
You may use this Lambda as is but it is desined to play nice with an API Gateway configured as a REST API in front of it.
It expects an event object with one param ```search``` on it.
It will return a filtered view of an S3 csv file for the search param. The column to compare it to is set in ```config.js```

Lambda Event Example:  
```
Lets pretend we had a dataset like so sitting in S3
make,model,trim,year,price
BMW,3 series,325,2015,42195
BMW,5 series,525,2015,62195
Ford,F150,Lariet,2016,23560
Ford,F150,Lariet,2016,23560
...and so on

event
{
  "search": "BMW"
}

response
[ "3 series",
  "5 series", ...
]
```

#### Lambda Exceptions and Errors  
The Lambda function will return errors with the following format, designed to be regex-able by AWS API Gateway to turn into a matching HttpStatus and formated response object. For example a search with no data will return a "Not Found" so that the API Gateway can map this to HttpStatus and HttpStatusCode NOT FOUND - 404.

```
{  "errorMessage": "<Http Status Text> : <Lambda error message>" }
eg.
{  "errorMessage": "Not Found : chicken" }
```

#### Response mapping
Using integration response methods you can map error messages and responses from the lambda to appropriate HttpStatus codes and messages.

##### Example (error response):

```
//response from lambda  
{  "errorMessage": "Not Found : no data found for search chicken" }

//regex rule in API Gateway response integration mapping  
Not Found.*

//mapper in API Gateway
{ "status" : "NOT FOUND", "errorMessage": "$input.path('errorMessage')", "statusCode":404 }

//response from API Gateway  
application/json  
404
{ "status" : "NOT FOUND",
  "errorMessage": "Not Found : no data found for search chicken",
  "statusCode":404
}  

```

#### Deployment
The ```deploy``` directory contains shell scripts to create and upload a Lambda function as well as set policy on it. AWS cli installation and properly configured aws credentials on a must for this shell to work.

No CLI exists for API gateway at this time.

You can experiement with it locally by calling ```$>node index.js test```

#### Reference
[AWS Lambda Documentation](https://aws.amazon.com/lambda/)  
[AWS API Gateway](https://aws.amazon.com/api-gateway/)
