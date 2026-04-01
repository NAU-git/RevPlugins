import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;

// We look for the FlashList or the specific Message list props
const FlashListModule = findByProps("FlashList");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: -1,
            opacity: 0.4
        }} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        // Hooking into FlashList ensures we are in the actual message area
        if (FlashListModule?.FlashList) {
            patches.push(after("render", FlashListModule.FlashList.prototype, (args, res) => {
                // If the list exists, we wrap it or inject the background into its container
                if (res?.props) {
                    const originalChildren = res.props.children;
                    
                    // Check to avoid double rendering
                    if (res.props.className !== "chat-bg-applied") {
                        res.props.className = "chat-bg-applied";
                        res.props.children = (
                            <View style={{ flex: 1 }}>
                                <ChatBackground />
                                {originalChildren}
                            </View>
                        );
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
