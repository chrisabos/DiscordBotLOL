module.exports = {
    name: 'ping',
    desc: 'Ping!',
    execute(msg, args) {
        msg.channel.send('pong!');
    }
}
