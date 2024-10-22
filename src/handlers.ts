import { Client, REST, Routes } from 'npm:discord.js'
import { Command, Component } from './types.ts'


async function registerCommands(commands: string[]) {
    const rest = new REST().setToken(Deno.env.get('TOKEN') as string)

    try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		const data = await rest.put(
			Routes.applicationGuildCommands(Deno.env.get('CLIENT_ID') as string, Deno.env.get('GUILD_ID') as string),
			{ body: commands },
		) as unknown[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
	} catch (error) { console.error(error) }
}


export async function handleCommands(client: Client) {
    client.commands = new Map<string, Command>()
    const commands: string[] = []
    
    const commandFiles = Deno.readDir('./src/commands')

    for await (const file of commandFiles) {
        if (!file.isFile) continue
        const command = await import(`./commands/${file.name}`).then(imported => imported.default)
        if (!('data' in command && 'execute' in command)) {
            console.log(`[WARNING] The command at ./src/commands/${file.name} is missing a required "data" or "execute" property.`)
            continue
        }
        client.commands.set(command.data.name, command)
        commands.push(command.data)
    }

    registerCommands(commands)
}


export async function handleEvents(client: Client) {
    const eventFiles = Deno.readDir('./src/events')

    for await (const file of eventFiles) {
        if (!file.isFile) continue
        const event = await import(`./events/${file.name}`).then(imported => imported.default)
        if (!('name' in event && 'execute' in event)) {
            console.log(`[WARNING] The event at ./src/events/${file.name} is missing a required "name" or "execute" property.`)
            continue
        }
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client))
        else client.on(event.name, (...args) => event.execute(...args, client))
    }
}

export async function handleComponents(client: Client) {
    client.components = new Map<string, Component>()
    
    const componentDirs = Deno.readDir(`./src/components/`)

    for await (const componentDir of componentDirs) {
        if (!componentDir.isDirectory) continue
        const componentFiles = Deno.readDir(`./src/components/${componentDir.name}/`)
        for await (const file of componentFiles) {
            if (!file.isFile) continue
            const component = await import(`./components/${componentDir.name}/${file.name}`).then(imported => imported.default)
            if (!('customId' in component && 'execute' in component)) {
                console.log(`[WARNING] The component at ./src/components/${componentDir.name}/${file.name} is missing a required "data" or "execute" property.`)
                continue
            }
            client.components.set(component.customId, component)
        }
    }
}