const Service = require("node-windows").Service;

const svc = new Service({
  name: "GCC Control Tower Backend",
  description: "Backend API for GCC Control Tower (Node.js + Express)",
  script: "C:\\Users\\VishnuNair\\OneDrive - Summit Consulting Services Private Limited\\Delivery Vault\\Infinite Electronics\\Automation\\React_Db_NodeJS\\gcc-control-tower\\backend\\server.js",
  nodeOptions: [
    "--harmony"
  ]
});

// When service is installed
svc.on("install", () => {
  console.log("Service installed");
  svc.start();
});

// Optional logs
svc.on("alreadyinstalled", () => {
  console.log("Service already installed");
});

svc.on("start", () => {
  console.log("Service started");
});

svc.install();
