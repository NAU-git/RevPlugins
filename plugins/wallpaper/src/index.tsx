import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const GeneralModule = findByProps("View");
const MessagesWrapper = findByProps("MessagesWrapper") || findByProps("MessageList");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1, opacity: 0.5 }]} 
        resizeMode="cover" 
    />
);

let patches = [];

function injectBackground(res, key) {
    if (!res?.props) return;
    const children = React.Children.toArray(res.props.children);
    if (!children.some(c => c?.key === key)) {
        res.props.children = [
            React.createElement(ChatBackground, { key }),
            ...children
        ];
    }
}

export default { 
    onLoad: () => {
        // 1. Target the Messages area specifically (The "Heavy Hitter")
        if (MessagesWrapper) {
            patches.push(after("default", MessagesWrapper, (args, res) => {
                injectBackground(res, "chat-bg-main");
                return res;
            }));
        }

        // 2. Keep your preferred General View patch as the global backup
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => {
                const style = StyleSheet.flatten(res?.props?.style);
                
                // Broad check for containers, but excluding things that are definitely not chat
                if (res?.props && style?.flex === 1 && res.props.onLayout && !res.props.accessibilityLabel) {
                    injectBackground(res, "chat-bg-fallback");
                }
                return res;
            }));
        }
    }, 
    onUnload: () => { 
        patches.forEach(p => p?.()); 
    } 
};
