import { ButtonStyle, StringSelectMenuInteraction, ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder } from 'npm:discord.js'
import { FormatText, TextToOptions, RemoveMember, AddMember } from '../../utils/enrollment.ts'


const CollectorInteractions = {
    'enrollment-select': async (interaction: StringSelectMenuInteraction, baseInteraction: ButtonInteraction) => {
        const options = TextToOptions(baseInteraction.message.content)
        const line = +interaction.values[0]

        if (options.map(option => option.memberID).includes(interaction.user.id))
            return interaction.update({
                content: `**❌ | Jesteś już zapisany**`,
                components: []
            }).then(i => setTimeout(() => i.delete(), 3_000))

        if (options.find(option => option.line === line)?.memberID)
            return interaction.update({
                content: `**❌ | Miejsce jest już zajęte**`,
                components: []
            }).then(i => setTimeout(() => i.delete(), 3_000))
            
        await baseInteraction.message.edit({
            content: AddMember(baseInteraction.message.content, interaction.user.id, line)
        })
        await interaction.update({
            content: `**✅ | Pomyślnie zapisano**`,
            components: []
        }).then(i => setTimeout(() => i.delete(), 3_000))
    },
    'prev': (interaction: ButtonInteraction, baseInteraction: ButtonInteraction) => {
        
    },
    'next': (interaction: ButtonInteraction, baseInteraction: ButtonInteraction) => {
        
    },
    'unenroll': async (interaction: ButtonInteraction, baseInteraction: ButtonInteraction) => {
        await baseInteraction.message.edit({
            content: RemoveMember(baseInteraction.message.content, interaction.user.id)
        })
        await interaction.update({
            content: `**✅ | Pomyślnie wypisano**`,
            components: []
        }).then(i => setTimeout(() => i.delete(), 3_000))
    }
}


export default {
    customId: 'open-enrollment-menu',
    execute: async (interaction: ButtonInteraction) => {
        const enrollmentContent: string = interaction.message.content
        const classOptions = TextToOptions(enrollmentContent)
        const isUserEnrolled = classOptions.map(option => option.memberID).includes(interaction.user.id)

        const moreThan25 = classOptions.length > 25

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('enrollment-select')
            .setPlaceholder('Wybierz klasę')
            .addOptions(...TextToOptions(enrollmentContent).filter(options => !options.memberID).map(option => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(option.class)
                    .setDescription(option.platoon)
                    .setValue(option.line.toString())
            ).slice(0, 25))

        const prevBtn = new ButtonBuilder()
            .setCustomId('prev')
            .setDisabled(true)
            .setLabel('⬅')
            .setStyle(ButtonStyle.Secondary)

        const nextBtn = new ButtonBuilder()
            .setCustomId('next')
            .setDisabled(!moreThan25)
            .setLabel('➡')
            .setStyle(ButtonStyle.Secondary)

        const unenroll = new ButtonBuilder()
            .setCustomId('unenroll')
            .setLabel('Wypisz się')
            .setStyle(ButtonStyle.Danger)


        const interactionResponse = await interaction.reply({
            ephemeral: true,
            components: [
                ...(!isUserEnrolled ? [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)]
                    : [new ActionRowBuilder<ButtonBuilder>().addComponents(unenroll)]), 
                ...(!isUserEnrolled && moreThan25 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn)] : [])],
            fetchReply: true
        })

        const interactionCollector = interactionResponse.createMessageComponentCollector({})

        interactionCollector.on('collect', collectorInteraction => {
            if (collectorInteraction.customId in CollectorInteractions)
                CollectorInteractions[collectorInteraction.customId as keyof typeof CollectorInteractions](collectorInteraction as never, interaction as ButtonInteraction)
        });
        
        interactionCollector.on('end', _collected => {});
    }
}