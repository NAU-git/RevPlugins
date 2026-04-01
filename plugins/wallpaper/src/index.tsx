import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;
const FlashListModule = findByProps("FlashList");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const ChatBackground = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1, opacity: 0.4 }]} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        if (FlashListModule?.FlashList) {
            // We patch the prototype to catch all instances (Chat, Pins, etc.)
            patches.push(after("render", FlashListModule.FlashList.prototype, function(args, res) {
                // Instead of wrapping 'res', we inject into the list's own container props
                if (res?.props) {
                    const originalRenderContainer = res.props.renderContentContainer;

                    // We wrap the content container specifically. 
                    // This stays INSIDE the RecyclerListView, avoiding the StickyContainer crash.
                    res.props.renderContentContainer = (props, children) => {
                        const container = originalRenderContainer ? originalRenderContainer(props, children) : <View {...props}>{children}</View>;
                        
                        return React.cloneElement(container, {
                            children: [
                                <ChatBackground key="chat-bg-layer" />,
                                ...React.Children.toArray(container.props.children)
                            ]
                        });
                    };
                }
                return res;
            }));
        }
    }, 
    onUnload: () => { 
        patches.forEach(p => p?.()); 
    } 
};
