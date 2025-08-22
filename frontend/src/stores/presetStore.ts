import { create } from 'zustand'
import { models } from "../../wailsjs/go/models"
import { GetAllPresets, GetPresetByID } from '../../wailsjs/go/document/Document'
import { LogPrint } from '../../wailsjs/runtime/runtime';

// UI에서 치환 작업을 위해 사용하는 확장된 프리셋 아이템 타입

type OmitPresetModel = Omit<models.PresetModel, "convertValues">;

export interface UIPresetModel extends OmitPresetModel {
    items: UIPresetItem[];
}

export interface UIPresetItem extends models.PresetItem {
  value: string;
}

interface PresetStoreState {
    selectedPresets: UIPresetModel[]
    selectedPreset: UIPresetModel | null

    selectPreset: (id:number) => Promise<void>
    getPresets: () => Promise<void>
}

export const usePresetStore = create<PresetStoreState>((set) => ({
    selectedPresets: [],
    selectedPreset:null,

    selectPreset: async (id: number) => {
        try {
            const preset = await GetPresetByID(id);
            const uiPreset: UIPresetModel = {
                ...preset,
                items: preset.items.map(item => ({
                    ...item,
                    value: ""
                }))
            };
            // const editedPresetItem: UIPresetItem[] = preset.items.map(item => ({
            //     ...item,
            //     value:""
            // }));
            // preset.items = editedPresetItem;
            set({selectedPreset : uiPreset})

        } catch (error) {
            
        }
    },

    getPresets: async () => {
        try {
            LogPrint("프리셋을 불러오기.")
            const presets = await GetAllPresets();
            // LogPrint("프리셋 : "+JSON.stringify(presets, null, 2))
            const uiPresets: UIPresetModel[] = presets.map(preset => ({
                ...preset,
                items: preset.items!.map(item => ({
                    ...item,
                    value: ""
                }))
            }));

            set({selectedPresets : uiPresets})
        } catch (error) {
            LogPrint(`${error}`)
        }
    }

}))