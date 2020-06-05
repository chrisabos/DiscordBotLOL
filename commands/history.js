const https = require('https');
const Discord = require('discord.js');

const assets = require('../assets.js');
const cache = require('../cache.js');
const riot = require('../riot_api_wrapper.js');

module.exports = {
    name: 'history',
    desc: 'get a user\'s match history!',
    execute(msg, args) {
        let username = msg.content.substring(9);
		riot.getSummonerByName(username, (summoner) => {
			if(summoner.status) {
				if(summoner.status.status_code === 404) {
					msg.channel.send("Summoner not found");
				}
				else {
					console.log(summoner.status);
					msg.channel.send("Unknown error");
				}
			}
			else {
				riot.getMatchListByAccountID(summoner.accountId, (matchList) => {
					if(matchList.status) {
						if(matchList.status.status_code === 404) {
							msg.channel.send("Data not found");
						}
						else {
							console.log(matchList.status);
							msg.channel.send("Unknown error");
						}
					}
					else {
						var response = `MATCHES: ${summoner.name}\n`;
						var embedResponse = new Discord.MessageEmbed()
							.setColor('#0099ff')
							.setTitle(`Matches: ${summoner.name}`)
							.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summoner.profileIconId}.png`)
							.setDescription(`Lvl: ${summoner.summonerLevel}`);

						var matchDataList = []

						var i;
						var max_i = 5;
						var process_count = 0;
						for (i = 0; i < max_i; i++) {
							if (matchList.matches.length > i) {
								var match = matchList.matches[i];
								riot.getMatchByMatchID(match.gameId, (asyncMatchData) => {
									matchDataList.push(asyncMatchData);

									//once all the data has been pushed we can operator on it
									if(matchDataList.length === max_i) {
										//sort list by timestamp
										matchDataList.sort((a, b) => (a.gameCreation < b.gameCreation) ? 1 : -1);

										matchDataList.some((matchData) => {
											matchData.participantIdentities.some((identity) => {
												if (identity.player.summonerId === summoner.id) {
													//console.log(identity);
													matchData.participants.some((player) => {
														//console.log(identity.participantId);
														//console.log(player.participantId);
														if (player.participantId === identity.participantId) {
															response += `\t${player.stats.win ? 'W' : 'L'} ${assets.champions.ids[player.championId].name} ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}\n`;

															var queue = riot.getQueueByID(matchData.queueId);
															embedResponse.addFields( { name: queue.map , value: `${queue.description.substring(0, queue.description.lastIndexOf(" "))}\n${player.stats.win ? 'W' : 'L'} ${assets.champions.ids[player.championId].name} ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}` } );
															return true;
														}
													});
													return true;
												}
											});
										});

										//msg.channel.send(response);
										embedResponse.setTimestamp();
										msg.channel.send(embedResponse);
									}
								});
							}
						}
					}
				});
			}
		});
    }
}
