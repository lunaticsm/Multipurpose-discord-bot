const Discord = require("discord.js");
const moment = require("moment");
let os = require("os");
const config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
const ms = require("ms");
const { nFormatter, swap_pages, swap_pages2 } = require("../../handlers/functions");
const emoji = require(`../../botconfig/emojis.json`);
const { duration, handlemsg } = require(`../../handlers/functions`);
module.exports = {
    name: "botinfo",
    aliases: ["info", "about", "stats", "shards", "shard", "shardinfo", "cluster", "clusters", "clusterinfo"],
    category: "🔰 Info",
    description: "Sends detailed info about the client",
    usage: "botinfo",
    type: "bot",
    run: async (client, message, args, cmduser, text, prefix, player, GuildSettings) => {
    let es = await client.settings.get(message.guild.id+ ".embed") 
    let ls = await client.settings.get(message.guild.id+ ".language")
    
    
    try{
        const oldDate = Date.now();
        let tempmsg = await message.reply({embeds: [new Discord.MessageEmbed().setColor(es.color)
          .setAuthor(client.getAuthor(client.la[ls].cmds.info.botinfo.loading, "https://cdn.discordapp.com/emojis/756773010123522058.gif", "http://discord.gg/7PdChsBGKd"))
        ]}).catch(console.error)
        let botPing = Math.round(Date.now() - oldDate) - client.ws.ping;
        if(botPing < 0) botPing *= -1;


        // Simple cache for broadCastEval
        const cacheDuration = 10 * 60_000;
        const CacheLeft = cacheDuration - (Date.now() - client.broadCastCache.get("botinfo_timestamp"));
        if(client.broadCastCache.has("botinfo") && CacheLeft > 0) {
          return swap_pages2(client, message, client.broadCastCache.get("botinfo"), tempmsg);
        }

          
        const promises = [
          client.cluster.fetchClientValues('cluster.id'),
          client.cluster.broadcastEval(c => c.cluster.ids.map(d => `#${d.id}`).join(", ")),
          client.cluster.fetchClientValues('guilds.cache.size'),
          client.cluster.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
          client.cluster.broadcastEval(c => (process.memoryUsage().heapUsed/1024/1024).toFixed(0)),
          client.cluster.broadcastEval(c => (process.memoryUsage().rss/1024/1024).toFixed(0)),
          client.cluster.fetchClientValues('ws.ping'),
          client.cluster.broadcastEval(async c => {let ping = await c.database.ping(); return ping}),
          client.cluster.fetchClientValues('manager.players.size'),
          client.cluster.fetchClientValues('uptime'),
        ];
          
        return Promise.all(promises)
          .then(([cluster, shards, guilds, members, ram, rssRam, ping, dbPing, players, uptime]) => {
              const totalGuilds = client.guilds.cache.size;
              const totalMembers = client.users.cache.size;
              const connectedchannelsamount = players.reduce((acc, playerAmount) => acc + playerAmount, 0);
              const embeds = [];
              // For each shard data
              for(let index = 0; index<shards.length; index++) {
                const shardEmbed = new Discord.MessageEmbed()
                .setAuthor(client.getAuthor(client.user.tag + " Information", es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL(), `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)) 
                .setDescription(`\`\`\`yml\n${handlemsg(client.la[ls].cmds.info.botinfo.descriptionn, {name: `${client.user.tag}`, id: `${client.user.id}`, botPing: ` ${botPing}`, apiping: `${Math.round(client.ws.ping)}`, uptime: `${duration(client.uptime).join("︲")}`})}\`\`\``, true)
                .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
                .addField(emoji.msg.arrow+client.la[ls].cmds.info.botinfo.field1.title, `\`\`\`yml\n${handlemsg(client.la[ls].cmds.info.botinfo.field1.value, {guildsamm: `${nFormatter(totalGuilds, 2)}`, usersamm: `${nFormatter(totalMembers, 2)}`, connectedchannelsamount: `${connectedchannelsamount}`, clustersamm: `${client.cluster.count}`, shardsamm: `${client.cluster.info.TOTAL_SHARDS}`})}\`\`\``, true)
                .addField(emoji.msg.arrow+client.la[ls].cmds.info.botinfo.field2.title, `\`\`\`yml\nNode.js: ${process.version}\nDiscord.js: v${Discord.version}\nEnmap: v5.8.4\`\`\``, true)
                .addField(emoji.msg.arrow+client.la[ls].cmds.info.botinfo.field4.title, `\`\`\`yml\nName: Cepheid#0001\nID: [410419863304273930]\`\`\``, true)
                .setFooter(client.getFooter(es.footertext+ ` ︲ You're on Cluster #${client.cluster.id} and Shard #${message.guild.shard.id}`, es.footericon))
                .addField(
                  `${uptime[index] < 1000 || members[index] < 1 || guilds[index] < 1 ? `:x:` : `<:online:970050105338130433>`} Cluster #${cluster[index]}${cluster[index] == client.cluster.id ? ` | **Cluster of __this Guild__**` : ``}`, 
                  `\`\`\`yml\n Shards: ${shards[index]}\nServers: ${guilds[index]}\nMembers: ${client.users.cache.size}\n Memory: ${ram[index]}mb\n   Ping: ${ping[index]}ms\nDB-Ping: ${dbPing[index]}ms\nPlayers: ${players[index] ? players[index] : "'None'"}\n Uptime: ${duration(uptime[index]).map(d => d.split(" ")[1] ? d.split(" ")[0] + d.split(" ")[1].slice(0, 1).toLowerCase() : "0m").join("")}\n\`\`\``,
                  false
                )
                .setTimestamp()
                .addField(emoji.msg.arrow+client.la[ls].cmds.info.botinfo.field5.title, handlemsg(client.la[ls].cmds.info.botinfo.field5.value, {invitelink: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`}))
                
                embeds.push(shardEmbed)
              }
              client.broadCastCache.set("botinfo", embeds);
              client.broadCastCache.set("botinfo_timestamp", Date.now());
              swap_pages2(client, message, embeds, tempmsg);
          })
          .catch(e => {
            console.error(e)
            tempmsg.edit({embeds: [tempmsg.embeds[0]
              .setTitle("An error occurred!")
              .setDescription(`\`\`\`${String(e.message ? e.message : e).substring(0, 2000)}\`\`\``)
            ]}).catch(console.error)
          });          
    } catch (e) {
        console.log(String(e.stack).grey.bgRed)
        return message.reply({embeds: [new Discord.MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle(client.la[ls].common.erroroccur)
          .setDescription(eval(client.la[ls]["cmds"]["info"]["color"]["variable2"]))
        ]});
    }
  },
};

