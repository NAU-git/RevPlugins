import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps, findByDisplayName } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const GeneralModule = findByProps("View");
// Target the internal message list components
const Messages = findByProps("Messages") || findByDisplayName("Messages", false);

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
        // 1. Target the actual Messages component - this is the "missing" chat area
        if (Messages) {
            patches.push(after("default", Messages, (args, res) => {
                if (!res?.props) return res;
                const children = React.Children.toArray(res.props.children);
                if (!children.some(c => c?.key === "chat-bg-internal")) {
                    res.props.children = [
                        <ChatBackground key="chat-bg-internal" />,
                        ...children
                    ];
                }
                return res;
            }));
        }

        // 2. Your preferred General View patch as the global catch-all
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => { 
                if (res?.props && StyleSheet.flatten(res.props.style)?.flex === 1 && res.props.onLayout) {
                    const children = React.Children.toArray(res.props.children);
                    if (!children.some(c => c?.key === "chat-bg-global")) { 
                        res.props.children = [
                            <ChatBackground key="chat-bg-global" />,
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
