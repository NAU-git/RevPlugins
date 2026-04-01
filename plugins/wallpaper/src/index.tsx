import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { View, Image, StyleSheet, Dimensions } = ReactNative;
const GeneralModule = findByProps("View");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

// Defined as a standalone Background Element
const BackgroundElement = () => (
    <View 
        pointerEvents="none" 
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
    >
        <Image 
            source={{ uri: BG_URL }} 
            style={{ width: "100%", height: "100%", opacity: 0.5 }} 
            resizeMode="cover" 
        />
    </View>
);

let patches = [];

export default { 
    onLoad: () => { 
        if (!GeneralModule?.View) return;

        patches.push(after("render", GeneralModule.View, (args, res) => { 
            if (!res?.props) return res;

            const style = StyleSheet.flatten(res.props.style);
            
            // Only target main containers (flex: 1)
            if (style?.flex === 1 && res.props.onLayout && !res.props.accessibilityLabel) {
                
                // FORCE TRANSPARENCY: If this is the chat container, 
                // any solid background color here will hide our image.
                if (style.backgroundColor) {
                    res.props.style = [res.props.style, { backgroundColor: "transparent" }];
                }

                const children = React.Children.toArray(res.props.children);
                if (!children.some(c => c?.key === "bg-element-layer")) {
                    res.props.children = [
                        <BackgroundElement key="bg-element-layer" />,
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
