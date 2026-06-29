"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_js_1 = require("./connection.js");
connection_js_1.DatabaseConnection.initialize();
connection_js_1.DatabaseConnection.close();
console.log("Database initialized successfully.");
