require("dotenv").config();

const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

var waitingRequests = {}

console.log("LOADING...");
const { TOKEN, NFT_STORAGE_KEY } = process.env;
client.login(TOKEN).catch(console.error);

client.on("ready", function() {
    console.log("ONLINE");
});

async function createImage(guild, channel, message) {

}

async function mintNFT(address, guild, channel, message, image, interaction) {
    
}

client.on("interactionCreate", async interaction => {
    console.log(interaction);

    if (interaction.type == InteractionType.ModalSubmit) {

        const address = interaction.fields.getTextInputValue("addressInput");
        const user = interaction.user.id;
        const { guild, channel, message} = waitingRequests[user];

        await interaction.reply({content: `Minting [message](https://discord.com/channels/${guild}/${channel}/${message}) as an NFT to \`${address}\`...`});
        let image = await createImage(guild, channel, message);
        await mintNFT(address, guild, channel, message, image, interaction);

    } else {

        const { commandName } = interaction;
        switch(commandName) {
            case "ping":
                await interaction.editReply("Online!");
                break;
            case "Capture as NFT":
                waitingRequests[interaction.user.id] = {
                    "guild": interaction.guildId,
                    "channel": interaction.channelId,
                    "message": interaction.targetId
                }

                const modal = new ModalBuilder().setCustomId("captureModal").setTitle("Mint message as an NFT");
                const addressInput = new TextInputBuilder().setCustomId("addressInput").setLabel("Polygon Address").setStyle(TextInputStyle.Short);
                const row = new ActionRowBuilder().addComponents(addressInput);
                modal.addComponents(row);

                await interaction.showModal(modal);
                break;
        }
        
    }
});

client.on("messageCreate", (message) => {
    //console.log(message);
});