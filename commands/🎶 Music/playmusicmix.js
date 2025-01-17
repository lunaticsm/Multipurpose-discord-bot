const Discord = require(`discord.js`);
const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const songoftheday = require(`../../botconfig/songoftheday.json`);
const playermanager = require(`../../handlers/playermanager`);
const { handlemsg } = require(`../../handlers/functions`);
    module.exports = {
  name: `playmusicmix`,
  category: `🎶 Music`,
  aliases: [`pmusicmix`, "pmm", "musicmix"],
  description: `Plays an awesome Music Mix`,
  usage: `playmusicmix`,
  parameters: {
    "type": "music",
    "activeplayer": false,
    "previoussong": false
  },
  type: "queuesong",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    if(GuildSettings.MUSIC === false) {
      return message.reply({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }
    try {
      let link = "https://open.spotify.com/playlist/37i9dQZF1DXc6IFF23C9jj";
      if (args[0]) {
        //ncs | no copyrighted music
        if (args[0].toLowerCase().startsWith("miyagi")) link = "https://open.spotify.com/playlist/4XprsFTl5HyeZ0vwgd98Nq?si=d0a913330590448d";
        //default
       if (args[0].toLowerCase().startsWith("d")) link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj";
       //remixes from Magic Release
       if (args[0].toLowerCase().startsWith("re")) link = "https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2"
       //gaming
       if (args[0].toLowerCase().startsWith("g")) link = "https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6";
       //Charts
  //Chill
       if (args[0].toLowerCase().startsWith("chi")) link = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";
       //Jazz
    //strange-fruits
       if (args[0].toLowerCase().startsWith("s")) link = "https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51";
       //magic-release
       if (args[0].toLowerCase().startsWith("magic")) link = "https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P"
       //metal
     //my
       if (args[0].toLowerCase().startsWith("cepheid")) link = "https://open.spotify.com/playlist/70Z2lb2F2g2LXaBkcpxABM?si=16e58d38908749cb";
       //music storage
       if (args[0].toLowerCase().startsWith("bandit")) link = "https://open.spotify.com/playlist/6gCc1MHzFZhjYhwRipKtFw?si=66797fa029ce4c24";
      }
      message.reply({
        embeds:  [new MessageEmbed()
          .setColor(es.color)
          .setAuthor(`Loading '${args[0] ? args[0] : "Default"}' Music Mix`, "https://imgur.com/xutrSuq.gif", link)
          .setTitle(eval(client.la[ls]["cmds"]["music"]["playmusicmix"]["variable1"]))
          .setDescription(`>>> \`\`\`2000s, blues, charts, chill, default, edm, heavymetal, gaming, jazz, metal, magic-release, ncs, nocopyright, oldgaming, pop, remixes, rock, strange-fruits-gaming\`\`\``)
          .addField(eval(client.la[ls]["cmds"]["music"]["playmusicmix"]["variablex_3"]), eval(client.la[ls]["cmds"]["music"]["playmusicmix"]["variable3"]))
          .setFooter(client.getFooter(es))
        ]})
      //play the SONG from YOUTUBE
      playermanager(client, message, Array(link), `song:youtube`, false, "songoftheday");
    } catch (e) {
      console.log(String(e.stack).dim.bgRed)
      return message.reply({embeds :[new MessageEmbed()
        .setColor(es.wrongcolor)
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["music"]["playmusicmix"]["variable4"]))
      ]});
    }
  }
};

