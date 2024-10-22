import { ModalSubmitInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ForumChannel } from "npm:discord.js"
import { FormatText } from '../../utils/enrollment.ts'

const ButtonInteractions = {
    'accept-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        
        // Get forum channel
        const config = await import(`../../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)
        const text = baseInteraction.fields.getTextInputValue('content')
        const channel: ForumChannel = await baseInteraction.guild?.channels.fetch(config.forumChannel) as ForumChannel

        const openEnrollmentMenuBtn = new ButtonBuilder()
            .setCustomId('open-enrollment-menu')
            .setLabel('Otwórz menu zapisów')
            .setStyle(ButtonStyle.Secondary)

        const date = baseInteraction.fields.getTextInputValue('date')
        const now = new Date().getTime()
        const runAt = new Date(date).getTime()
        const isDateValid = runAt > now

        const threadChannel = await channel.threads.create({
            name: baseInteraction.fields.getTextInputValue('title'),
            message: {
                content: FormatText(text) + (isDateValid ? `\n-# Powiadomienie zaplanowane na: <t:${Math.floor(runAt / 1000)}:f>` : ''),
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(openEnrollmentMenuBtn)]
            }
        })
        
        // Create timer to send notification in given date, if valid date provided
        if (isDateValid) {
            setTimeout(async () => {
                try {
                    const message = await threadChannel.messages.fetch().then(messages => messages.first())
                    const IDs = message?.content.matchAll(/<@\d+>/gm)
                    if (!IDs) return
                    const content = Array.from(IDs, match => match[0]).join("\n")
                    if (!content) return
                    threadChannel.send(content)
                } catch (_) { /**/ }
            }, runAt - now)
        }

        await baseInteraction.editReply({
            content: `**✅ | Pomyślnie stworzono zapisy - <#${threadChannel.id}>**` + ((date && !(runAt > now)) ? '\n**⚠️ | Nie udało się zaplanować powiadomienia**' : ''),
            components: []
        }).then(() => setTimeout(() => baseInteraction.deleteReply(), 5_000))
    },
    'reject-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        await baseInteraction.editReply({
            content: '**❌ | Anulowano tworzenie zapisów**',
            components: []
        }).then(() => setTimeout(() => baseInteraction.deleteReply(), 3_000))
    }
 
}


export default {
    customId: 'enrollment-modal',
    execute: async (interaction: ModalSubmitInteraction) => {
        const acceptBtn = new ButtonBuilder()
            .setCustomId('accept-enrollment')
            .setLabel('Zatwierdź')
            .setStyle(ButtonStyle.Success)
        const rejectBtn = new ButtonBuilder()
            .setCustomId('reject-enrollment')
            .setLabel('Anuluj')
            .setStyle(ButtonStyle.Danger)

        const date = FormatText(interaction.fields.getTextInputValue('date'))
        const timestamp = new Date(date).getTime()
        const interactionResponse = await interaction.reply({
            ephemeral: true,
            content: '# Preview zapisów:\n' + FormatText(interaction.fields.getTextInputValue('content')) + ((new Date().getTime() < timestamp) ? `\n-# Powiadomienie zaplanowane na: <t:${Math.floor(timestamp / 1000)}:f>` : ''),
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(acceptBtn, rejectBtn)],
            fetchReply: true
        })

        try {
            const btnInteraction = await interactionResponse.awaitMessageComponent({ time: 60_000 })
            const buttonId = btnInteraction.customId
            
            switch (buttonId) {
                case 'reject-enrollment':
                    ButtonInteractions['reject-enrollment'](interaction as ModalSubmitInteraction)
                    break
                case 'accept-enrollment':
                    ButtonInteractions['accept-enrollment'](interaction as ModalSubmitInteraction)
                    break
            }

        } catch (_) {
            setTimeout(() => interaction.deleteReply(), 3_000)
            interaction.editReply({
                content: '**❌ | Przekroczono czas oczekiwania, anulowano**',
                components: []
            })
        }
    }
}