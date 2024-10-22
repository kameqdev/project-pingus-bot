import { ModalSubmitInteraction, BaseGuildTextChannel } from "npm:discord.js"
import { FormatText } from '../../utils/enrollment.ts'

export default {
    customId: 'edit-message-modal',
    execute: async (interaction: ModalSubmitInteraction) => {
        const channel = await interaction.guild?.channels.fetch(interaction.channelId as string) as BaseGuildTextChannel
        const message = await channel?.messages.fetch(interaction.customId.split(':')[1] as string)

        await message.edit({
            content: FormatText(interaction.fields.getTextInputValue('edit-message-input'))
        })

        await interaction.deferReply({ ephemeral: true }).then(i => i.delete())
    }
}