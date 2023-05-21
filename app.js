const express = require("express");
const app = express();
const https = require("https");
const bodyParser = require("body-parser");
const request = require("request");
const Sequelize = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory:', {
//   // Choose one of the logging options
//   logging: console.log,                  // Default, displays the first parameter of the log function call
//   logging: (...msg) => console.log(msg), // Displays all log function call parameters
//   logging: false,                        // Disables logging
//   logging: msg => logger.debug(msg),     // Use custom logger (e.g. Winston or Bunyan), displays the first parameter
//   logging: logger.debug.bind(logger)     // Alternative way to use custom logger, displays all messages
// });
//
// // Option 1: Passing a connection URI
// const sequelize = new Sequelize('sqlite::memory:') // Example for sqlite
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // Example for postgres
//
// // Option 2: Passing parameters separately (sqlite)
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'path/to/database.sqlite'
// });
//
// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
// });
//
// try {
//   await sequelize.authenticate();
//   console.log('Connection has been established successfully.');
// } catch (error) {
//   console.error('Unable to connect to the database:', error);
// }

const sequelize = new Sequelize(
  'ecg',
  'root',
  'Chinu@123', {
    host: 'localhost',
    dialect: 'mysql'
  }
);

const User = sequelize.define(
  "User", {
    email: {
      type: Sequelize.DataTypes.STRING,
    },
    password: {
      type: Sequelize.DataTypes.STRING,
    },
    fullname: {
      type: Sequelize.DataTypes.STRING,
    },
    position: {
      type: Sequelize.DataTypes.STRING,
    },
    address: {
      type: Sequelize.DataTypes.STRING,
    },
    number: {
      type: Sequelize.DataTypes.STRING,
    },
  }
)

const Interactions = sequelize.define(
  "Interactions", {
    from: {
      type: Sequelize.DataTypes.STRING,
    },
    to: {
      type: Sequelize.DataTypes.STRING,
    },
    prob: {
      type: Sequelize.DataTypes.STRING,
    },
  }
)

const initDb = async () => {
  await sequelize.sync();
}

initDb()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", async function(req, res) {
  console.log("Ok");
  const email = req.body.email;
  const pass = req.body.pass;
  const cpass = req.body.cpass;
  const fullname = req.body.fullname;
  const position = req.body.position;
  const number = req.body.contact;
  const address = req.body.address;

  if (number == null) {
    const project = await User.findOne({
      where: {
        email: email,
        password: pass
      }
    });
    if (project == null) {
      res.sendFile(__dirname + "/failure.html");
    } else {
      if (project.dataValues.position == "doctor"){
        let proj=await Interactions.findOne({
          where: {
            to:project.dataValues.id,
          }
        });
        if(proj==null)
        res.render("doc_i",{docname:project.dataValues.fullname, docid:project.dataValues.id,patientid:"",patientname:"",probfaced:""});
        else{
          let prj=await User.findOne({
            where:{
              id:proj.dataValues.from,
            }
          })
        res.render("doc_i",{docname:project.dataValues.fullname, docid:project.dataValues.id,patientid:proj.dataValues.from,patientname:prj.dataValues.fullname,probfaced:proj.dataValues.prob});}}
      else
        res.render("pat_i",{patname:project.dataValues.fullname, patid:project.dataValues.id});
    }
  } else {
    console.log("Signup");
    console.log(number.length);
    if (pass === cpass && number.length == 10) {
      const project = await User.create({
        email: email,
        password: pass,
        fullname: fullname,
        position: position,
        number: number,
        address: address
      });
      if (position == "doctor"){
        let proj=await Interactions.findOne({
          where: {
            to:project.dataValues.id,
          }
        });
        if(proj==null)
        res.render("doc_i",{docname:project.dataValues.fullname, docid:project.dataValues.id,patientid:"",patientname:"",probfaced:""});
        else{
          let prj=await User.findOne({
            where:{
              id:proj.dataValues.from,
            }
          })
        res.render("doc_i",{docname:project.dataValues.fullname, docid:project.dataValues.id,patientid:proj.dataValues.from,patientname:prj.dataValues.fullname,probfaced:proj.dataValues.prob});}}
      else
        res.render("pat_i",{patname:project.dataValues.fullname, patid:project.dataValues.id});
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
  }
});

app.post("/failure", function(req, res) {
  res.redirect("/");
})


app.post("/doctor",async function(req,res){
  // const patid = req.body.patid;
  // const patname = req.body.patname;
  // const patmail = req.body.patmail;
  //
  // const proj = await User.findOne({
  //   where: {
  //     id: patid,
  //     email: patmail,
  //     fullname: patname,
  //     position: "patient",
  //   }
  // });
  // console.log(proj);
  // if (proj === null) {
  //   res.sendFile(__dirname+"/failure.html");
  // } else {
  //   res.sendFile(__dirname+"/success_doc.html");
  // }
  let docid=req.body.docid;
  let proj=await Interactions.findOne({
    where: {
      to:docid,
    }
  });
  if(proj==null)
  res.sendFile(__dirname+"/failure.html");
  else{
  await Interactions.destroy({
    where:{
      to:docid,
      from:proj.dataValues.from,
    }
  });
  res.sendFile(__dirname+"/success_doc.html");}
})


app.post("/patient",async function(req, res) {
  const patid=req.body.patid;
  const did = req.body.docid;
  const dname = req.body.docname;
  const dmail = req.body.docmail;

  const project = await User.findOne({
    where: {
      email: dmail,
      fullname: dname,
      position: "doctor",
    }
  });
  const proj=await User.findOne({
    where:{
      id:patid
    }
  })
    console.log(req.body.patname);
  console.log(project);
  if (project == null || proj==null) {
    res.sendFile(__dirname+"/failure.html");
  } else {
    const newInter = await Interactions.create({
      from:patid,
      to:did,
      prob:req.body.problemsfaced,
    });
    res.sendFile(__dirname+"/success_pat.html");
  }
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000.");
});
