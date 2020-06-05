const fs = require('fs');
const https = require('https');
const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const cache = require('./cache.js');
const riot = require('./riot_api_wrapper.js');

var champions = undefined;
var queues = undefined;

var commands = new Discord.Collection();

//load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    console.log(file);
    const command = require(`./commands/${file}`);
    commands.set(command.name, command);
}

function load(callback) {
	riot.httpsGet('https://ddragon.leagueoflegends.com/cdn/10.11.1/data/en_US/champion.json', (c) => {
		champions = JSON.parse(c);
		champions.ids = [];

		for (var name in champions.data) {
			var champ = champions.data[name]
			champions.ids[parseInt(champ.key)] = champ;
		}

		//console.log(champions.ids);

		riot.httpsGet('https://static.developer.riotgames.com/docs/lol/queues.json', (data) => {
			queues = JSON.parse(data);
			callback();
		})
	});
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	load(() => {
		console.log('LOAD COMPLETE');
	});
});

client.on('message', (msg) => {
	if (msg.content.startsWith('!')) {
        const args = msg.content.slice(1).split(/ +/);
        const command = args.shift().toLowerCase();

        if (!commands.has(command)) return;

        try {
            commands.get(command).execute(msg, args);
        } catch(error) {
            console.error(error);
            msg.reply('there was an error while executing your command.');
        }
    }

	// if (msg.content.startsWith('!stats')) {
	// 	let username = msg.content.substring(7);
	// 	getSummonerByName(username, (summoner) => {
	// 		if(summoner.status) {
	// 			if(summoner.status.status_code === 404) {
	// 			//summoner not found
	// 				msg.channel.send("Summoner not found");
	// 			}
	// 			else {
	// 				//unknown error
	// 				console.log(summoner.status);
	// 				msg.channel.send("Unknown error");
	// 			}
	// 		}
	// 		else {
	// 			getLeagueEntryBySummonerID(summoner.id, (leagueEntry) => {
	// 				let response = `STATS: ${summoner.name}\nlvl: ${summoner.summonerLevel}\n`;
	// 				var embedResponse = new Discord.MessageEmbed()
	// 					.setColor('#0099ff')
	// 					.setTitle(`Stats: ${summoner.name}`)
	// 					.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summoner.profileIconId}.png`)
	// 					.setDescription(`Lvl: ${summoner.summonerLevel}`);
	//
	// 				if(leagueEntry.length < 1) {
	// 					embedResponse.addFields( { name: 'RANK', value: 'THIS PLAYER IS UNRANKED'} );
	// 				}
	// 				else {
	// 					leagueEntry.some((lg) => {
	// 						embedResponse.addFields( { name: lg.queueType, value: `Rank: ${lg.tier}-${lg.rank}-${lg.leaguePoints}\nWin/Loss: ${lg.wins}/${lg.losses} ${(lg.wins/(lg.wins+lg.losses)*100).toFixed(2)}%`, inline: true} );
	// 					});
	// 				}
	//
	// 				embedResponse.setTimestamp();
	// 				msg.channel.send(embedResponse);
	// 			});
	// 		}
	// 	});
	// }
	// else if(msg.content.startsWith('!champs')) {
	// 	let username = msg.content.substring(8);
	// 	getSummonerByName(username, (summoner) => {
	// 		if(summoner.status) {
	// 			if(summoner.status.status_code === 404) {
	// 				msg.channel.send("Summoner not found");
	// 			}
	// 			else {
	// 				console.log(summoner.status);
	// 				msg.channel.send("Unknown error");
	// 			}
	// 		}
	// 		else {
	// 			getMatchListByAccountID(summoner.accountId, (matchList) => {
	// 				matchList.matches.some((m) => {
	// 					//console.log(champions.ids[m.champion].name);
	// 				});
	// 			});
	// 		}
	// 	});
	// }
	// else if (msg.content.startsWith('!history')) {
	// 	let username = msg.content.substring(9);
	// 	getSummonerByName(username, (summoner) => {
	// 		if(summoner.status) {
	// 			if(summoner.status.status_code === 404) {
	// 				msg.channel.send("Summoner not found");
	// 			}
	// 			else {
	// 				console.log(summoner.status);
	// 				msg.channel.send("Unknown error");
	// 			}
	// 		}
	// 		else {
	// 			getMatchListByAccountID(summoner.accountId, (matchList) => {
	// 				if(matchList.status) {
	// 					if(matchList.status.status_code === 404) {
	// 						msg.channel.send("Data not found");
	// 					}
	// 					else {
	// 						console.log(matchList.status);
	// 						msg.channel.send("Unknown error");
	// 					}
	// 				}
	// 				else {
	// 					var response = `MATCHES: ${summoner.name}\n`;
	// 					var embedResponse = new Discord.MessageEmbed()
	// 						.setColor('#0099ff')
	// 						.setTitle(`Matches: ${summoner.name}`)
	// 						.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summoner.profileIconId}.png`)
	// 						.setDescription(`Lvl: ${summoner.summonerLevel}`);
	//
	// 					var matchDataList = []
	//
	// 					var i;
	// 					var max_i = 5;
	// 					var process_count = 0;
	// 					for (i = 0; i < max_i; i++) {
	// 						if (matchList.matches.length > i) {
	// 							var match = matchList.matches[i];
	// 							getMatchByMatchID(match.gameId, (asyncMatchData) => {
	// 								matchDataList.push(asyncMatchData);
	//
	// 								//once all the data has been pushed we can operator on it
	// 								if(matchDataList.length === max_i) {
	// 									//sort list by timestamp
	// 									matchDataList.sort((a, b) => (a.gameCreation < b.gameCreation) ? 1 : -1);
	//
	// 									matchDataList.some((matchData) => {
	// 										matchData.participantIdentities.some((identity) => {
	// 											if (identity.player.summonerId === summoner.id) {
	// 												//console.log(identity);
	// 												matchData.participants.some((player) => {
	// 													//console.log(identity.participantId);
	// 													//console.log(player.participantId);
	// 													if (player.participantId === identity.participantId) {
	// 														response += `\t${player.stats.win ? 'W' : 'L'} ${champions.ids[player.championId].name} ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}\n`;
	//
	// 														var queue = getQueueByID(matchData.queueId);
	// 														embedResponse.addFields( { name: queue.map , value: `${queue.description.substring(0, queue.description.lastIndexOf(" "))}\n${player.stats.win ? 'W' : 'L'} ${champions.ids[player.championId].name} ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}` } );
	// 														return true;
	// 													}
	// 												});
	// 												return true;
	// 											}
	// 										});
	// 									});
	//
	// 									//msg.channel.send(response);
	// 									embedResponse.setTimestamp();
	// 									msg.channel.send(embedResponse);
	// 								}
	// 							});
	// 						}
	// 					}
	// 				}
	// 			});
	// 		}
	// 	});
	// }
	// else if(msg.content.startsWith('!test')) {
	//
	// }
});

/*
getChampionMasterBySummonerID(summoner.id, (champs) => {
	let response = `CHAMPS: ${summoner.name}\n`;

	if(champs.length > 0) {
		response += `\n\tChampion: ${champs[0].championId}\n`;
		response += `\tMastery Level: ${champs[0].championLevel}\n`;
		response += `\tMastery Points: ${champs[0].championPoints}\n`;
	}

	if(champs.length > 1) {
		response += `\n\tChampion: ${champs[1].championId}\n`;
		response += `\tMastery Level: ${champs[1].championLevel}\n`;
		response += `\tMastery Points: ${champs[1].championPoints}\n`;
	}

	if(champs.length > 2) {
		response += `\n\tChampion: ${champs[2].championId}\n`;
		response += `\tMastery Level: ${champs[2].championLevel}\n`;
		response += `\tMastery Points: ${champs[2].championPoints}\n`;
	}

	msg.channel.send(response);
});
*/

client.login(config.token);
