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
  name: "setup-antilink",
  category: "💪 Setup",
  aliases: ["setupantilink", "antilinks-setup", "antilink-setup", "antilinksetup", "setup-antilinks"],
  cooldown: 5,
  usage: "setup-antilink  -->  Follow the Steps",
  description: "Enable/Disable anti Link system",
  memberpermissions: ["ADMINISTRATOR"],
  type: "security",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    try {
      ///////////////////////////////////////
      ///////////////////////////////////////
      ///////////////////////////////////////
      let tempmsg;
      
      //function to handle true/false
      const d2p = (bool) => bool ? "`✔️ Enabled`" : "`❌ Disabled`"; 
      //call the first layer
      first_layer()

      //function to handle the FIRST LAYER of the SELECTION
      async function first_layer(){
        let menuoptions = [
          {
            value: `${GuildSettings?.antilink?.enabled ? "Disable" : "Enable"} Anti Links`,
            description: `${GuildSettings?.antilink?.enabled ? "Don't delete other Links" : "Delete other Links"}`,
            emoji: `${GuildSettings?.antilink?.enabled ? "951013282607685632" : "950884027320135711"}`
          },
          {
            value: "Settings",
            description: `Show the current Settings of the Anti-Link System`,
            emoji: "📑"
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
            value: "Add Whitelist-LINK",
            description: `Allow Links of specific Server(s)`,
            emoji: "🔗"
          },
          {
            value: "Remove Whitelist-LINK",
            description: `Remove allowed Links`,
            emoji: "💢"
          },
          {
            value: "Change Max-Mute Amount",
            description: `Change the max allow Time to do it before mute!`,
            emoji: "🕛"
          },
          {
            value: "Cancel",
            description: `Cancel and stop the Ticket-Setup!`,
            emoji: "862306766338523166"
          }
        ]
        let Selection = new MessageSelectMenu()
          .setPlaceholder('Click me to setup the Anti-Link-Links System!').setCustomId('MenuSelection') 
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
          .setAuthor("Anti-Links System Setup", 
          "https://cdn.discordapp.com/emojis/858405056238714930.gif?v=1",
          "http://discord.gg/7PdChsBGKd")
          .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable1"]))
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
            let menuoptiondata = menuoptions.find(v => v.value == menu?.values[0])
            let menuoptionindex = menuoptions.findIndex(v => v.value == menu?.values[0])
            if(menu?.values[0] == "Cancel") return menu?.reply({content: eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable2"])})
            client.disableComponentMessage(menu); used1 = true;
            handle_the_picks(menuoptionindex, menuoptiondata)
          }
          else menu?.reply({content: `:x: You are not allowed to do that! Only: <@${cmduser.id}>`, ephemeral: true});
        });
        //Once the Collections ended edit the menu message
        collector.on('end', collected => {
          menumsg.edit({embeds: [menumsg.embeds[0].setDescription(`~~${menumsg.embeds[0].description}~~`)], components: [], content: `${collected && collected.first() && collected.first().values ? `:white_check_mark: **Selected: \`${collected ? collected.first().values[0] : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`})
        });
      }

      //THE FUNCTION TO HANDLE THE SELECTION PICS
      async function handle_the_picks(menuoptionindex, menuoptiondata) {
        switch(menuoptionindex){
          case 0: {
            const predata = await client.settings.get(`${message.guild.id}.antilink.enabled`) || false;
            await client.settings.set(`${message.guild.id}.antilink.enabled`, !predata)
            return message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable3"]))
              .setColor(es.color)
              .setFooter(client.getFooter(es))
            ]});
          }break
          case 1: {
           let thesettings = await client.settings.get(`${message.guild.id}.antilink`)
           console.log(thesettings)
            return message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable4"]))
              .setColor(es.color)
              .setDescription(`**Enabled:** ${thesettings.enabled ? ":white_check_mark:" : ":x:"}\n\n**Witelisted Channels:** ${thesettings.whitelistedchannels && thesettings.whitelistedchannels.length > 0 ? `<#${thesettings.whitelistedchannels.join("> | <#")}>` : "No Channels Whitelisted!"}\n\n**Information:** *Anti Discord are not enabled in Tickets from THIS BOT*`.substring(0, 2048))
              .addField("**Whitelisted Links**", `${thesettings?.whitelistedlinks?.length > 0 ? thesettings.whitelistedlinks.join("\n").substring(0, 1024): "No Links allowed!"}`)
              .setFooter(client.getFooter(es))
            ]});
          }break
          case 2: {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
          .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable5"]))
          .setColor(es.color)
          .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable6"]))
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
              let antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedchannels")
              if (antisettings?.includes(channel.id)) return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable7"]))
                .setColor(es.wrongcolor)
                .setFooter(client.getFooter(es))]
              });
              try {
                await client.settings.push(message.guild.id+ ".antilink.whitelistedchannels", channel.id);
                const predata = await client.settings.get(message.guild.id+ ".antilink.whitelistedchannels") || [];
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable8"]))
                  .setColor(es.color)
                  .setDescription(`Every single Channel:\n> <#${predata}>\nis not checked by the Anti Links System`.substring(0, 2048))
                  .setFooter(client.getFooter(es))]
                });
              } catch (e) {
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable9"]))
                  .setColor(es.wrongcolor)
                  .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable10"]))
                  .setFooter(client.getFooter(es))]
                });
              }
            } else {
              return message.reply( "you didn't ping a valid Channel")
            }
          })
          .catch(e => {
            return message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable11"]))
              .setColor(es.wrongcolor)
              .setDescription(`Cancelled the Operation!`.substring(0, 2000))
              .setFooter(client.getFooter(es))]
            });
          })
          }break
          case 3: {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
          .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable12"]))
          .setColor(es.color)
          .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable13"]))
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
              let antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedchannels") || [];
              if (!antisettings?.includes(channel.id)) return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable14"]))
                .setColor(es.wrongcolor)
                .setFooter(client.getFooter(es))]
              });
              try {
                let Index = antisettings?.indexOf(channel.id) || -1;
                if(Index > -1) {
                  antisettings.splice(index, 1);
                  await client.setings.set(message.guild.id+"antilink.whitelistedchannels", antisettings);
                }
                antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedchannels") || []
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable15"]))
                  .setColor(es.color)
                  .setDescription(`Every single Channel:\n<#${antisettings?.join(">\n<#")}>\nis not a checked by the Anti Links System`.substring(0, 2048))
                  .setFooter(client.getFooter(es))]
                });
              } catch (e) {
                return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable16"]))
                  .setColor(es.wrongcolor)
                  .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable17"]))
                  .setFooter(client.getFooter(es))]
                });
              }
            } else {
              return message.reply( "you didn't ping a valid Channel")
            }
          })
          .catch(e => {
            return message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable18"]))
              .setColor(es.wrongcolor)
              .setDescription(`Cancelled the Operation!`.substring(0, 2000))
              .setFooter(client.getFooter(es))]
            });
          })
          }
          break;
          case 4: {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle("Which Link do you want to enable?")
              .setColor(es.color)
              .setDescription(`Just send it in!\n**NOTE:**\n> It is suggest to remove the \`https\`, because it just checks, **if the Link contains what you send**\n\n**Example:**\n> If you want to allow \`https://bero-host.de\` then make sure to send: \`bero-host.de\``)
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              var { content } = message;
              if (content) {
                let antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedlinks")
                if (antisettings?.includes(content)) return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle("This Link is already Allowed! you can remove it if you want!")
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es))]
                });
                try {
                  await client.settings.push(message.guild.id+".antilink.whitelistedlinks", content);
                  antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedlinks")
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(`Added the Link ${content} to the allowed links!`)
                    .setColor(es.color)
                    .setDescription(`Every single allowed Link:\n> ${antisettings.join("\n> ")}\nIs not a checked by the Anti Discord Links System`.substring(0, 2048))
                    .setFooter(client.getFooter(es))]
                  });
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable9"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable10"]))
                    .setFooter(client.getFooter(es))]
                  });
                }
              } else {
                message.reply( "you didn't send a valid Link")
              }
            })
            .catch(e => {
              console.error(e)
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable11"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }
          break;
          case 5: {
            let antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedlinks")
            if(antisettings.length < 1) return message.reply(":x: There are no links whitelisted...")
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle("Which Link do you want to disable again?\nSend the Link in the Chat")
              .setColor(es.color)
              .setDescription(`${antisettings.map(i => `\`${i}\``).join("\n")}`)
              .setFooter(client.getFooter(es))]
            })
            await tempmsg.channel.awaitMessages({filter: m => m.author.id === message.author?.id,
                max: 1,
                time: 90000,
                errors: ["time"]
            })
            .then(async collected => {
              var message = collected.first();
              var { content } = message;
              if (content) {
                if (!antisettings?.includes(content)) return message.reply({embeds: [new Discord.MessageEmbed()
                  .setTitle("This Link is already not whitelisted!")
                  .setColor(es.wrongcolor)
                  .setFooter(client.getFooter(es))]
                });
                try {
                  let Index = antisettings?.indexOf(content) || -1;
                  if(Index > -1) {
                    antisettings.splice(index, 1);
                    await client.setings.set(message.guild.id+"antilink.whitelistedlinks", antisettings);
                  }
                  antisettings = await client.settings.get(message.guild.id+ ".antilink.whitelistedlinks") || []
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(`Removed the Link ${content} from the allowed links!`)
                    .setColor(es.color)
                    .setDescription(`Every single allowed Link:\n> ${antisettings.join("\n> ")}\nIs not a checked by the Anti Discord Links System`.substring(0, 2048))
                    .setFooter(client.getFooter(es))]
                  });
                } catch (e) {
                  return message.reply({embeds: [new Discord.MessageEmbed()
                    .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable9"]))
                    .setColor(es.wrongcolor)
                    .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable10"]))
                    .setFooter(client.getFooter(es))]
                  });
                }
              } else {
                message.reply( "you didn't send a valid Link")
              }
            })
            .catch(e => {
              console.error(e)
              return message.reply({embeds: [new Discord.MessageEmbed()
                .setTitle(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable11"]))
                .setColor(es.wrongcolor)
                .setDescription(`Cancelled the Operation!`.substring(0, 2000))
                .setFooter(client.getFooter(es))]
              });
            })
          }
          break;
          case 6: {
            tempmsg = await message.reply({embeds: [new Discord.MessageEmbed()
              .setTitle("How often should someone be allowed to do it within 15 Seconds?")
              .setColor(es.color)
              .setDescription(`Currently it is at: \`${client.settings.get(message.guild.id+ ".antilink.mute_amount")}\`\n\nPlease just send the Number! (0 means after the first time he/she will get muted)`)
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
                  await client.settings.set(message.guild.id+".antilink.mute_amount", Number(number));
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

      ///////////////////////////////////////
      ///////////////////////////////////////
      ///////////////////////////////////////s
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["setup"]["setup-antilink"]["variable19"]))]}
      );
    }
  },
};

