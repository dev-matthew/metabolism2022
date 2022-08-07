require("dotenv").config();

const { SlashCommandBuilder, Routes, ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { TOKEN, CLIENT_ID } = process.env;

const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("Verify the bot is online"),
    new SlashCommandBuilder().setName("memories").setDescription("View past chat captures")
        .addStringOption(option => option.setName("address").setDescription("Polygon address to query").setRequired(true)),
    new ContextMenuCommandBuilder().setName("Capture as NFT").setType(ApplicationCommandType.Message)
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    .then(() => console.log("Successfully registered application commands"))
    .catch(console.error);