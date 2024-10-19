import { Client, GatewayIntentBits } from 'npm:discord.js'
import { handleCommands, handleEvents, handleComponents } from './handlers.ts'
import { Command, Component as MyComponent } from './types.ts'

declare module 'npm:discord.js' { interface Client { 
    commands: Map<string, Command>,
    components: Map<string, MyComponent>
} }

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
] });

handleCommands(client)
handleEvents(client)
handleComponents(client)

client.login(Deno.env.get('TOKEN'))