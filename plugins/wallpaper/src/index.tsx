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
        if (!GeneralModule?.View) return;

        patches.push(after("render", GeneralModule.View, (args, res) => { 
            if (!res?.props) return res;

            const style = StyleSheet.flatten(res.props.style);
            
            // This is the core logic you preferred, but we're broadening the 
            // 'Chat' detection to ensure it doesn't skip the message area.
            if (style?.flex === 1 && res.props.onLayout) {
                const children = React.Children.toArray(res.props.children);
                
                if (!children.some(c => c?.key === "chat-bg-layer-v3")) { 
                    res.props.children = [
                        <ChatBackground key="chat-bg-layer-v3" />,
                        ...children
                    ]; 
                } 
            } 
            return res; 
        })); 
    }, 
    onUnload: () => { 
        patches.forEach(p => p?.()); 
    } 
};
