import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle, ButtonBuilder } from "npm:discord.js";

type EnrollmentOption = {
    platoon: string | undefined,
    class: string,
    memberID: string | undefined,
    line: number
}

type Platoon = {
    name: string,
    index: number
}

export const FormatText = (content: string): string => content.replaceAll(/^(?!- )(?!## )(?!-# )(.*)/gm, '## $1')

export const TextToOptions = (content: string): EnrollmentOption[] => {
    const platoons: Platoon[] = [...content.matchAll(/^(?!- )[^a-z0-9]*(.*)/gmi)].map(match => ({index: match.index, name: match[1]}))
    const classes = content.matchAll(/^- [^a-z0-9]*?(?:<@(\d+)> )?[^a-z0-9]*(.*)/gmi)

    const options: EnrollmentOption[] = []
    for (const element of classes) {
        options.push({
            platoon: platoons.filter(platoon => platoon.index < element.index).sort((a, b) => b.index - a.index)[0]?.name,
            class: element[2],
            memberID: element[1],
            line: content.substring(0, element.index).split('\n').length - 1
        })
    }

    return options
}

export const RemoveMember = (content: string, memberID: string): string => content.replace(`<@${memberID}> - `, '')
export const AddMember = (content: string, memberID: string, line: number): string => {
    const lines = content.split('\n')
    lines[line] = lines[line].replace(/(.*)/, `- <@${memberID}> $1`)
    return lines.join('\n')
}


export const Components = {
    EnrollmentSelect: (options: EnrollmentOption[], rangeStart: number): StringSelectMenuBuilder => 
        new StringSelectMenuBuilder()
            .setCustomId(`enrollment-select:${rangeStart}`)
            .setPlaceholder('Wybierz klasę' + (options.length > 25 ? ` (strona ${Math.floor(rangeStart / 25) + 1})` : ''))
            .addOptions(...options.map(option => {
                const selectoption = new StringSelectMenuOptionBuilder()
                    .setLabel(option.class.length > 100 ? option.class.substring(0, 100) : option.class)
                    .setValue(option.line.toString())
                if (option.platoon) selectoption.setDescription(option.platoon.length > 100 ? option.platoon.substring(0, 100) : option.platoon)
                return selectoption
            }).slice(rangeStart, rangeStart + 25)),
    NextBtn: (enabled: boolean): ButtonBuilder => new ButtonBuilder()
        .setCustomId('next')
        .setDisabled(!enabled)
        .setLabel('➡')
        .setStyle(ButtonStyle.Secondary),
    PrevBtn: (enabled: boolean): ButtonBuilder => new ButtonBuilder()
        .setCustomId('prev')
        .setDisabled(!enabled)
        .setLabel('⬅')
        .setStyle(ButtonStyle.Secondary),
}