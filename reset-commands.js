require("dotenv").config();

const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { TOKEN, CLIENT_ID } = process.env;

const rest = new REST({ version: "10" }).setToken(TOKEN);
rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
    .then(() => console.log("Successfully deleted all application commands"))
    .catch(console.error);