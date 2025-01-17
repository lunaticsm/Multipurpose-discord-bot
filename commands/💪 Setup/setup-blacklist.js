var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
var emoji = require(`../../botconfig/emojis.json`);
var {
  dbEnsure, swap_pages, swap_pages2, dbRemove
} = require(`../../handlers/functions`);
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
  name: "setup-blacklist",
  category: "💪 Setup",
  aliases: ["setupblacklist", "blacklist-setup", "blacklistsetup"],
  cooldown: 5,
  usage: "setup-blacklist  -->  Follow the Steps",
  description: "Blacklist specific Words in your Server",
  memberpermissions: ["ADMINISTRATOR"],
  type: "security",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    try {
      first_layer()
      async function first_layer(){
        let menuoptions = [
          {
            value: "Add Blacklisted-Word",
            description: `Add a Word to the Blacklisted Words`,
            emoji: "✅"
          },
          {
            value: "Remove Blacklisted-Word",
            description: `Remove a Word from the Blacklisted Words`,
            emoji: "🗑️"
          },
          {
            value: "Show Settings",
            description: `Show all Blacklisted Words Settings`,
            emoji: "📑"
          },
          {
            value: "Reset Blacklist",
            description: `Delete/Reset all Blacklisted Words`,
            emoji: "💥"
          },
          {
            value: "Add Whitelist-CHANNEL",
            description: `Allow Channels where it is allowed`,
            emoji: "💯"
          },
          {
            value: "Remove Whitelist-CHANNEL",
            description: `Remove allowed Channels`,
            emoji: "💢"
          },
          {
            value: "Change Max-Mute Amount",
            description: `Change the max allow Time to do it before mute!`,
            emoji: "🕛"
          },
          {
            value: "Cancel",
            description: `Cancel and stop the Auto-Meme-Setup!`,
            emoji: "862306766338523166"
          }
        ]
        //define the selection
        let Selection = new MessageSelectMenu()
          .setCustomId('MenuSelection') 
          .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
          .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
          .setPlaceholder('Click me to setup the Automated Meme System!') 
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
        let MenuEmbed = new MessageEmbed()
        .setColor(es.color)
        .setAuthor(client.getAuthor('Setup Blacklist', 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/joypixels/291/stop-sign_1f6d1.png', 'http://discord.gg/7PdChsBGKd'))
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable2"]))
        let used1 = false;
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
            let menuoptiondata = menuoptions.find(v=>v.value == menu?.values[0])
            if(menu?.values[0] == "Cancel") return menu?.reply(eval(client.la[ls]["cmds"]["setup"]["setup-ticket"]["variable3"]))
            client.disableComponentMessage(menu);
            used1 = true;
            handle_the_picks(menu?.values[0], menuoptiondata)
          }
          else menu?.reply({content: `:x: You are not allowed to do that! Only: <@${cmduser.id}>`, ephemeral: true});
        });
        //Once the Collections ended edit the menu message
        collector.on('end', collected => {
          menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `:white_check_mark: **Selected: \`${collected ? collected.first().values[0] : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`})
        });
      }
      async function handle_the_picks(optionhandletype, menuoptiondata) {
        switch (optionhandletype){
          case "Add Blacklisted-Word": { 
            var tempmsg = await message.reply({embeds: [new MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable5"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable6"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
              max: 1,
              time: 90000,
              errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
            
              if (message.content) {
                try {
                  var blacklistedwords = message.content.split(",").filter(Boolean).map(item => item.trim().toLowerCase());
                  var notadded = []
                  const words = await client.blacklist.get(message.guild.id+".words") || [];
                  for await (const blacklistword of blacklistedwords){
                    if(words.includes(blacklistword)){
                      notadded.push(blacklistword);
                    }else {
                      words.push(blacklistword)
                    }
                  }
                  await client.blacklist.set(message.guild.id+".words", words)
                  return message.reply({embeds: [new MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable7"]))
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable8"]))
                    .setColor(es.color)
                    .setFooter(client.getFooter(es))]}
                  );
                } catch (e) {
                  console.error(e)
                  return message.reply({embeds: [new MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable9"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable10"]))
                    .setFooter(client.getFooter(es))]}
                  );
                }
              } else {
                message.reply( "you didn't ping a valid Role")
              }
            })
            .catch(e => {
              console.error(e)
              return message.reply({embeds: [new MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable11"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]}
              );
            })
          }
          break;
          case "Remove Blacklisted-Word": { 
            var tempmsg = await message.reply({embeds: [new MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable12"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable13"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
              })
              .then(async collected => {
                var message = collected.first();
               
                if (message.content) {
                  try {
                    var blacklistedwords = message.content.split(",").filter(Boolean).map(item => item.trim().toLowerCase());
                    var notremoved = []
                    const words = await client.blacklist.get(message.guild.id+".words") || [];
                    for await (const blacklistword of blacklistedwords){
                      if(words.includes(blacklistword)){
                        notadded.push(blacklistword);
                      }else {
                        let index = words.indexOf(blacklistword);
                        if(index > -1) words.splice(index, 1);
                      }
                    }
                    await client.blacklist.set(message.guild.id+".words", words)
                    return message.reply({embeds: [new MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable14"]))
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable15"]))
                      .setColor(es.color)
                      .setFooter(client.getFooter(es))]}
                    );
                  } catch (e) {
                    console.error(e)
                    return message.reply({embeds: [new MessageEmbed()
                      .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable16"]))
                      .setColor(es.wrongcolor)
                      .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable17"]))
                      .setFooter(client.getFooter(es))]}
                    );
                  }
                } else {
                  message.reply( "you didn't ping a valid Role")
                }
              })
              .catch(e => {
                console.error(e)
                return message.reply({embeds: [new MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable18"]))
                  .setColor(es.wrongcolor)
                  .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                  .setFooter(client.getFooter(es))]}
                );
              })
          }
          break;
          case "Show Settings": { 
            const words = await client.blacklist.get(message.guild.id+".words") || [];
            return swap_pages(client, message, `${words.map(word => `\`${word}\``).join(", ").split("`").join("\`")}`, `${message.guild.name} | Blacklisted Words`);
          }
          break;
          case "Reset Blacklist": { 
            await client.blacklist.set(message.guild.id+".words", [])
            return message.reply({embeds: [new MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable19"]))
              .setColor(es.color)
              .setFooter(client.getFooter(es))]}
            );
          }
          break;
          case "Add Whitelist-CHANNEL": {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable5"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable6"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              var channel = message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first() || message.guild.channels.cache.get(message.content.trim().split(" ")[0]);
              if (channel) {
                let antisettings = await client.blacklist.get(message.guild.id+".whitelistedchannels") || [];
                if (antisettings?.includes(channel.id)) return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable7"]))
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es))]
                });
                try {
                  await client.blacklist.push(message.guild.id+".whitelistedchannels", channel.id);
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(`The Channel \`${channel.name}\` is now got added to the Whitelisted Channels of this System`)
                    .setColor(es.color)
                    .setDescription(`Every single Channel:\n<#${[...antisettings, channel.id].join(">\n<#")}>\nis not checked by the System`.substring(0, 2048))
                    .setFooter(client.getFooter(es))]
                  });
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable9"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable10"]))
                    .setFooter(client.getFooter(es))]
                  });
                }
              } else {
                message.reply("you didn't ping a valid Channel")
              }
            })
            .catch(e => {
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable11"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }break;
          case "Remove Whitelist-CHANNEL": {

            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable12"]))
              .setColor(es.color)
              .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable13"]))
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              var channel = message.mentions.channels.filter(ch=>ch.guild.id==message.guild.id).first() || message.guild.channels.cache.get(message.content.trim().split(" ")[0]);
              if (channel) {
                let antisettings = await client.blacklist.get(message.guild.id+".whitelistedchannels") || [];
                if (!antisettings?.includes(channel.id)) return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable14"]))
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es))]
                });
                try {
                  dbRemove(client.blacklist+".whitelistedchannels", message.guild.id, channel.id);
                  antisettings = await client.blacklist.get(message.guild.id+".whitelistedchannels", true) || [];
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(`The Channel \`${channel.name}\` is now removed out of the Whitelisted Channels of this System`)
                    .setColor(es.color)
                    .setDescription(`Every single Channel:\n> <#${antisettings}>\nis not checked by the System`.substring(0, 2048))
                    .setFooter(client.getFooter(es))]
                  });
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable16"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable17"]))
                    .setFooter(client.getFooter(es))]
                  });
                }
              } else {
                message.reply("you didn't ping a valid Channel")
              }
            })
            .catch(e => {
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable18"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }break;
          case "Change Max-Mute Amount": {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle("How often should someone be allowed to do it within 15 Seconds?")
              .setColor(es.color)
              .setDescription(`Currently it is at: \`${await client.blacklist.get(message.guild.id+".mute_amount")}\`\n\nPlease just send the Number! (0 means after the first time he/she will get muted)`)
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              if (message.content) {
                let number = message.content;
                if(isNaN(number)) return message.reply(":x: **Not a valid Number**");
                if(Number(number) < 0 || Number(number) > 15) return message.reply(":x: **The Number must be between `0` and `15`**");
                
                try {
                  await client.blacklist.set(message.guild.id+".mute_amount", Number(number));
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle("Successfully set the New Maximum Allowed Amounts to " + number + " Times")
                    .setColor(es.color)
                    .setDescription(`**If someone does it over __${number} times__ he/she/they will get muted for 10 Minutes!**`.substring(0, 2048))
                    .setFooter(client.getFooter(es))]
                  });
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable16"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable17"]))
                    .setFooter(client.getFooter(es))]
                  });
                }
              } else {
                message.reply("You didn't add a valid message content")
              }
            })
            .catch(e => {
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antidiscord"]["variable18"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }break;
        
        }
      }
      
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-blacklist"]["variable21"]))]}
      );
    }
  },
};
