var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
var emoji = require(`../../botconfig/emojis.json`);
var {
  dbEnsure
} = require(`../../handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
  name: "setup-autobackup",
  category: "💪 Setup",
  aliases: ["setupautobackup", "setup-backup", "setupbackup", "autobackup-setup", "autobackupsetup"],
  cooldown: 5,
  usage: "setup-autobackup  -->  Follow the Steps",
  description: "Enable / Disable Automated Backups of this Server (One Backup / 2 Days)",
  memberpermissions: ["ADMINISTRATOR"],
  type: "security",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
        
    try {
///////////////////////////////////////
      ///////////////////////////////////////
      ///////////////////////////////////////
      
      
      if(!message.guild.me.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)){
        return message.reply(":x: **I am missing the ADMINISTRATOR Permission!**")
      }
      let owner = await message.guild.fetchOwner().catch(e=>{
          return message.reply("Could not get owner of target guild")
      })
      if(owner.id != cmduser.id) {
          return message.reply(`:x: **You need to be the Owner of this Server!**`)
      }
      //function to handle true/false
      const d2p = (bool) => bool ? "`✔️ Enabled`" : "`❌ Disabled`"; 
      //call the first layer
      first_layer()

      //function to handle the FIRST LAYER of the SELECTION
      async function first_layer(){
        let menuoptions = [
          {
            value: !GuildSettings.autobackup ? "Enable Auto-Backups" : "Disable Auto-Backups",
            description: !GuildSettings.autobackup ? "Make a Backup every 2nd Day" : "Don't make automated Server Backups anymore",
            emoji: !GuildSettings.autobackup ? "950884027320135711" : "951013282607685632"
          },
          {
            value: "Cancel",
            description: `Cancel and stop the Anti-Caps-Setup!`,
            emoji: "862306766338523166"
          }
        ]
        let Selection = new MessageSelectMenu()
          .setPlaceholder('Click me to setup the Anti Caps System!').setCustomId('MenuSelection') 
          .setMaxValues(1).setMinValues(1) 
          .addOptions(
            menuoptions.map(option => {
              let Obj = {
                label: option.label ? option.label.substring(0, 50) : option.value.substring(0, 50),
                value: option.value.substring(0, 50),
                description: option.description.substring(0, 50),
              }
            if(option.emoji) Obj.emoji = option.emoji;
            return Obj;
           }))
        //define the embed
        let MenuEmbed = new Discord.MessageEmbed()
          .setColor(es.color)
          .setAuthor(client.getAuthor("Auto-Backup System Setup", 
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/floppy-disk_1f4be.png",
          "http://discord.gg/7PdChsBGKd"))
          .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-anticaps"]["variable1"]))
        //send the menu msg
        let menumsg = await message.reply({embeds: [MenuEmbed], components: [new MessageActionRow().addComponents(Selection)]})
        //Create the collector
        const collector = menumsg.createMessageComponentCollector({ 
          filter: i => i?.isSelectMenu() && i?.message.author?.id == client.user.id && i?.user,
          time: 90000
        })
        //Menu Collections
        collector.on('collect', async menu => {
          if (menu?.user.id === cmduser.id) {
            collector.stop();
            if(menu?.values[0] == "Cancel") return menu?.reply(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable3"]))
            await client.settings.set(message.guild.id+".autobackup", !GuildSettings.autobackup);
            return message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(GuildSettings.autobackup ? "Enabled Auto-Backups" : "Disabled Auto-Backups")
              .setColor(es.color)
              .setDescription(`${GuildSettings.autobackup ? `I woll now make a Backup every 2nd Day!\nOld Backups will automatically get removed!\n\nTo See the backups use the: \`${prefix}listbackups ${message.guild.id}\` Command\n\nTo load the latest Backup use the \`${prefix}loadbackup ${message.guild.id} 0\` Command` : `I will no longer make automatic Backups every 2 Days!\n\nTo create backups manually use: \`${prefix}createbackup`}`.substring(0, 2048))
              .setFooter(client.getFooter(es))]
            });
          }
          else menu?.reply({content: `:x: You are not allowed to do that! Only: <@${cmduser.id}>`, ephemeral: true});
        });
        //Once the Collections ended edit the menu message
        collector.on('end', collected => {
          menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `:white_check_mark: **Selected: \`${collected ? collected.first().values[0] : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`})
        });
      }


      ///////////////////////////////////////
      ///////////////////////////////////////
      ///////////////////////////////////////
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-anticaps"]["variable13"]))]
      });
    }
  },
};

