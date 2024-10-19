import { ApplicationCommandData, Interaction } from 'npm:discord.js'

export type Command = {
    data: ApplicationCommandData,
    execute: (interaction: Interaction) => void
}

export type Component = {
    customId: ApplicationCommandData,
    execute: (interaction: Interaction) => void
}