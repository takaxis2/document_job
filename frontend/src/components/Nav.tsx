import { Link } from "react-router-dom";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"


export default function Nav() {
    return (
        // <div>
        //     {/* <div>네비게이션</div> */}
        //     <Link to="">Home</Link>
        //     <Link to="document">document</Link>
        //     <Link to="vendor">vendor</Link>
        //     <Link to="vendor-detail">vendor-detail</Link>
        //     <Link to="setting">setting</Link>
        // </div>
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link to="">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            홈
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link to="document">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            문서
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link to="vendor">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            거래처
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link to="vendor-detail">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            상세
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link to="setting">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            설정
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

    )
}
/**
 * 이거 나중에 menubar로 변경해도 될듯
 */