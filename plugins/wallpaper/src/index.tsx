import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const GeneralModule = findByProps("View");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1, opacity: 0.5 }]} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => { 
                const style = StyleSheet.flatten(res?.props?.style);

                // TARGETING LOGIC:
                // 1. Must be flex: 1 (Main containers)
                // 2. Must have onLayout (Dynamic screens)
                // 3. EXCLUDE components with backgroundColors (Like headers/popups)
                // 4. EXCLUDE small heights (To avoid catching the top bar again)
                if (
                    res?.props && 
                    style?.flex === 1 && 
                    res.props.onLayout && 
                    !style?.backgroundColor &&
                    !res.props.accessibilityLabel
                ) {
                    const children = React.Children.toArray(res.props.children);
                    
                    if (!children.some(c => c?.key === "chat-bg-layer-v2")) { 
                        res.props.children = [
                            React.createElement(ChatBackground, { key: "chat-bg-layer-v2" }),
                            ...children
                        ]; 
                    } 
                } 
                return res; 
            })); 
        }
    }, 
    onUnload: () => { 
        patches.forEach(p => p?.()); 
    } 
};
