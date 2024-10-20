import { ModalSubmitInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ForumChannel, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "npm:discord.js"
import { FormatText, TextToOptions } from '../../utils/enrollment.ts'

const ButtonInteractions = {
    'accept-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        
        // Get forum channel
        const config = await import(`../../config.json?${Date.now()}`, { with: { type: 'json' } }).then(json => json.default)
        const text = baseInteraction.fields.getTextInputValue('content')
        const channel: ForumChannel = await baseInteraction.guild?.channels.fetch(config.forumChannel) as ForumChannel
        
        // const selectMenu = new StringSelectMenuBuilder()
        // .setCustomId('enrollment')
        // .setPlaceholder(textToOptions(text).length ? 'Wybierz klasę' : 'Zapisy niedostępne')
        // .setDisabled(!textToOptions(text).length)
        // if (textToOptions(text).length) selectMenu.addOptions(...textToOptions(text).filter(options => !options.memeberID).map(option => 
        //     new StringSelectMenuOptionBuilder()
        //         .setLabel(option.class)
        //         .setDescription(option.platoon)
        //         .setValue(option.line.toString())))
        // else selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel('label').setDescription('description').setValue('value')) // necessary placeholder data to send selectmenu  
        const openEnrollmentMenuBtn = new ButtonBuilder()
            .setCustomId('open-enrollment-menu')
            .setDisabled(!TextToOptions(text).length)
            .setLabel(TextToOptions(text).length ? 'Otwórz menu zapisów' : 'Zapisy niedostępne')
            .setStyle(ButtonStyle.Secondary)

        const threadChannel = await channel.threads.create({
            name: baseInteraction.fields.getTextInputValue('title'),
            message: {
                content: FormatText(text),
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(openEnrollmentMenuBtn)]
            }
        })
        
        // Create timer to send notification in given date, if valid date provided
        const date = baseInteraction.fields.getTextInputValue('date')
        const now = new Date().getTime()
        const runAt = new Date(date).getTime()
        if (runAt > now) {
            setTimeout(async () => {
                try {
                    const message = await threadChannel.messages.fetch().then(messages => messages.first())
                    const IDs = message?.content.matchAll(/<@\d*>/g)
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
    // 'edit-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
    //     const interactionResponse = await interaction.showModal(new ModalBuilder()
    //         .setCustomId('enrollment')
    //         .setTitle('Utwórz zapisy')
    //         .addComponents(
    //             new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ custom_id: 'content', type: 4, label: "Treść", style: 2 })),
    //             new ActionRowBuilder<TextInputBuilder>().addComponents(TextInputBuilder.from({ custom_id: 'date', type: 4, label: "Data", style: 1, min_length: 16, max_length: 16, placeholder: "dd-mm-rrrr hh:mm", required: false }))
    //     ))

    //     const modalSubmitInteraction = await interaction.awaitModalSubmit({ time: 10 * 60_000 }).catch(async () => {
    //         await interaction.editReply({
    //             content: 'Przekroczono czas oczekiwania',
    //             components: []
    //         }).then(res => setTimeout(() => res.delete(), 3_000))
    //         return null
    //     })

    //     if (!modalSubmitInteraction) return

    //     modalSubmitInteraction.fields.getTextInputValue('content')
    // },
    'reject-enrollment': async (baseInteraction: ModalSubmitInteraction) => {
        await baseInteraction.editReply({
            content: '**❌ | Anulowano tworzenie zapisów**',
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
        // const editBtn = new ButtonBuilder()
        //     .setCustomId('edit-enrollment')
            // .setEmoji()
            // .setLabel('Edytuj')
            // .setStyle(ButtonStyle.Secondary)
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