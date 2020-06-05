var summonerCache = [];
var matchCache = [];

module.exports = {
    summonerCache: summonerCache,
    matchCache: matchCache,

    //adds/refreshes a summoner to the cache
    cacheSummoner: function(summoner) {
    	let found = false;

    	summonerCache.some((sm) => {
    		if(summoner.id === sm.id) {
    			found = true;
    			sm = summoner;
    			return true;
    		}
    	});

    	if(!found) {
    		summonerCache.push(summoner);
    	}
    },
}
