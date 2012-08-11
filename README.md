# Heyo!

Ok this project is built on base12 - that's the framework I'm using and a fair amount of the code is boilerplate: https://github.com/skookum/base12
Check it out for a very quick overview of what lives where - it's reminiscent of RoR so project structure shouldn't look
too weird.

For the purposes of "what matters", you'll want to look at the following files:

```shell
/app/models/                    --the comic and user models (defined for mongodb using mongoose ODM)
/app/lib/routes.js              --defines the app routes
/app/controllers/api.js         --definites the functions referenced by routes, where the actual work happens
/app/lib/dal.js                 --just inits the db connection
/app/lib/middleware.js          --defines the application middleware stack - sort of the way node servers work, not sure how much sense it will make
/app/lib/params.js              --defines an app param to automatically load data based on routing params
```