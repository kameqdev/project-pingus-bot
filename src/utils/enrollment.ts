type EnrollmentOption = {
    platoon: string,
    class: string,
    memeberID: string | undefined,
    line: number
}

type Platoon = {
    name: string,
    index: number
}

export const FormatText = (content: string): string => content.replaceAll(/^([^- ].*)/gm, '## $1')

export const TextToOptions = (content: string): EnrollmentOption[] => {
    const platoons: Platoon[] = [...content.matchAll(/^#*\s?([^- ].*)/gm)].map(match => ({index: match.index, name: match[1]}))
    const classes = content.matchAll(/^- (?:<@(\d+)> - )?(.*)/gm)

    const options: EnrollmentOption[] = []
    for (const element of classes) {
        options.push({
            platoon: platoons.filter(platoon => platoon.index < element.index).sort((a, b) => b.index - a.index)[0].name,
            class: element[2],
            memeberID: element[1],
            line: content.substring(0, element.index).split('\n').length
        })
    }

    return options
}