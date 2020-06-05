const https = require('https');

const config = require('./config.json');
const assets = require('./assets.js');
const cache = require('./cache.js');

function getQueueByID(id) {
    var ret = undefined;

    assets.queues.some((q) => {
        if(q.queueId === id) {
            ret = q;
            return true;
        }
    });

    return ret;
}

function httpsGet(url, callback) {
    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', (chunk) => {
            callback(data);
        });
    }).on('error', (err) => {
        console.log("Error: " + err.message);
    });
}

function getSummonerByName(name, callback, refresh=false) {
    if(name && name !== "") {
        if(refresh) {
            httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${config.api_key}`, (data) => {
                let summoner = JSON.parse(data);
                callback(summoner);
                cache.cacheSummoner(summoner);
            });
        }
        else {
            let cachedSummoner = undefined;
            cache.summonerCache.some((sm) => {
                if(sm.name === name) {
                    cachedSummoner = sm;
                    return true;
                }
            });

            if(cachedSummoner) {
                console.log("Summoner FOUND in cache!");
                callback(cachedSummoner);
            }
            else {
                console.log("Summoner NOT FOUND in cache!");
                getSummonerByName(name, callback, true);
            }
        }
    }
    else {
        console.log("Cannot get a summoner without a name");
    }
}

function getSummonerBySummonerID(id, callback, refresh=false) {
    if(id && id !== "") {
        if(refresh) {
            httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/summoner/v4/summoners/${id}?api_key=${config.api_key}`, (data) => {
                let summoner = JSON.parse(data);
                callback(summoner);
                cache.cacheSummoner(summoner);
            });
        }
        else {
            let cachedSummoner = undefined;
            cache.summonerCache.some((sm) => {
                if(sm.id === id) {
                    cachedSummoner = sm;
                    return true;
                }
            });

            if(cachedSummoner) {
                console.log("Summoner FOUND in cache!");
                callback(cachedSummoner);
            }
            else {
                console.log("Summoner NOT FOUND in cache!");
                getSummonerByName(name, callback, true);
            }
        }
    }
    else {
        console.log("Cannot get a summoner without an id");
    }
}

function getLeagueEntryBySummonerID(id, callback) {
    httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${config.api_key}`, (data) => {
        callback(JSON.parse(data));
    });
}

function getChampionMasterBySummonerID(id, callback) {
    httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}?api_key=${config.api_key}`, (data) => {
        callback(JSON.parse(data));
    });
}

function getMatchListByAccountID(id, callback) {
    httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/match/v4/matchlists/by-account/${id}?api_key=${config.api_key}`, (data) => {
        callback(JSON.parse(data));
    });
}

function getMatchByMatchID(id, callback) {
    httpsGet(`https:\/\/${config.region}.api.riotgames.com/lol/match/v4/matches/${id}?api_key=${config.api_key}`, (data) => {
        callback(JSON.parse(data));
    });
}

module.exports = {
    getQueueByID: getQueueByID,
    httpsGet: httpsGet,
    getSummonerByName: getSummonerByName,
    getSummonerBySummonerID: getSummonerBySummonerID,
    getLeagueEntryBySummonerID: getLeagueEntryBySummonerID,
    getChampionMasterBySummonerID: getChampionMasterBySummonerID,
    getMatchListByAccountID: getMatchListByAccountID,
    getMatchByMatchID: getMatchByMatchID,
}
