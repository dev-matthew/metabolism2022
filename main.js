console.log("LOADING...");
require("dotenv").config();
const { TOKEN, WEB3_KEY, NFT_PORT_KEY, COVALENT_KEY } = process.env;

const fs = require("fs");
const axios = require("axios").default;
const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(TOKEN).catch(console.error);

const { Web3Storage, File, Blob } = require("web3.storage");
const Web3Client = new Web3Storage({ token: WEB3_KEY });

var waitingRequests = {};

client.on("ready", async function() {
    console.log("ONLINE");
});

async function createImage(guild, channel, message, interaction) {
    await interaction.reply({content: "Generating image..."});

    let channel_obj = client.channels.cache.get(channel);
    let message_obj = channel_obj.messages.cache.get(message);

    const { createdTimestamp, content, author } = message_obj;
    let authorID = author.id;
    const authorAvatar = `https://cdn.discordapp.com/avatars/${authorID}/${author.avatar}`;
    const d = new Date(createdTimestamp);
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="400"><clipPath id="clipCircle"><circle r="64" cx="104" cy="104"/></clipPath><rect width="1920" height="600" style="fill:rgba(54,57,63,1)"></rect><image x="40" y="40" href="${authorAvatar}" clip-path="url(#clipCircle)"></image><style>.name {font-size: 52px;fill: white;font-family: "Arial";}.text{font-size:52px;fill:rgba(255,255,255,0.7);font-family:"Arial";}.time{font-size:42px;fill:rgba(255,255,255,0.7);font-family:"Arial";}</style>`;
    svg += `<text x="210" y="90" class="name">${author.username.substring(0, Math.min(author.username.length + 1, 31))}</text>`;
    svg += `<text x="${Math.min(author.username.length, 30) * 45 + 210}" y="90" class="time">${d.toLocaleString("default", {month: "long"})} ${d.getDate()}, ${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}</text>`;
    svg += `<text x="210" y="170" class="text">${content}</text>`;
    svg += `<metadata>{timestamp: ${createdTimestamp}, user_id: ${authorID}, message_id: ${message}, channel_id: ${channel}, guild_id: ${guild}}</metadata>`;
    svg += "</svg>";

    console.log(svg);
    return {svg, content, authorID};
}

async function mintNFT(address, image, content, interaction, guild, channel, message, author) {
    await interaction.editReply("Uploading image to web3.storage...");

    let blob = new Blob([image], {type: "image/svg+xml"});
    let file = new File([blob], "nft.svg");
    console.log(file);
    const rootCid = await Web3Client.put([file]);
    let ipfs_url = `https://ipfs.io/ipfs/${rootCid}/nft.svg`;
    console.log(ipfs_url);

    await interaction.editReply("Minting NFT...");

    axios.post("https://api.nftport.xyz/v0/mints/easy/urls", {
        chain: "polygon",
        name: "0xScribe Message Log",
        description: `AuthorID: ${author}, MessageID: ${message}, ChannelID: ${channel}, GuildID: ${guild}, Content: ${content}`,
        file_url: ipfs_url,
        mint_to_address: address
    }, {
        headers: {
            "Authorization": NFT_PORT_KEY,
            "Content-Type": "application/json"
        }
    }).then(function(response) {
        interaction.editReply(`Minted [message](https://discord.com/channels/${guild}/${channel}/${message}) as an [NFT](https://polygonscan.com/tx/${response.data.transaction_hash}) to \`${address}\`!`);
    }).catch(function(error) {
        console.log(error);
    });
}

client.on("interactionCreate", async interaction => {

    if (interaction.type == InteractionType.ModalSubmit) {

        const address = interaction.fields.getTextInputValue("addressInput");
        const user = interaction.user.id;
        const { guild, channel, message} = waitingRequests[user];

        let {image, content, authorID} = await createImage(guild, channel, message, interaction);
        await mintNFT(address, image, content, interaction, guild, channel, message, authorID);

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
            case "memories":
                await interaction.deferReply();

                const address = interaction.options.getString("address");
                axios.get(`https://api.covalenthq.com/v1/137/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${COVALENT_KEY}`)
                .then(function(response) {

                    output = "";
                    let allItems = response.data.data.items;
                    for (let i = 0; i < allItems.length; i += 1) {
                        let nft = allItems[i];
                        if (nft.type === "nft" && nft.nft_data) {
                            for (let k = 0; k < nft.nft_data.length; k += 1) {
                                if (nft.nft_data[k].external_data && nft.nft_data[k].external_data.name && nft.nft_data[k].external_data.name == "0xScribe Message Log") {
                                    let description = nft.nft_data[k].external_data.description.replaceAll(", ", " ").split(" ");
                                    output += `[Message](https://discord.com/channels/${description[5]}/${description[3]}) from <@${description[1]}>: "${description.slice(9).join(" ")}"\n`;
                                }
                            }
                        }
                    }

                    interaction.editReply({content: output});

                }).catch(function(error) {
                    console.log(error);
                });
                break;
        }
    }
});