import { MessageActionRowComponent, ActionRow, ComponentType } from 'npm:discord.js'


export const FindComponent = (actionRows: ActionRow<MessageActionRowComponent>[], componentType: ComponentType): MessageActionRowComponent | undefined => {
    for (const row of actionRows) {
        const component = row.components.find(component => component.data.type === componentType)
        if (component) return component
    }
    return undefined
}