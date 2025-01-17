const Discord = require("discord.js");
const {
  MessageEmbed
} = require("discord.js");
const config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const {
  GetUser,
  GetGlobalUser,
  handlemsg
} = require(`../../handlers/functions`)
module.exports = {
  name: "avatar",
  aliases: ["av"],
  category: "🔰 Info",
  description: "Get the Avatar of an user",
  usage: "avatar [@USER] [global/guild]",
  type: "user",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    try {
      //"HELLO"
      var user;
      let customavatar = false;
      try {
        if (args[1] && args[1].toLowerCase() == "global") {
          args.pop()
          user = await GetGlobalUser(message, args)
        } else {
          user = await GetUser(message, args)
        }
      } catch (e) {
        return message.reply({content: String('```' + e.message ? String(e.message).substring(0, 1900) : String(e) + '```')})
      }
      try {
        let member = message.guild.members.cache.get(user.id);
        if (!member) await message.guild.members.fetch(user.id).catch(() => null) || false;
        if (member && member.avatar) {
          customavatar = member.displayAvatarURL({
            dynamic: true,
            size: 4096
          })
        }
      } catch (e) {
        console.log(String(e.stack).grey.bgRed)
      }
      let embed = new MessageEmbed()
        .setAuthor(handlemsg(client.la[ls].cmds.info.avatar.author, {
          usertag: user.tag
        }), user.displayAvatarURL({
          dynamic: true
        }), "http://discord.gg/7PdChsBGKd")
        .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
        .addField("<a:arrow:943027097348227073> PNG", `[\`LINK\`](${user.displayAvatarURL({format: "png"})})`, true)
        .addField("<a:arrow:943027097348227073> JPEG", `[\`LINK\`](${user.displayAvatarURL({format: "jpg"})})`, true)
        .addField("<a:arrow:943027097348227073> WEBP", `[\`LINK\`](${user.displayAvatarURL({format: "webp"})})`, true)
        .setURL(user.displayAvatarURL({
          dynamic: true
        }))
        .setFooter(client.getFooter(es))
        .setImage(user.displayAvatarURL({
          dynamic: true,
          size: 4096,
        }))
        if(customavatar)
        embed.setDescription(`**This User has a Custom Avatar too!**\n\n> [**\`Click here to get the LINK of it\`**](${customavatar})\n\n> **There is also:** \`${prefix}customavatar [@User]\``)
        message.reply({
          embeds: [embed]
        });
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["info"]["avatar"]["variable1"]))
      ]});
    }
  }
}

