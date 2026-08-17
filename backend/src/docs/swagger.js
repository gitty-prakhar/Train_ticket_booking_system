export const swaggerDocument={
    //im describing my API using OpenAPI specification version 3.0.0
    //OpenAPI is a standard format for describing APIs
    openapi:"3.0.0",

    //this contains metadata about your API
    info:{
        title:"Train Booking System API",
        version:"1.0.0",
        description:"Production-grade IRCTC-like backend API",
        contact:{name:"Prakhar"},
    },
    servers:[
        {url:"http://localhost:8000",description:"Local Dev Server"},
    ],
    //this is basically categorization/grouping for your API endpoints
    tags:[
        {name:"Auth", description:"User registration and login"},
        {name:"Stations",description:"Station management"},
        {name:"Trains",description:"Train management"},
        {name:"Schedules",description:"Schedule management"},
        {name:"Search",description:"Search trains"},
        {name:"Seats",description:"Seat lock and release"},
        {name:"Bookings",description:"Book and cancel tickets"},
        {name:"Payments",description:"Payment processing"},
        {name:"Admin",description:"Admin dashboard"},
    ],
    paths:{}, //We'll leave the paths empty for now as adding every single route will make this file huge. This is the perfect stub.
};
