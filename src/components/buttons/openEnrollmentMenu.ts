import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, StringSelectMenuOptionBuilder } from 'npm:discord.js'
import { FormatText, TextToOptions } from '../../utils/enrollment.ts'


const CollectorInteractions = {
    'enrollment': (interaction) => {

    },
    'prev': (interaction) => {
        
    },
    'next': (interaction) => {
        
    }
}


export default {
    customId: 'open-enrollment-menu',
    execute: async (interaction: ButtonInteraction) => {
        const enrollmentContent: string = interaction.message.content
        const classOptions = TextToOptions(enrollmentContent)
        const moreThan25 = classOptions.length > 25

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('enrollment')
            .setPlaceholder('Wybierz klasę')
            .addOptions(...TextToOptions(enrollmentContent).filter(options => !options.memeberID).map(option => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(option.class)
                    .setDescription(option.platoon)
                    .setValue(option.line.toString())
            ).slice(0, 25))

        const prevBtn = new ButtonBuilder()
            .setCustomId('prev')
            .setDisabled(true)
            .setLabel('⬅')

        const nextBtn = new ButtonBuilder()
            .setCustomId('next')
            .setDisabled(!moreThan25)
            .setLabel('➡')

        const interactionResponse = await interaction.reply({
            ephemeral: true,
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu), 
                ...(moreThan25 ? [new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn)] : [])]
        })

        const interactionCollector = interactionResponse.createMessageComponentCollector({})

        interactionCollector.on('collect', collectorInteraction => {
            console.log(`Collected ${m.content}`);
        });
        
        interactionCollector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}