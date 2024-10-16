import { Checkbox } from "@/components/ui/checkbox"


export default function CCheckbox() {
    return (
        <div className="flex items-center space-x-2 p-2">
            <Checkbox id="SelectAll" />
            <label
                htmlFor="SelectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                전체 선택
            </label>
        </div>
    )
}