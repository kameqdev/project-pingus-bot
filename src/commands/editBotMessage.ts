import { ApplicationCommandType, ContextMenuCommandInteraction, ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'npm:discord.js'

export default {
    data: {
        name: 'Edit Message',
        default_member_permissions: '8', // administrator
        nameLocalizations: {
            pl: 'Edytuj Wiadomość'
        },
        type: ApplicationCommandType.Message
    },
    async execute(interaction: ContextMenuCommandInteraction) {
        const config = await import(`../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)
        if ((interaction.channel as { parentId: string | undefined } | null)?.parentId != config.forumChannel)
            return await interaction.reply({
                ephemeral: true,
                content: `**⚠️ | Można edytować tylko wiadomości z <#${config.forumChannel}>**`
            }).then(i => setTimeout(() => i.delete(), 3_000))

        const message = await interaction.channel?.messages.fetch(interaction.targetId)

        if (message?.author.id != interaction.applicationId)
            return await interaction.reply({
                ephemeral: true,
                content: `**⚠️ | Można edytować tylko wiadomości <@${interaction.applicationId}>**`
            }).then(i => setTimeout(() => i.delete(), 3_000))

        const modal = new ModalBuilder()
            .setTitle('Edytuj Wiadomość')
            .setCustomId(`edit-message-modal:${interaction.targetId}`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ 
                    custom_id: 'edit-message-input', type: 4, label: "Treść nowej wiadomości", style: 2, required: false, value: message?.content
                }))
            )

        await interaction.showModal(modal)
    }
}