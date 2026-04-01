import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps, findByDisplayName } from "@vendetta/metro";

const { View, Image, StyleSheet } = ReactNative;

// Direct targets for the chat area
const MessagesWrapper = findByProps("MessagesWrapperContainer") || findByProps("MessagesWrapper");
const GeneralModule = findByProps("View");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

const BackgroundElement = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1, opacity: 0.5 }]} 
        resizeMode="cover" 
    />
);

let patches = [];

export default { 
    onLoad: () => { 
        // 1. THE CHAT KILL-SHOT: Target the message wrapper specifically
        if (MessagesWrapper) {
            patches.push(after("default", MessagesWrapper, (args, res) => {
                if (!res?.props) return res;
                
                const children = React.Children.toArray(res.props.children);
                if (!children.some(c => c?.key === "chat-bg-final")) {
                    res.props.children = [
                        <BackgroundElement key="chat-bg-final" />,
                        ...children
                    ];
                    // Force the container to be transparent so our image shows through
                    res.props.style = [res.props.style, { backgroundColor: "transparent" }];
                }
                return res;
            }));
        }

        // 2. REFINED GLOBAL PATCH: Only hit actual "Screens"
        if (GeneralModule?.View) {
            patches.push(after("render", GeneralModule.View, (args, res) => {
                const props = res?.props;
                if (!props || props.accessibilityLabel || props.role) return res;

                const style = StyleSheet.flatten(props.style);
                
                // Only inject if it's a full-screen-ish view (ignoring small header bars)
                if (style?.flex === 1 && props.onLayout) {
                    const children = React.Children.toArray(props.children);
                    if (!children.some(c => c?.key === "global-bg-layer")) {
                        props.children = [
                            <BackgroundElement key="global-bg-layer" />,
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
