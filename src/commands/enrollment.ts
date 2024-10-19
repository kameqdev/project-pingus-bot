import { ChatInputCommandInteraction, ComponentType, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'npm:discord.js'

export default {
    data: {
        name: 'enrollment',
        description: 'Create enrollment',
        nameLocalizations: {
            pl: 'zapisy'
        },
        descriptionLocalizations: {
            pl: 'Utwórz zapisy'
        }
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const config = await import(`../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)
        if (!config.forumChannel) {
            return interaction.reply({
                ephemeral: true,
                content: '**⚠️ | Ustaw najpierw kanał z zapisami**',
                components: [ new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                    new ChannelSelectMenuBuilder().setCustomId('enrollment-channel-select').setPlaceholder('Wybierz kanał').setChannelTypes([ ChannelType.GuildForum ])
                )]
            })
        }
    }
}