import { Interaction } from 'npm:discord.js'

export default {
    name: 'interactionCreate',
    execute(interaction: Interaction) {
        const client = interaction.client
        
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return new Error('There is no code for this command')
            try { command.execute(interaction) }
            catch (err) { console.error(err) }
        } else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu()) {
            const component = client.components.get(interaction.customId)
            if (!component) return new Error('There is no code for this component')
            try { component.execute(interaction) }
            catch (err) { console.error(err) }
        } else console.log(`There was an interaction I am not designed to handle.`)
    }
}