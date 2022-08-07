# 0xScribe

**Click [here](https://discord.com/api/oauth2/authorize?client_id=1005333143672336395&permissions=137439463488&scope=bot) to add 0xScribe to your server**

0xScribe is a Discord tool that allows users to log messages as NFTs on Polygon. This allows users to prove that a message was sent, even after edits or deletions are made. This also provides a unique way of saving a moment in a community server as a collectible.

## About

As a Discord bot, 0xScribe can integrate with server chats and access data about different messages. A user is able to easily mint a message in chat as an NFT to an address of their choosing. This NFT contains an image of the message as well as other metadata including server ID, channel ID, message ID, time, and content. This allows the message to be verified, since it is now immutable on the blockchain. For example, if two users were to agree to something in a Discord chat, each user could now save their agreement and prove at a later point that the interaction happened.

Another use case of 0xScribe is to save moments in chat as collectibles that can be viewed later on. For example, a user could mint a funny message as an NFT and view their collection of moments by sending a command to the bot.

## Technology
### Sponsors
- Zora
  - Zora's API would be used in the future to easily view moments that were saved. These NFTs could be grouped by channel, sender, or owner. However, Zora's API does not currently support Polygon, which the NFTs are located on.
- Polygon
  - The snapshots of chat are minted as NFTs on Polygon mainnet via NFTPort.
- NFT.Storage (Web3.Storage)
  - Web3.Storage is used to store the picture format of the message, preventing it from being mutated.

### Other
- Discord.js (Provides access to server messages and commands)
- NFTPort (Minting of NFTs)
- Covalent (Viewing of past NFT memories in place of Zora)