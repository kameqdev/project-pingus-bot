import { Client } from 'npm:discord.js'

export default {
    name: 'ready',
    once: true,
    execute(client: Client) {
        console.log(`Client ready!`);
        console.log(`Logged in as ${client?.user?.username}`);
    }
}