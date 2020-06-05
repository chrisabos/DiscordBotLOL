const https = require('https');
const Discord = require('discord.js');

const cache = require('../cache.js');
const riot = require('../riot_api_wrapper.js');

module.exports = {
    name: 'stats',
    desc: 'get a user\'s stats!',
    execute(msg, args) {
        console.log(args);
        let username = msg.content.substring(7);
		riot.getSummonerByName(username, (summoner) => {
			if(summoner.status) {
				if(summoner.status.status_code === 404) {
				//summoner not found
					msg.channel.send("Summoner not found");
				}
				else {
					//unknown error
					console.log(summoner.status);
					msg.channel.send("Unknown error");
				}
			}
			else {
				riot.getLeagueEntryBySummonerID(summoner.id, (leagueEntry) => {
					let response = `STATS: ${summoner.name}\nlvl: ${summoner.summonerLevel}\n`;
					var embedResponse = new Discord.MessageEmbed()
						.setColor('#0099ff')
						.setTitle(`Stats: ${summoner.name}`)
						.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summoner.profileIconId}.png`)
						.setDescription(`Lvl: ${summoner.summonerLevel}`);

					if(leagueEntry.length < 1) {
						embedResponse.addFields( { name: 'RANK', value: 'THIS PLAYER IS UNRANKED'} );
					}
					else {
						leagueEntry.some((lg) => {
							embedResponse.addFields( { name: lg.queueType, value: `Rank: ${lg.tier}-${lg.rank}-${lg.leaguePoints}\nWin/Loss: ${lg.wins}/${lg.losses} ${(lg.wins/(lg.wins+lg.losses)*100).toFixed(2)}%`, inline: true} );
						});
					}

					embedResponse.setTimestamp();
					msg.channel.send(embedResponse);
				});
			}
		});
    }
}
