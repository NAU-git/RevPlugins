import { after } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { React, ReactNative } from "@vendetta/metro/common";

const { View, Image, StyleSheet } = ReactNative;

interface BackgroundProps {
    key?: string;
    children?: any[];
    style?: any;
}

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

// Component for the background
const BackgroundElement = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]} 
        resizeMode="cover" 
    />
);

let patches: Function[] = [];

export default { 
    onLoad: () => { 
        // findByName returns the component directly. 
        // AppBackground is the most stable target for global images.
        const AppBackground = findByName("AppBackground", false);

        if (AppBackground) {
            patches.push(after("default", AppBackground, (_args, res) => {
                if (!res?.props) return res;

                const children = res.props.children;

                if (Array.isArray(children)) {
                    // Check if already injected
                    if (!children.some((c: any) => c?.key === "vendetta-bg-layer")) {
                        children.unshift(
                            <BackgroundElement key="vendetta-bg-layer" />
                        );
                    }
                }
                
                // Force transparency on the container
                res.props.style = [res.props.style, { backgroundColor: "transparent" }];
                
                return res;
            }));
        }
    }, 
    onUnload: () => { 
        patches.forEach(unpatch => unpatch?.()); 
    } 
};
