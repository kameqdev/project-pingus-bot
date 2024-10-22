import { ComponentType, ButtonStyle, StringSelectMenuInteraction, ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } from 'npm:discord.js'
import { TextToOptions, RemoveMember, AddMember, Components } from '../../utils/enrollment.ts'
import { FindComponent } from '../../utils/misc.ts'

declare module 'npm:discord.js' { interface ButtonInteraction { range: number[] } }



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

        if (!options.some(option => !option.memberID))
            return interaction.update({
                content: `**❌ | Brak wolnych miejsc**`,
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
    'prev': async (interaction: ButtonInteraction, baseInteraction: ButtonInteraction) => {
        const availableOptions = TextToOptions(baseInteraction.message.content).filter(options => !options.memberID)
        const begin: number = +((FindComponent(interaction.message.components, ComponentType.StringSelect)?.data as { custom_id: string })?.custom_id?.split(':')?.[1] ?? 0)
        const newBegin = begin - 25 < 0 ? 0 : begin - 25

        await interaction.update({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(Components.EnrollmentSelect(availableOptions, newBegin)),
                new ActionRowBuilder<ButtonBuilder>().addComponents(Components.PrevBtn(newBegin > 0), Components.NextBtn(availableOptions.length > newBegin + 25))
            ]
        })
    },
    'next': async (interaction: ButtonInteraction, baseInteraction: ButtonInteraction) => {
        const availableOptions = TextToOptions(baseInteraction.message.content).filter(options => !options.memberID)
        const begin: number = +((FindComponent(interaction.message.components, ComponentType.StringSelect)?.data as { custom_id: string })?.custom_id?.split(':')?.[1] ?? 0)
        const newBegin = availableOptions.length > begin + 25 ? begin + 25 : begin

        await interaction.update({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(Components.EnrollmentSelect(availableOptions, newBegin)),
                new ActionRowBuilder<ButtonBuilder>().addComponents(Components.PrevBtn(newBegin > 0), Components.NextBtn(availableOptions.length > newBegin + 25))
            ]
        })
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
        const isAnySlotAvailable = classOptions.some(option => !option.memberID)
        const moreThan25 = classOptions.length > 25

        const selectMenu = Components.EnrollmentSelect(classOptions.filter(options => !options.memberID), 0)

        const prevBtn = Components.PrevBtn(false)

        const nextBtn = Components.NextBtn(moreThan25)

        const unenroll = new ButtonBuilder()
            .setCustomId('unenroll')
            .setLabel('Wypisz się')
            .setStyle(ButtonStyle.Danger)

        if (!isAnySlotAvailable && !isUserEnrolled) {
            return await interaction.reply({
                ephemeral: true,
                content: '**❌ | Brak wolnych miejsc**'
            }).then(i => setTimeout(() => i.delete(), 3_000))
        }

        const interactionResponse = await interaction.reply({
            ephemeral: true,
            components: [
                ...(isAnySlotAvailable && !isUserEnrolled ? [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)]
                    : [new ActionRowBuilder<ButtonBuilder>().addComponents(unenroll)]), 
                ...(!isUserEnrolled && moreThan25 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn)] : [])],
            fetchReply: true
        })

        const interactionCollector = interactionResponse.createMessageComponentCollector({})

        interactionCollector.on('collect', async collectorInteraction => {
            if (collectorInteraction.customId.split(':')[0] in CollectorInteractions)
                await CollectorInteractions[collectorInteraction.customId.split(':')[0] as keyof typeof CollectorInteractions](collectorInteraction as never, interaction as ButtonInteraction)
        });
        
        interactionCollector.on('end', _collected => {});
    }
}