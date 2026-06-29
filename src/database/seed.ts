import { DatabaseConnection } from "./connection.js";

DatabaseConnection.initialize();
DatabaseConnection.close();

console.log("Database initialized successfully.");
