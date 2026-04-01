import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const GeneralModule = findByProps("View");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1, opacity: 0.6 }]} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        // We patch the main View render to find the chat container
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => { 
                // We target the view that typically wraps the message list (flex: 1)
                if (res?.props && StyleSheet.flatten(res.props.style)?.flex === 1 && res.props.onLayout) {
                    const children = React.Children.toArray(res.props.children);
                    
                    // Prevent duplicate injections
                    if (!children.some(c => c?.key === "chat-bg-layer")) { 
                        res.props.children = [
                            React.createElement(ChatBackground, { key: "chat-bg-layer" }),
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

