import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const GeneralModule = findByProps("View");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: -1,
            opacity: 0.5
        }} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => { 
                // We're looking for the container that specifically has the message list content
                // usually identified by having flex: 1 and a specific pointerEvents or onLayout setup
                if (res?.props && 
                    StyleSheet.flatten(res.props.style)?.flex === 1 && 
                    res.props.onLayout &&
                    !res.props.accessibilityLabel // Avoid headers/top bars
                ) {
                    const children = React.Children.toArray(res.props.children);
                    
                    if (!children.some(c => c?.key === "chat-bg-layer-fixed")) { 
                        res.props.children = [
                            React.createElement(ChatBackground, { key: "chat-bg-layer-fixed" }),
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
