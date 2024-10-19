import { ModalSubmitInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ForumChannel, ComponentType } from "npm:discord.js"

const formatText = (content: string): string => content.replaceAll(/^([^- ].*)/gm, '## $1')

const ButtonInteractions = {
    'accept-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        const config = await import(`../../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)

        const channel: ForumChannel = await baseInteraction.guild?.channels.fetch(config.forumChannel) as ForumChannel
        const threadChannel = await channel.threads.create({
            name: baseInteraction.fields.getTextInputValue('title'),
            message: {
                content: formatText(baseInteraction.fields.getTextInputValue('content')),
            }
        })
        
        const date = baseInteraction.fields.getTextInputValue('date')
        const now = new Date().getTime()
        const runAt = new Date(date).getTime()
        if (runAt > now) {
            setTimeout(async () => {
                try {
                    const message = await threadChannel.messages.fetch().then(messages => messages.first())
                    const IDs = message?.content.matchAll(/<@\d*>/g)
                    if(!IDs) return
                    threadChannel.send(Array.from(IDs, match => match[0]).join("\n"))
                } catch (_) { /**/ }
            }, runAt - now)
        }

        await baseInteraction.editReply({
            content: `**✅ | Pomyślnie stworzono zapisy - <#${threadChannel.id}>**` + ((date && !(runAt > now)) ? '\n**⚠️ | Nie udało się ustawić daty spingowania**' : ''),
            components: []
        }).then(() => setTimeout(() => baseInteraction.deleteReply(), 5_000))
    },
    'reject-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        await baseInteraction.editReply({
            content: 'Anulowano tworzenie zapisów',
            components: []
        }).then(() => setTimeout(() => baseInteraction.deleteReply(), 3_000))
    }
 
}


export default {
    customId: 'enrollment',
    execute: async (interaction: ModalSubmitInteraction) => {
        const acceptBtn = new ButtonBuilder()
            .setCustomId('accept-enrollment')
            .setLabel('Zatwierdź')
            .setStyle(ButtonStyle.Success)
        const editBtn = new ButtonBuilder()
            .setCustomId('accept-enrollment')
            .setLabel('Edytuj')
            .setStyle(ButtonStyle.Secondary)
        const rejectBtn = new ButtonBuilder()
            .setCustomId('reject-enrollment')
            .setLabel('Anuluj')
            .setStyle(ButtonStyle.Danger)

        const interactionResponse = await interaction.reply({
            ephemeral: true,
            content: '# Preview zapisów:\n' + formatText(interaction.fields.getTextInputValue('content')),
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(acceptBtn, rejectBtn)],
            fetchReply: true
        })

        try {
            const btnInteraction = await interactionResponse.awaitMessageComponent({ time: 180_000 })
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
                content: 'Przekroczono czas oczekiwania',
                components: []
            })
        }
    }
}