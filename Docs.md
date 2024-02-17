# Rebuilding the ACM Website using MERN stack

To keep the server awake, use cron job

`Forms will only be displayed if `

The code for cloudinary only supports Images Upload for now

`These docs cover all the RestAPI routes built using Express,MongoDB and a whole lot of dependencies`

*All the files are treated as ModuleJS{require won't work, instead use `import`}*
*Must always declare variable with `var`, `let`, `const`. Otherwise the varible wont be declare. Eg: `x = 10` will give error*

Info about files && folders

FILES
`index.js` -> the express app is created in this fiel and then is exported to `server.js`
`server.js` - > imports the app from `index.js` and it get the port and also contains connections to cloudinary{Image storing, If needed} and server will only run if the connection to MongoDB is successfully

DEPENDENCIES
`morgan` -> to record the request on console
`dotenv` -> to get credentials from ".env
    ...view `package.json` for the whole list



