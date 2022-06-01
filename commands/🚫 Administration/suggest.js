const {
    MessageEmbed, Permissions
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const {
    delay, databasing, dbEnsure
} = require(`../../handlers/functions`);
module.exports = {
    name: `suggest`,
    aliases: [`suggestion`, "feedback"],
    category: `🚫 Administration`,
    description: `Approves, Denies or even Maybies a Suggestion from your SETUP!`,
    usage: `suggest <approve/deny/maybe/soon/duplicate> <Suggestion_id> [REASON]`,
    type: "server",
    run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
        
        try {
          let adminroles = GuildSettings?.adminroles || [];
          let cmdroles = GuildSettings?.cmdadminroles?.suggest || [];
          var cmdrole = []
            if(cmdroles.length > 0){
              for await (const r of cmdroles){
                if(message.guild.roles.cache.get(r)){
                  cmdrole.push(` | <@&${r}>`)
                }
                else if(message.guild.members.cache.get(r)){
                  cmdrole.push(` | <@${r}>`)
                }
                else {
                  const File = `suggest`;
                  let index = GuildSettings && GuildSettings.cmdadminroles && typeof GuildSettings.cmdadminroles == "object" ? GuildSettings.cmdadminroles[File]?.indexOf(r) || -1 : -1;
                  if(index > -1) {
                    GuildSettings.cmdadminroles[File].splice(index, 1);
                    client.settings.set(`${message.guild.id}.cmdadminroles`, GuildSettings.cmdadminroles)
                  }
                }
              }
            }
          if (([...message.member.roles.cache.values()] && !message.member.roles.cache.some(r => cmdroles.includes(r.id))) && !cmdroles.includes(message.author?.id) && ([...message.member.roles.cache.values()] && !message.member.roles.cache.some(r => adminroles.includes(r ? r.id : r))) && !Array(message.guild.ownerId, config.ownerid).includes(message.author?.id) && !message.member?.permissions?.has([Permissions.FLAGS.ADMINISTRATOR]))
            return message.reply({embeds :[new MessageEmbed()
              .setColor(es.wrongcolor)
              .setFooter(client.getFooter(es))
              .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable1"]))
              .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable2"]))
            ]});
            let reason = `No reason`;
            await dbEnsure(client.settings, message.guild.id, {
              suggest: {
                channel: "",
                approvemsg: `:white_check_mark: Accepted Idea! Expect this soon.`,
                denymsg: `:x: Thank you for the feedback, but we are not interested in this idea at this time.`,
                maybemsg: `💡 We are thinking about this idea!`,
                duplicatemsg: `💢 This is a duplicated Suggestion`,
                soonmsg: `👌 Expect this Feature Soon!`,
                statustext: `<a:Loading1:958415066972184636> Waiting for Community Feedback, please vote!`,
                footertext: `Want to suggest / Feedback something? Simply type in this channel!`,
                approveemoji: `833101995723194437`,
                denyemoji: `833101993668771842`,
              }
            });
            let suggestdata = await client.settings.get(message.guild.id + ".suggest");
            var approvetext = suggestdata.approvemsg;
            var denytext = suggestdata.denymsg;
            var maybetext = suggestdata.maybemsg;   
            var soonmsg = suggestdata.soonmsg;   
            var duplicatemsg = suggestdata.duplicatemsg;   
            var feedbackchannel = suggestdata.channel;
             
            if(!suggestdata.channel || suggestdata.channel.length < 5)
              return message.reply({embeds :[new MessageEmbed()
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                  .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable3"]))
                  .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable4"]))
              ]});
            if(!args[0]) 
                return message.reply({embeds :[new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable5"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable6"]))
                ]});
            //wenn kein grund
            if (!args[1]) 
                return message.reply({embeds :[new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable7"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable8"]))
                ]});
            
            if(args[1].length !== 18)
                return message.reply({embeds :[new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable9"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable10"]))
                ]});
            if(!args[2]) reason = `No reason`;
            else reason = args.slice(2).join(` `);
            //finde feedbackchannel
            const channel = message.guild.channels.cache.get(feedbackchannel)
            if (!channel) 
                return message.reply({embeds:[new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable11"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable12"]))
                ]});
            
            //finde die nachricht
            const targetMessage = await channel.messages.fetch(args[1])
            if (!targetMessage) 
                return message.reply({embeds :[new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable13"]))
                     ]}     );
            
            //altes embed
            const oldEmbed = targetMessage.embeds[0];
      
            if(!oldEmbed)    
                return message.reply({embeds : [new MessageEmbed()
                    .setColor(es.wrongcolor)
                    .setFooter(client.getFooter(es)).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable14"]))
                ]});
    
            //bekomme was er machen will
            let color;
            let statustext;
      
            switch(args[0]){
              case `approve`:
                color = `GREEN`;
                statustext = `${approvetext}`;
                await message.reply(
                 {embeds : [ new MessageEmbed()
                    .setColor(`GREEN`).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable15"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable16"]))
                 ]});
                break;
      
              case `deny`:
                color = `RED`;
                statustext = `${denytext}`;
                await message.reply(
                  {embeds :[new MessageEmbed()
                    .setColor(`RED`).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : `https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png`)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable17"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable18"]))
                  ]});
              break;
      
              case `maybe`:
                color = `ORANGE`;
                statustext = `${maybetext}`;
                await message.reply(
                  {embeds :[new MessageEmbed()
                    .setColor(es.color)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable19"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable20"]))
                  ]});
                break;

              case `soon`:
                color = `#FFFFF9`;
                statustext = `${soonmsg}`;
                await message.reply(
                  {embeds :[new MessageEmbed()
                    .setColor(es.color)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable21"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable22"]))
                  ]});
                break;
              
              case `duplicate`:
                color = `BLUE`;
                statustext = `${duplicatemsg}`;
                await message.reply(
                  {embeds :[new MessageEmbed()
                    .setColor(es.color)
                    .setTitle(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable23"]))
                    .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable24"]))
                  ]});
                break;
              default:
                message.reply({content: eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable25"])});
              break;
            }
      
            const embed = new MessageEmbed()
                .setAuthor(oldEmbed.author.name, oldEmbed.author.iconURL)
                .setDescription(oldEmbed.description)
                .setColor(color)
                .setFooter(client.getFooter(`Want to suggest something? Simply type it in this channel`, "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/light-bulb_1f4a1.png"))
              
            if(embed.fields[2]){
              embed.fields[2].name == `<a:arrow:943027097348227073> __Reason by **${message.author.tag}**:__`;
              embed.fields[2].value == `>>> ${String(reason).substring(0, 1000)}`;
            } else {
              embed.addField(`<a:arrow:943027097348227073> __Reason by **${message.author.tag}**__`, `>>> ${String(reason).substring(0, 1000)}`)
            }
            targetMessage.edit({embeds: [embed]})
            try{
              let SuggestionsData = await client.settings.get(targetMessage.id);
              if(!SuggestionsData) return message.reply(":x: **Could not find DB Data about this Suggestion**");
              let member = message.guild.members.cache.get(SuggestionsData.user);
              if(!member) member = await message.guild.members.fetch(SuggestionsData.user).catch(() => null);
              if(member){
                member.send({content: `Your Suggestion in **${message.guild.name}** got an Status Update!\n> https://discord.com/channels/${message.guild.id}/${channel.id}/${targetMessage.id}`,embeds: [embed]})
              }
            } catch (e){ console.log(String(e).grey) }
            if(GuildSettings && GuildSettings.adminlog && GuildSettings.adminlog != "no"){
              try{
                var channel2send = message.guild.channels.cache.get(GuildSettings.adminlog)
                if(!channel2send) return client.settings.set(`${message.guild.id}.adminlog`, "no");
                channel2send.send({embeds : [new MessageEmbed()
                  .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null).setFooter(client.getFooter(es))
                  .setAuthor(client.getAuthor(`${require("path").parse(__filename).name} | ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true})))
                  .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable26"]))
                  .addField(eval(client.la[ls]["cmds"]["administration"]["ban"]["variablex_15"]), eval(client.la[ls]["cmds"]["administration"]["ban"]["variable15"]))
                  .addField(eval(client.la[ls]["cmds"]["administration"]["ban"]["variablex_16"]), eval(client.la[ls]["cmds"]["administration"]["ban"]["variable16"]))
                  .setTimestamp().setFooter(client.getFooter("ID: " + message.author?.id, message.author.displayAvatarURL({dynamic: true})))
                ]})
              }catch (e){
                console.error(e)
              }
            } 
        } catch (e) {
            console.error(e);
            return message.reply({embeds  :[new MessageEmbed()
                .setColor(es.wrongcolor)
                .setFooter(client.getFooter(es))
                .setTitle(client.la[ls].common.erroroccur)
                .setDescription(eval(client.la[ls]["cmds"]["administration"]["suggest"]["variable29"]))
            ]});
        }
    }
}
