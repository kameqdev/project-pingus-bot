import { ChannelSelectMenuInteraction } from 'npm:discord.js'

export default {
    customId: 'enrollment-channel-select',
    execute: async (interaction: ChannelSelectMenuInteraction) => {

        const config = JSON.parse(await Deno.readTextFile('./src/config.json'))

        config.forumChannel = interaction.values[0]

        await Deno.writeTextFile('./src/config.json', JSON.stringify(config))
        const command = await interaction.guild?.commands.fetch()
            .then(commands => commands.find(command => command.name === interaction.message.interaction?.commandName))
            .then(command => command ? `</${command?.name}:${command?.id}>` : null)
        await interaction.update({
            content: `Zapisy będą teraz tworzone w kanale <#${interaction.values[0]}>` + command ? `\nTeraz możesz użyć ponownie ${command}` : '',
            components: []
        })
    }
}