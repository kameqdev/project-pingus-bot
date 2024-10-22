import { ChatInputCommandInteraction, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, ModalBuilder, TextInputBuilder } from 'npm:discord.js'

export default {
    data: {
        name: 'enrollment',
        description: 'Create enrollment',
        nameLocalizations: {
            pl: 'zapisy'
        },
        descriptionLocalizations: {
            pl: 'Utwórz zapisy'
        },
        default_member_permissions: '8' // administrator
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const config = await import(`../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)
        if (!config.forumChannel || !interaction.guild?.channels.resolve(config.forumChannel)) {
            return interaction.reply({
                ephemeral: true,
                content: '**⚠️ | Ustaw najpierw kanał z zapisami**',
                components: [ new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                    new ChannelSelectMenuBuilder().setCustomId('enrollment-channel-select').setPlaceholder('Wybierz kanał').setChannelTypes([ ChannelType.GuildForum ])
                )]
            })
        }
        await interaction.showModal(new ModalBuilder()
            .setCustomId('enrollment-modal')
            .setTitle('Utwórz zapisy')
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ custom_id: 'title', type: 4, label: "Tytuł", style: 1 })),
                new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ custom_id: 'content', type: 4, label: "Treść", style: 2 })),
                new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ custom_id: 'date', type: 4, label: "Data", style: 1, min_length: 16, max_length: 16, placeholder: "YYYY-MM-DD HH:mm", required: false }))
        ))
    }
}