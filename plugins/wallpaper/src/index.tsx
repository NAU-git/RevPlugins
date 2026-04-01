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
                const props = res?.props;
                if (!props) return res;

                const style = StyleSheet.flatten(props.style);

                // We target the chat by looking for the message list container 
                // and the main flex:1 views that wrap the UI.
                const isChatContainer = props.onLayout && !props.accessibilityLabel && style?.flex === 1;
                const isMessageList = props.className?.includes("message") || props.data;

                if (isChatContainer || isMessageList) {
                    const children = React.Children.toArray(props.children);
                    
                    if (!children.some(c => c?.key === "chat-bg-layer-final")) { 
                        res.props.children = [
                            React.createElement(ChatBackground, { key: "chat-bg-layer-final" }),
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
